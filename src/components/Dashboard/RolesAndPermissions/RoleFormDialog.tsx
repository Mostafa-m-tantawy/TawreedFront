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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractFieldErrors } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";

type Permission = { id: number; name: string };
type ModuleRes = { id: number; name: string; permissions: Permission[] | null };
type UserRes = {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

type RoleRes = {
  id: number;
  name: string | null;
  description: string | null;
  permissions: Permission[];
  users: UserRes[];
};

type CreatePayload = {
  name: string;
  description?: string | null;
  user_ids?: number[] | null;
  permission_ids: number[];
};

type Props = {
  mode?: "create" | "edit";
  roleId?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const RoleFormDialog: React.FC<Props> = ({
  mode = "create",
  roleId,
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}) => {
  const t = useTranslations("");
  const isEdit = mode === "edit";

  // controlled/uncontrolled handling
  const isControlled = typeof controlledOpen === "boolean";
  const [innerOpen, setInnerOpen] = useState(false);
  const open = isControlled ? (controlledOpen as boolean) : innerOpen;
  const setOpen = (v: boolean) =>
    isControlled ? onOpenChange?.(v) : setInnerOpen(v);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formValues, setFormValues] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        if (isEdit) {
          const { data } = await api.get<{
            modules: ModuleRes[];
            role: RoleRes;
            users: UserRes[];
          }>(`/admin/roles/${roleId}/edit`);

          setFormValues({
            name: data.role?.name ?? "",
            description: data.role?.description ?? "",
          });
        } else {
          await api.get<{ modules: ModuleRes[]; users: UserRes[] }>(
            "/admin/roles/create"
          );
          setFormValues({ name: "", description: "" });
        }
        setFormErrors({});
      } catch (err: any) {
        toast.error(err?.response?.data?.message || t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    if (isEdit) load();
  }, [open, isEdit, roleId, t]);

  const handleChange =
    (field: "name" | "description") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };

  const validate = () => {
    const errors: Record<string, string> = {};
    const trimmedName = formValues.name.trim();
    const trimmedDesc = formValues.description.trim();

    if (!trimmedName) errors.name = t("fieldRequired");
    else if (trimmedName.length < 2) errors.name = t("nameTooShort");
    else if (trimmedName.length > 50) errors.name = t("nameTooLong");

    if (!trimmedDesc) errors.description = t("fieldRequired");
    else if (trimmedDesc.length > 1000)
      errors.description = t("descriptionTooLong");

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: CreatePayload = {
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        user_ids: [],
        permission_ids: [],
      };

      if (isEdit) {
        const res = await api.put<{ data: RoleRes }>(
          `/admin/roles/${roleId}`,
          payload
        );
        toast.success(t("roleUpdated"));
      } else {
        const res = await api.post<{ data: RoleRes }>(`/admin/roles`, payload);
        toast.success(t("roleCreated"));
      }
      onSuccess?.();
      setOpen(false);
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      } else {
        toast.error(
          err?.response?.data?.message ||
            (isEdit ? t("updateRoleFailed") : t("createRoleFailed"))
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setFormErrors({});
        setFormValues({
          name: "",
          description: "",
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Internal trigger only for UNCONTROLLED CREATE usage */}
      {!isControlled && mode === "create" && (
        <DialogTrigger asChild>
          {trigger ? (
            <div>{trigger}</div>
          ) : (
            <Button
              size="md"
              className="h-[52px] rounded-md"
              aria-label={t("addRoleButton")}
            >
              <AddCircle size={20} />
              {t("addRoleButton")}
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-secondary-700 ty-body-xl-2">
              {isEdit ? t("updateRoleTitle") : t("createRoleTitle")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="hidden" />

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name */}
          <div className="grid gap-2">
            <Input
              id="role-name"
              label={t("nameLabel")}
              placeholder={t("roleNamePlaceholder")}
              value={formValues.name}
              onChange={handleChange("name")}
              disabled={loading || submitting}
              error={formErrors.name}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="role-desc">{t("descriptionLabel")}</Label>
            <Textarea
              id="role-desc"
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              placeholder={t("roleDescPlaceholder")}
              value={formValues.description}
              onChange={handleChange("description")}
              disabled={loading || submitting}
              error={formErrors.description}
            />
          </div>

          <DialogFooter className="gap-2 grid grid-cols-2">
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={submitting || loading}
              onClick={onSubmit as any}
            >
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

export default RoleFormDialog;
