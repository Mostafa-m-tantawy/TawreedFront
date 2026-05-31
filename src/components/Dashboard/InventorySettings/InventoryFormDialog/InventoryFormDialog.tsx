"use client";

import { useEffect, useMemo, useState } from "react";
import { AddCircle } from "iconsax-reactjs";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api.client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { extractFieldErrors } from "@/lib/utils";
import { Inventory } from "@/types/inventory";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildInitialValues,
  normalizeItemToFormValues,
  normalizeTranslationErrorKeys,
  toOptionParts,
} from "./helpers";
import { Textarea } from "@/components/ui/textarea";
import AttributeValuesInput from "./AttributeValuesInput";
import CategoryTreeSelect from "../CategoryTreeSelect";

type Props = {
  mode?: "create" | "edit";
  inventoryIdToEdit?: number;
  inventoryType: any;
  initialInventory?: Pick<Inventory, "name">;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

const InventoryFormDialog: React.FC<Props> = ({
  mode = "create",
  inventoryIdToEdit,
  inventoryType,
  initialInventory,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}) => {
  const t = useTranslations("");
  const isRTL = useLocale() === "ar";
  const isEdit = mode === "edit";

  const isControlled = typeof controlledOpen === "boolean";
  const [innerOpen, setInnerOpen] = useState(false);
  const open = isControlled ? (controlledOpen as boolean) : innerOpen;
  const setOpen = (v: boolean) =>
    isControlled ? onOpenChange?.(v) : setInnerOpen(v);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<any>({});

  const getFormData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const editData = inventoryType.endpoints.editData(inventoryIdToEdit);
      const apiEndpoint = isEdit
        ? editData.endpoint
        : inventoryType.endpoints.createData;

      const res = await api.get(apiEndpoint);
      const resData = res.data ?? {};

      if (isEdit) {
        const itemKey = editData.itemKey;
        const item = resData[itemKey];

        if (item) {
          const seeded = buildInitialValues(
            inventoryType.formFields ?? [],
            item
          );
          const normalized = normalizeItemToFormValues(
            inventoryType.formFields ?? [],
            item
          );

          setFormValues({ ...seeded, ...normalized });
        }
      }
      if (resData?.productCategories) {
        resData.categories = resData.productCategories;
        delete resData.productCategories;
      }

      setFormData(resData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setFormValues(
      buildInitialValues(inventoryType.formFields ?? [], initialInventory)
    );
    setFormErrors({});
    getFormData();
  }, [open]);

  const setField = (key: string, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setTranslatedField = (
    key: string,
    locale: string,
    value: string | number
  ) => {
    setFormValues((prev: any) => ({
      ...prev,
      [key]: { ...(prev?.[key] ?? {}), [locale]: value },
    }));
    setFormErrors((prev) => {
      const errKey = `${key}.${locale}`;
      if (!prev[errKey]) return prev;
      const next = { ...prev };
      delete next[errKey];
      return next;
    });
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    for (const field of inventoryType.formFields ?? []) {
      const v = formValues[field.key];

      if (field.type === "text" && field.hasTranslation) {
        const locales = Object.keys(field.value ?? {});
        for (const loc of locales) {
          const val = (v?.[loc] ?? "").toString().trim();
          if (field.required && !val)
            errors[`${field.key}.${loc}`] = t("fieldRequired");
          if (val.length > 255)
            errors[`${field.key}.${loc}`] = t("nameTooLong255");
        }
      } else if (field.type === "number") {
        const num = v === "" ? NaN : Number(v);
        if (field.required && (isNaN(num) || `${v}`.trim() === "")) {
          errors[field.key] = t("fieldRequired");
        }
        if (field.child) {
          const childVal = formValues[field.child.key];
          const needsChild = !isNaN(num);
          if (needsChild && field.child.required && !childVal) {
            errors[field.child.key] = t("fieldRequired");
          }
        }
      } else {
        if (field.required) {
          const empty =
            v === undefined ||
            v === null ||
            (typeof v === "string" && v.trim() === "");
          if (empty) errors[field.key] = t("fieldRequired");
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const payload = useMemo(() => {
    const out: Record<string, any> = {};
    for (const f of inventoryType.formFields ?? []) {
      let v = formValues[f.key];

      if (f.type === "number" || f.key.endsWith("_id")) {
        v = v === "" ? null : Number(v);
      }

      out[f.key] = v;

      if (f.child) {
        let cv = formValues[f.child.key];
        if (f.child.key.endsWith("_id")) {
          cv = cv === "" ? null : Number(cv);
        }
        out[f.child.key] = cv;
      }
    }
    return out;
  }, [formValues, inventoryType.formFields]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const apiEndpoint = isEdit
        ? inventoryType.endpoints.update + `/${inventoryIdToEdit}`
        : inventoryType.endpoints.create;

      const method = isEdit ? api.put : api.post;
      await method(apiEndpoint, payload);

      toast.success(isEdit ? t("updateSuccess") : t("createSuccess"));
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      const rawFieldErrors =
        extractFieldErrors?.(err) ??
        err?.response?.data?.errors ??
        err?.response?.data ??
        {};

      const normalized = normalizeTranslationErrorKeys(
        rawFieldErrors,
        inventoryType.formFields ?? []
      );

      if (Object.keys(normalized).length > 0) {
        setFormErrors(normalized);

        const firstKey = Object.keys(normalized)[0];
        const [fieldKey, loc] = firstKey.split(".");
        const id = loc ? `${fieldKey}-${loc}` : fieldKey;
        setTimeout(() => document?.getElementById(id)?.focus(), 0);
      } else {
        toast.error(
          err?.response?.data?.message ||
            (isEdit ? t("updateItemFailed") : t("createInventoryFailed"))
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderText = (field: any) => {
    if (field.hasTranslation) {
      const locales = Object.keys(field.value ?? { en: "" });
      return (
        <div
          className={locales.length > 1 ? "grid sm:grid-cols-2 gap-4" : ""}
          key={field.key}
        >
          {locales.map((loc: string) => (
            <div key={`${field.key}.${loc}`} className="space-y-1">
              <Input
                label={t(field.name)}
                id={`${field.key}-${loc}`}
                value={formValues?.[field.key]?.[loc] ?? ""}
                onChange={(e) =>
                  setTranslatedField(field.key, loc, e.target.value)
                }
                placeholder={t(field.name)}
                error={formErrors[`${field.key}.${loc}`]}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2" key={field.key}>
        <Input
          id={field.key}
          label={t(field.name)}
          value={formValues[field.key] ?? ""}
          onChange={(e) => setField(field.key, e.target.value)}
          placeholder={t(field.name)}
          error={formErrors[field.key]}
        />
      </div>
    );
  };

  const renderTextarea = (field: any) => {
    if (field.hasTranslation) {
      const locales = Object.keys(field.value ?? { en: "" });
      return (
        <div key={field.key} className="space-y-3">
          {locales.map((loc: string) => (
            <div key={`${field.key}.${loc}`} className="space-y-1">
              <Label htmlFor={`${field.key}-${loc}`} className="text-base">
                {t(field.name)}
              </Label>
              <Textarea
                id={`${field.key}-${loc}`}
                value={formValues?.[field.key]?.[loc] ?? ""}
                onChange={(e) =>
                  setTranslatedField(field.key, loc, e.target.value)
                }
                placeholder={t(field.name)}
                rows={4}
              />
              {formErrors[`${field.key}.${loc}`] && (
                <p className="mt-1 text-sm text-destructive">
                  {formErrors[`${field.key}.${loc}`]}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div key={field.key}>
        <Label htmlFor={field.key}>{t(field.name)}</Label>
        <Textarea
          id={field.key}
          value={formValues[field.key] ?? ""}
          onChange={(e) => setField(field.key, e.target.value)}
          placeholder={t(field.name)}
          rows={4}
          error={formErrors[field.key]}
          className="min-h-[200px"
        />
      </div>
    );
  };

  const renderNumber = (field: any) => {
    const value = formValues[field.key] ?? "";
    const child = field.child;

    const options = child && ((formData?.[child.optionsKey] ?? []) as any[]);
    const isEmpty = child && options.length === 0;

    const isFieldDisabled =
      field.key === "conversion_factor"
        ? !formValues[child.key]
          ? true
          : false
        : false;

    const numberInput = (
      <div>
        <Input
          label={t(field.name)}
          id={field.key}
          type="number"
          value={value}
          onChange={(e) => setField(field.key, e.target.value)}
          placeholder={t(field.name)}
          error={formErrors[field.key]}
          disabled={isFieldDisabled}
        />
      </div>
    );

    const childSelect = child && (
      <div className="mt-auto relative">
        <Label>{t(child.name)}</Label>
        <Select
          value={formValues[child.key] ?? ""}
          onValueChange={(v) => setField(child.key, v)}
        >
          <SelectTrigger id={child.key}>
            <SelectValue placeholder={t("selectOption")} />
          </SelectTrigger>
          <SelectContent>
            {isEmpty ? (
              <SelectItem value={"0"} disabled>
                {t("noRecords")}
              </SelectItem>
            ) : (
              (formData?.[child.optionsKey] ?? []).map((opt: any) => {
                const { value, label } = toOptionParts(opt);
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        {formErrors[child.key] && (
          <p className="mt-1 text-sm text-destructive">
            {formErrors[child.key]}
          </p>
        )}
      </div>
    );

    return (
      <div className={child ? "grid sm:grid-cols-2 gap-4" : ""} key={field.key}>
        {field.key === "conversion_factor" ? (
          <>
            {childSelect}
            {numberInput}
          </>
        ) : (
          <>
            {numberInput}
            {childSelect}
          </>
        )}
      </div>
    );
  };

  const renderSelect = (field: any) => {
    const options = (formData?.[field.optionsKey] ?? []) as any[];
    const isEmpty = options.length === 0;

    if (field.name === "category_parent") {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key}>{t(field.name)}</Label>
          <CategoryTreeSelect
            id={field.key}
            categories={(formData?.categories ?? []) as any}
            value={formValues[field.key] ?? null}
            onChange={(v) => setField(field.key, v)}
            placeholder={t("selectOption")}
            inputPlaceholder={t("search")}
            emptyLabel={t("noRecords")}
            allowParentSelection={true}
            rtl={isRTL}
          />
          {formErrors[field.key] && (
            <p className="mt-1 text-sm text-destructive">
              {formErrors[field.key]}
            </p>
          )}
        </div>
      );
    }

    return (
      <div key={field.key}>
        <Label htmlFor={field.key}>{t(field.name)}</Label>
        <Select
          value={formValues[field.key] ?? ""}
          onValueChange={(v) => setField(field.key, v)}
        >
          <SelectTrigger id={field.key}>
            <SelectValue placeholder={t("selectOption")} />
          </SelectTrigger>
          <SelectContent>
            {isEmpty ? (
              <SelectItem value={"0"} disabled>
                {t("noRecords")}
              </SelectItem>
            ) : (
              (formData?.[field.optionsKey] ?? []).map((opt: any) => {
                const { value, label } = toOptionParts(opt);
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        {formErrors[field.key] && (
          <p className="mt-1 text-sm text-destructive">
            {formErrors[field.key]}
          </p>
        )}
      </div>
    );
  };

  const renderValues = (field: any) => {
    const list: string[] = Array.isArray(formValues[field.key])
      ? formValues[field.key]
      : [];

    return (
      <div key={field.key}>
        <AttributeValuesInput
          label={t(field.name)}
          values={list}
          error={formErrors[field.key]}
          onChange={(next) => setField(field.key, next)}
          t={t}
        />
      </div>
    );
  };

  const renderStatus = (field: any) => {
    return (
      <div
        className="flex flex-col justify-start items-start gap-4"
        key={field.key}
      >
        <Label>{t(field.name)}</Label>

        <RadioGroup
          value={formValues[field.key] ?? ""}
          onValueChange={(value) => setField(field.key, value)}
          className="flex items-center gap-10"
        >
          {(formData?.[field.optionsKey] ?? []).map((option: any) => {
            const { value, label } = toOptionParts(option);
            return (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`${field.key}-${value}`} />
                <Label className="mb-0" htmlFor={`${field.key}-${value}`}>
                  {t(label)}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        {formErrors[field.key] && (
          <p className="mt-1 text-sm text-destructive">
            {formErrors[field.key]}
          </p>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && mode === "create" && (
        <DialogTrigger asChild>
          {trigger ? (
            <div>{trigger}</div>
          ) : (
            <Button size="sm">
              <AddCircle size={16} />
              <span>{t(inventoryType.addBtnTitle)}</span>
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-secondary-700 ty-body-xl-2">
              {isEdit
                ? t(inventoryType.dialogTitle.edit)
                : t(inventoryType.dialogTitle.create)}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="px-4 py-2 text-center">{t("loading")}</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {(inventoryType.formFields ?? []).map((field: any) => {
              if (field.type === "status") return renderStatus(field);
              if (field.type === "text") return renderText(field);
              if (field.type === "number") return renderNumber(field);
              if (field.type === "select") return renderSelect(field);
              if (field.type === "textarea") return renderTextarea(field); // <-- add
              if (field.type === "values") return renderValues(field); // <-- add

              return renderText({
                ...field,
                type: "text",
                hasTranslation: false,
              });
            })}

            <DialogFooter className="gap-2 grid xs:grid-cols-2 mt-8">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                )}
                {isEdit ? t("saveChanges") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InventoryFormDialog;
