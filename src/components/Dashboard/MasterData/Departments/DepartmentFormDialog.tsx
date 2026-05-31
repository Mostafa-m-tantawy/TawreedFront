"use client";

import { useEffect, useState } from "react";
import { AddCircle } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
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
import { Department } from "@/types/department";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
  mode?: "create" | "edit";
  departmentId?: number;
  initialDepartment?: Department;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

const DEFAULT_STATUSES: Array<"active" | "inactive"> = ["active", "inactive"];

const DepartmentFormDialog: React.FC<Props> = ({
  mode = "create",
  departmentId,
  initialDepartment,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}) => {
  const t = useTranslations("");
  const isEdit = mode === "edit";

  // controlled/uncontrolled dialog pattern
  const isControlled = typeof controlledOpen === "boolean";
  const [innerOpen, setInnerOpen] = useState(false);
  const open = isControlled ? (controlledOpen as boolean) : innerOpen;
  const setOpen = (v: boolean) =>
    isControlled ? onOpenChange?.(v) : setInnerOpen(v);

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusOptions, setStatusOptions] =
    useState<Array<"active" | "inactive">>(DEFAULT_STATUSES);

  const [formValues, setFormValues] = useState<{
    nameEn: string;
    status: string;
  }>({
    nameEn: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const getCreateData = async () => {
    if (loadingMeta) return;
    setLoadingMeta(true);
    try {
      const res = await api.get("/admin/departments/create");
      const statuses: string[] = res?.data?.status ?? [];
      const cleaned = statuses.filter(
        (s) => s === "active" || s === "inactive"
      ) as Array<"active" | "inactive">;
      if (cleaned.length) {
        setStatusOptions(cleaned);
        setFormValues((prev) => ({
          ...prev,
          status: cleaned.includes(prev.status as any)
            ? prev.status
            : cleaned[0],
        }));
      }
    } catch (err: any) {
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setFormValues({
        nameEn: (initialDepartment?.name as string) ?? "",
        status:
          (initialDepartment?.status as "active" | "inactive") ?? "active",
      });
      setStatusOptions(DEFAULT_STATUSES);
    } else {
      setFormValues({ nameEn: "", status: "active" });
      getCreateData();
    }
    setFormErrors({});
  }, [open, isEdit, initialDepartment?.name, initialDepartment?.status]);

  const onChangeNameEn = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormValues((prev) => ({ ...prev, nameEn: value }));
    setFormErrors((prev) => {
      if (!prev.nameEn) return prev;
      const next = { ...prev };
      delete next.nameEn;
      return next;
    });
  };

  const onChangeStatus = (value: string) => {
    if (value !== "active" && value !== "inactive") return;
    setFormValues((prev) => ({ ...prev, status: value }));
    setFormErrors((prev) => {
      if (!prev.status) return prev;
      const next = { ...prev };
      delete next.status;
      return next;
    });
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    const trimmed = formValues.nameEn.trim();
    if (!trimmed) errors.nameEn = t("fieldRequired");
    else if (trimmed.length > 50) errors.nameEn = t("nameTooLong50");
    if (!["active", "inactive"].includes(formValues.status))
      errors.status = t("fieldRequired");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingMeta) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        status: formValues.status,
        name: { en: formValues.nameEn },
      };

      if (isEdit) {
        await api.put(`/admin/departments/${departmentId}`, payload);
        toast.success(t("departmentUpdated"));
      } else {
        await api.post(`/admin/departments`, payload);
        toast.success(t("departmentCreated"));
      }
      onSuccess?.();
      setOpen(false);
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};
      if (Object.keys(fieldErrors).length > 0) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Default trigger only for uncontrolled create usage */}
      {!isControlled && mode === "create" && (
        <DialogTrigger asChild>
          {trigger ? (
            <div>{trigger}</div>
          ) : (
            <Button size="sm">
              <AddCircle size={16} />
              <span>{t("Add Department")}</span>
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-secondary-700 ty-body-xl-2">
              {isEdit ? t("updateDepartmentTitle") : t("createDepartmentTitle")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              id="department-name-en"
              label={t("nameLabel")}
              placeholder={t("departmentNamePlaceholder")}
              value={formValues.nameEn}
              onChange={onChangeNameEn}
              disabled={submitting}
              error={formErrors.nameEn || formErrors?.["name.en"]}
            />
          </div>

          <div>
            <Label>{t("status")}</Label>
            <Select
              value={formValues.status}
              onValueChange={onChangeStatus}
              disabled={submitting || loadingMeta}
            >
              <SelectTrigger
                className={`${formErrors.status ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(s)}
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

          <DialogFooter className="gap-2 grid grid-cols-2 mt-8">
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
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentFormDialog;
