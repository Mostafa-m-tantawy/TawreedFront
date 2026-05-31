"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api.client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { AddSquare } from "iconsax-reactjs";
import MultiSelect from "@/components/ui/multi-select";

type Party = "supplier" | "customer";

type FormState = {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_number: string;
  notes: string;
  status: string;
  code: string; // phone country code UI only
  custom_fields: { name: string; value: string }[];
  groups: number[];
};

type GroupOption = { id: number; name: string };

type Errors = Partial<
  Record<keyof FormState | `custom_fields.${number}.name`, string>
>;

export default function CommonMasterDataForm({
  party,
  mode,
  id,
  onSuccess,
  showBack,
}: {
  party: Party;
  mode: "create" | "edit";
  id?: number;
  onSuccess?: () => void;
  showBack?: React.ReactNode;
}) {
  const t = useTranslations("");
  const isEdit = mode === "edit";
  const cap = party === "supplier" ? t("Supplier") : t("Customer");

  const [form, setForm] = React.useState<FormState>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    tax_number: "",
    notes: "",
    status: "active",
    code: "+02",
    custom_fields: [],
    groups: [],
  });

  const [statuses, setStatuses] = React.useState<string[]>([
    "active",
    "inactive",
  ]);
  const [groupOptions, setGroupOptions] = React.useState<GroupOption[]>([]);

  const [errors, setErrors] = React.useState<Errors>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);

  // --- Custom Field Dialog state ---
  const [cfOpen, setCfOpen] = React.useState(false);
  const [cfDraft, setCfDraft] = React.useState<{ name: string; value: string }>(
    { name: "", value: "" }
  );
  const [cfError, setCfError] = React.useState<string>("");

  // Endpoints
  const base = `/admin/${party}s`;
  const endpoints = {
    createMeta: `${base}/create`,
    editGet: id ? `${base}/${id}/edit` : "",
    post: base,
    put: id ? `${base}/${id}` : "",
  };

  // Load meta + edit data
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (!isEdit) {
          try {
            const meta = await api.get(endpoints.createMeta);
            if (!cancelled && Array.isArray(meta?.data?.status)) {
              setStatuses(meta.data.status);
            }

            if (!cancelled && Array.isArray(meta?.data?.groups)) {
              setGroupOptions(
                meta.data.groups.map((g: any) => ({ id: g.id, name: g.name }))
              );
            }
          } catch {
            /* fallback statuses already set */
          }
        }

        // edit data
        if (isEdit && id) {
          const resp = await api.get(endpoints.editGet);
          const record = resp.data?.[party]; // "supplier" | "customer"
          if (!cancelled && record) {
            setForm((prev) => ({
              ...prev,
              name: record.name ?? "",
              contact_person: record.contact_person ?? "",
              phone: record.phone ?? "",
              email: record.email ?? "",
              address: record.address ?? "",
              tax_number: record.tax_number ?? "",
              notes: record.notes ?? "",
              status: (record.status as "active" | "inactive") ?? "active",
              custom_fields: record.custom_fields ?? [],
              groups: Array.isArray(record.groups)
                ? record.groups.map((g: any) =>
                    typeof g === "number" ? g : g.id
                  )
                : [],
            }));

            if (Array.isArray(resp.data?.status)) {
              setStatuses(resp.data.status);
            }
            if (Array.isArray(resp.data?.groups)) {
              setGroupOptions(
                resp.data.groups.map((g: any) => ({ id: g.id, name: g.name }))
              );
            }
          }
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || t("loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isEdit, id, party]);

  // Basic onChange
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Remove custom field
  const removeCustomField = (i: number) =>
    setForm((f) => ({
      ...f,
      custom_fields: f.custom_fields.filter((_, idx) => idx !== i),
    }));

  // Minimal validator (manual)
  const validate = (): boolean => {
    const e: Errors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) e.name = t("required");
    if (!form.contact_person.trim()) e.contact_person = t("required");
    if (!form.phone.trim()) e.phone = t("required");
    if (!form.email.trim()) e.email = t("required");
    else if (!emailRe.test(form.email.trim())) e.email = t("invalidEmail");
    if (!form.address.trim()) e.address = t("required");

    // custom field names required if row exists
    form.custom_fields.forEach((cf, i) => {
      if (!cf.name.trim()) e[`custom_fields.${i}.name`] = t("required");
    });

    if (!form.groups || form.groups.length === 0) e.groups = t("required");

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        groups: (form.groups ?? []).map(Number),
        custom_fields: form.custom_fields.length ? form.custom_fields : [],
      };

      if (isEdit && id) {
        await api.put(endpoints.put, payload);
        toast.success(t("updatedSuccessfully"));
      } else {
        await api.post(endpoints.post, payload);
        toast.success(t("createdSuccessfully"));
      }
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  // --- helpers for consistent error (same as Input "name" field) ---
  const fieldError = (msg?: string) =>
    msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3">
        {showBack}
        <h1 className="ty-body-xl-2 text-primary-700">
          {isEdit ? t("Edit {cap}", { cap }) : t("Add {cap}", { cap })}
        </h1>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white p-6">
        <p className="mb-4 border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
          {t("Basic Info")}
        </p>

        <form
          onSubmit={onSubmit}
          className="space-y-4"
          aria-busy={loading || saving}
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Input
                placeholder={
                  party === "supplier"
                    ? t("enter supplier name")
                    : t("enter customer name")
                }
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                label={
                  party === "supplier" ? t("Supplier Name") : t("Customer Name")
                }
                error={errors["name"]}
              />
            </div>

            <div className="grid gap-2">
              <Input
                placeholder={t("enter contact person")}
                value={form.contact_person}
                onChange={(e) => setField("contact_person", e.target.value)}
                label={t("Contact Person")}
                error={errors["contact_person"]}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("Phone number")}</Label>
              <div>
                {/* <Select
                  value={form.code}
                  onValueChange={(v) => setField("code", v as string)}
                >
                  <SelectTrigger className="!border-r-0 !rounded-r-none">
                    <SelectValue placeholder="+02" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+02">+02</SelectItem>
                    <SelectItem value="+20">+20</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                  </SelectContent>
                </Select> */}
                <Input
                  placeholder={t("Phone Number")}
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
              {fieldError(errors["phone"])}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Input
                placeholder={t("enter email address")}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                label={`${t("Email Address")} *`}
                error={errors["email"]}
              />
            </div>

            {party === "supplier" ? (
              <div>
                <Input
                  placeholder={t("enter tax number")}
                  value={form.tax_number}
                  onChange={(e) => setField("tax_number", e.target.value)}
                  label={t("Tax Number")}
                  error={errors["tax_number"]}
                />
              </div>
            ) : (
              <div>
                <Label>{t("Status")}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setField("status", v as "active" | "inactive")
                  }
                >
                  <SelectTrigger className="mt-4">
                    <SelectValue placeholder={t("selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === "active" ? t("Active") : t("in-active")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError(errors["status"])}
              </div>
            )}

            <div>
              {party === "supplier" ? (
                <>
                  <Label>{t("Status")}</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setField("status", v as "active" | "inactive")
                    }
                  >
                    <SelectTrigger className="mt-4">
                      <SelectValue placeholder={t("selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === "active" ? t("Active") : t("in-active")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError(errors["status"])}
                </>
              ) : (
                <Input
                  placeholder={t("enter customer address")}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  label={`${t("Address")} *`}
                  error={errors["address"]}
                />
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {party === "supplier" ? (
              <>
                <Input
                  placeholder={t("enter supplier address")}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  label={`${t("Address")} *`}
                  error={errors["address"]}
                />
                <Input
                  placeholder={t("write a note")}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  label={t("Note")}
                  error={errors["notes"]}
                />
              </>
            ) : (
              <>
                <Input
                  placeholder={t("enter tax number")}
                  value={form.tax_number}
                  onChange={(e) => setField("tax_number", e.target.value)}
                  label={t("Tax Number")}
                  error={errors["tax_number"]}
                />
                <Input
                  placeholder={t("write a note")}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  label={t("Note")}
                  error={errors["notes"]}
                />
              </>
            )}
            {groupOptions.length > 0 && (
              <div>
                <MultiSelect
                  label={t("Groups")}
                  placeholder={t("Select groups")}
                  options={groupOptions}
                  value={form.groups}
                  onChange={(next) => setField("groups", next)}
                  error={errors["groups"]}
                  multiple={false}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          {form.custom_fields.length > 0 && (
            <div className="col-span-full">
              <h4 className="mb-2 ty-body-md-2">{t("Custom Fields")}</h4>
              <div className="w-full grid gap-3">
                {form.custom_fields.map((cf, i) => (
                  <div
                    key={`${cf.name}-${i}`}
                    className="grid grid-cols-1 gap-2 md:grid-cols-5"
                  >
                    <Input
                      className="md:col-span-2"
                      value={cf.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((f) => {
                          const arr = [...f.custom_fields];
                          arr[i] = { ...arr[i], name };
                          return { ...f, custom_fields: arr };
                        });
                        if (errors[`custom_fields.${i}.name` as const]) {
                          setErrors((er) => ({
                            ...er,
                            [`custom_fields.${i}.name`]: undefined,
                          }));
                        }
                      }}
                      placeholder={t("Field Name")}
                      label={t("Field Name")}
                      error={errors[`custom_fields.${i}.name` as const]}
                    />
                    <Input
                      className="md:col-span-2"
                      value={cf.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((f) => {
                          const arr = [...f.custom_fields];
                          arr[i] = { ...arr[i], value };
                          return { ...f, custom_fields: arr };
                        });
                      }}
                      placeholder={t("Field Value")}
                      label={t("Field Value")}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeCustomField(i)}
                      >
                        {t("Remove")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="flex justify-between gap-4 flex-wrap">
        {/* Custom Fields */}
        <div className="space-y-3">
          <Dialog
            open={cfOpen}
            onOpenChange={(o) => {
              setCfOpen(o);
              if (!o) {
                setCfDraft({ name: "", value: "" });
                setCfError("");
              }
            }}
          >
            <button
              type="button"
              className="px-8 py-4 h-16 bg-white rounded-2xl flex-center gap-2 border border-secondary-300 border-dashed ty-body-md-2 text-secondary-500"
              onClick={() => setCfOpen(true)}
            >
              <AddSquare size={24} /> {t("Add Custom Field")}
            </button>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-center">
                  <span className="text-secondary-700 ty-body-xl-2">
                    {t("Add Custom Field")}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <Input
                  label={t("Field Name")}
                  placeholder={t("Field Name")}
                  value={cfDraft.name}
                  onChange={(e) => {
                    setCfDraft((d) => ({ ...d, name: e.target.value }));
                    if (cfError) setCfError("");
                  }}
                  error={cfError || undefined}
                />
                <Input
                  label={t("Field Value")}
                  placeholder={t("Field Value")}
                  value={cfDraft.value}
                  onChange={(e) =>
                    setCfDraft((d) => ({ ...d, value: e.target.value }))
                  }
                />
              </div>

              <DialogFooter className="grid grid-cols-2 gap-2 mt-4">
                <DialogClose asChild>
                  <Button type="button" size="lg" variant="secondary">
                    {t("cancel")}
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => {
                    if (!cfDraft.name.trim()) {
                      setCfError(t("required"));
                      return;
                    }
                    setForm((f) => ({
                      ...f,
                      custom_fields: [...f.custom_fields, cfDraft],
                    }));
                    setCfDraft({ name: "", value: "" });
                    setCfError("");
                    setCfOpen(false);
                  }}
                >
                  {t("save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <Button
            type="button"
            size={"lg"}
            disabled={saving || loading}
            onClick={onSubmit}
          >
            {isEdit
              ? t("Save Changes")
              : party === "supplier"
              ? t("Save Supplier")
              : t("Save Customer")}
          </Button>
        </div>
      </div>
    </div>
  );
}
