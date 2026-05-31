"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import api from "@/lib/api.client";
import { extractFieldErrors } from "@/lib/utils";

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
import ManagerCombobox from "./ManagerCombobox";

type Props = {
  mode: "create" | "edit";
  warehouseId?: number;
};

type Status = "active" | "inactive" | (string & {});
type Manager = { id: number; name: string };

type MetaRes = {
  statuses?: Status[];
  managers?: Manager[]; // prefer this if API returns it
  users?: { id: number; name: string }[]; // fallback if backend names it "users"
  employees?: { id: number; name: string }[]; // fallback
  // sometimes backends put meta under "warehouse" or "warehouses" – we ignore for meta
};

type WarehouseAPI = {
  id: number;
  name: string;
  type: "Product" | "Finished Goods" | "Raw Material" | string;
  address: string | null;
  manager_id: number | null;
  contact_number?: string | null;
  capacity?: number | null;
  status: Status;
};

const TYPE_OPTIONS: Array<WarehouseAPI["type"]> = [
  "Product",
  "Finished Goods",
  "Raw Material",
];

export default function WarehouseForm({ mode, warehouseId }: Props) {
  const t = useTranslations("");
  const router = useRouter();
  const isEdit = mode === "edit";

  // ---------- meta ----------
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [statuses, setStatuses] = useState<Status[]>(["active", "inactive"]);

  // ---------- form ----------
  const [formValues, setFormValues] = useState<{
    name: string;
    type: WarehouseAPI["type"] | "";
    address: string;
    manager_id: number | "";
    contact_number: string;
    capacity: string;
    status: Status;
  }>({
    name: "",
    type: "",
    address: "",
    manager_id: "",
    contact_number: "",
    capacity: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ---------- meta loaders ----------
  const normalizeManagers = (res: any): Manager[] => {
    if (Array.isArray(res?.managers)) return res.managers;
    if (Array.isArray(res?.users)) return res.users;
    if (Array.isArray(res?.employees)) return res.employees;
    return [];
  };

  const loadCreateMeta = async () => {
    setLoadingMeta(true);
    try {
      const res = await api.get<MetaRes>("/admin/warehouses/create");
      const data = res?.data ?? {};

      const ms = normalizeManagers(data);
      if (ms.length) setManagers(ms);

      if (Array.isArray(data.statuses)) {
        const ss = data.statuses.filter((s) =>
          ["active", "inactive"].includes(s as string)
        ) as Status[];
        if (ss.length) setStatuses(ss);
      }
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadEditData = async (id: number) => {
    setLoadingMeta(true);
    try {
      const res = await api.get(`/admin/warehouses/${id}/edit`);

      // meta
      const ms = normalizeManagers(res?.data);
      if (ms.length) setManagers(ms);

      if (Array.isArray(res?.data?.statuses)) {
        const ss = (res.data.statuses as Status[]).filter((s) =>
          ["active", "inactive"].includes(s as string)
        );
        if (ss.length) setStatuses(ss);
      }

      // warehouse
      const w: WarehouseAPI | undefined =
        res?.data?.warehouse || res?.data?.data || res?.data?.Warehouse;

      if (w) {
        setFormValues({
          name: w.name ?? "",
          type: (w.type as WarehouseAPI["type"]) || "",
          address: w.address ?? "",
          manager_id: w.manager_id ?? "",
          contact_number: w.contact_number ?? "",
          capacity:
            typeof w.capacity === "number" && isFinite(w.capacity)
              ? String(w.capacity)
              : "",
          status: (w.status as Status) ?? "active",
        });
      }
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (isEdit && warehouseId) {
      void loadEditData(warehouseId);
    } else {
      void loadCreateMeta();
    }
  }, [isEdit, warehouseId]);

  // ---------- helpers ----------
  const onChange =
    (key: keyof typeof formValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormValues((p) => ({ ...p, [key]: value }));
      if (formErrors[key as string]) clearFieldError(key as string);
    };

  const onChangeNumberString =
    (key: "capacity" | "contact_number") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // allow digits + plus + spaces for phone, digits only for capacity
      const raw = e.target.value;
      const valid =
        key === "contact_number"
          ? /^[\d +()-]*$/.test(raw)
          : raw === "" || /^\d+$/.test(raw);
      if (!valid) return;
      setFormValues((p) => ({ ...p, [key]: raw }));
      if (formErrors[key]) clearFieldError(key);
    };

  const clearFieldError = (k: string) =>
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });

  // ---------- validation ----------
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formValues.name.trim()) e.name = t("fieldRequired");
    if (!formValues.type || !TYPE_OPTIONS.includes(formValues.type as any))
      e.type = t("fieldRequired");
    if (!formValues.address.trim()) e.address = t("fieldRequired");
    if (formValues.manager_id === "") e.manager_id = t("fieldRequired");
    if (!["active", "inactive"].includes(formValues.status))
      e.status = t("fieldRequired");
    if (!formValues.contact_number.trim())
      e.contact_number = t("fieldRequired");
    if (!formValues.capacity) e.capacity = t("fieldRequired");
    if (formValues.capacity && !/^\d+$/.test(formValues.capacity))
      e.capacity = t("enterValidNumber");

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- submit ----------
  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formValues.name.trim(),
        type: formValues.type, // required by POST/PUT
        address: formValues.address.trim(),
        manager_id: formValues.manager_id || null,
        contact_number: formValues.contact_number.trim(),
        capacity: formValues.capacity ? Number(formValues.capacity) : null,
        status: formValues.status,
      };

      if (isEdit && warehouseId) {
        await api.put(`/admin/warehouses/${warehouseId}`, payload);
        toast.success(t("warehouseUpdated"));
      } else {
        await api.post(`/admin/warehouses`, payload);
        toast.success(t("warehouseCreated"));
      }
      router.push("/dashboard/warehouses");
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};
      if (Object.keys(fieldErrors).length) {
        setFormErrors(fieldErrors);
      } else {
        toast.error(
          err?.response?.data?.message ||
            (isEdit ? t("updateFailed") : t("createFailed"))
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href={"/dashboard/warehouses"}
          className="ty-body-sm text-primary-700 w-fit"
        >
          ← {t("Back to {cap}", { cap: t("Warehouse") })}
        </Link>

        <h1 className="ty-body-xl-2 text-primary-700">
          {isEdit ? t("Edit Warehouse") : t("Add Warehouse")}
        </h1>
      </div>

      <form onSubmit={onSubmit} aria-busy={submitting}>
        <div className="rounded-2xl bg-white p-6 space-y-5">
          <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
            {t("Basic Information")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t("Warehouse Name")}
              placeholder={t("enter warehouse name")}
              value={formValues.name}
              onChange={onChange("name")}
              disabled={submitting || loadingMeta}
              error={formErrors.name}
            />

            {/* Type (required by POST/PUT spec) */}
            <div>
              <Label>{t("Type")}</Label>
              <Select
                value={formValues.type || ""}
                onValueChange={(v) => {
                  setFormValues((p) => ({
                    ...p,
                    type: v as WarehouseAPI["type"],
                  }));
                  if (formErrors.type) clearFieldError("type");
                }}
                disabled={submitting || loadingMeta}
              >
                <SelectTrigger
                  className={
                    "mt-4 " + `${formErrors.type ? "border-red-500" : ""}`
                  }
                >
                  <SelectValue placeholder={t("selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {t(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="mt-1 text-sm text-destructive text-start">
                  {formErrors.type}
                </p>
              )}
            </div>

            <Input
              label={t("Address Location")}
              placeholder={t("enter address location")}
              value={formValues.address}
              onChange={onChange("address")}
              disabled={submitting || loadingMeta}
              error={formErrors.address}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manager */}
            <div>
              <Label>{t("Manager")}</Label>
              <div className="mt-4">
                <ManagerCombobox
                  value={formValues.manager_id}
                  onChange={(id) => {
                    setFormValues((p) => ({
                      ...p,
                      manager_id: id === "" ? "" : Number(id),
                    }));
                    if (formErrors.manager_id) clearFieldError("manager_id");
                  }}
                  placeholder={t("select a manager")}
                  disabled={submitting || loadingMeta}
                  status="active"
                  t={t}
                  hasError={Boolean(formErrors.manager_id)}
                />
              </div>
              {formErrors.manager_id && (
                <p className="mt-1 text-sm text-destructive text-start">
                  {formErrors.manager_id}
                </p>
              )}
            </div>

            <Input
              label={t("Contact Number")}
              placeholder={t("add contact number")}
              value={formValues.contact_number}
              onChange={onChangeNumberString("contact_number")}
              disabled={submitting || loadingMeta}
              error={formErrors.contact_number}
            />

            <Input
              label={t("Capacity")}
              placeholder={t("add capacity number")}
              value={formValues.capacity}
              onChange={onChangeNumberString("capacity")}
              disabled={submitting || loadingMeta}
              error={formErrors.capacity}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <Label>{t("Status")}</Label>
              <Select
                value={formValues.status}
                onValueChange={(v) => {
                  if (v !== "active" && v !== "inactive") return;
                  setFormValues((p) => ({ ...p, status: v as Status }));
                  if (formErrors.status) clearFieldError("status");
                }}
                disabled={submitting || loadingMeta}
              >
                <SelectTrigger
                  className={
                    "mt-4 " + `${formErrors.status ? "border-red-500" : ""}`
                  }
                >
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {(statuses.length
                    ? statuses
                    : (["active", "inactive"] as Status[])
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(s === "active" ? "Active" : "in-active")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.status && (
                <p className="mt-1 text-sm text-destructive text-start">
                  {formErrors.status}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
            )}
            {t("Save Warehouse")}
          </Button>
        </div>
      </form>
    </div>
  );
}
