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
import { Group } from "@/types/group";

type Props = {
  mode?: "create" | "edit";
  groupId?: number;
  type: string;
  initialGroup?: Group;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

const GroupFormDialog: React.FC<Props> = ({
  mode = "create",
  groupId,
  type,
  initialGroup,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}) => {
  const t = useTranslations("");
  const isEdit = mode === "edit";

  const baseEndpoint =
    type === "customer" ? "/admin/customer-groups" : "/admin/supplier-groups";

  const isControlled = typeof controlledOpen === "boolean";
  const [innerOpen, setInnerOpen] = useState(false);
  const open = isControlled ? (controlledOpen as boolean) : innerOpen;
  const setOpen = (v: boolean) =>
    isControlled ? onOpenChange?.(v) : setInnerOpen(v);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<{
    name: string;
    group_id?: string;
  }>({
    name: "",
    group_id: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const getCreateData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.get(`${baseEndpoint}/create`, {
        params: {
          type,
        },
      });

      const groupId = res.data?.group_id || "G-ID";

      setFormValues({ name: "", group_id: groupId });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("createRoleFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setFormValues({
        name: initialGroup?.name ?? "",
        group_id: initialGroup?.group_id || "",
      });
    } else {
      setFormValues({ name: "", group_id: "" });
      getCreateData();
    }
    setFormErrors({});
  }, [open, isEdit, initialGroup?.name]);

  const onChange =
    (field: "name") => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const trimmed = formValues.name.trim();
    if (!trimmed) errors.name = t("fieldRequired");
    else if (trimmed.length > 255) errors.name = t("nameTooLong255");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formValues.name,
        type,
        group_id: formValues.group_id,
      };

      if (isEdit) {
        await api.put<{ data: Group }>(`${baseEndpoint}/${groupId}`, payload);
        toast.success(t("groupUpdated"));
        onSuccess?.();
      } else {
        await api.post<{ data: Group }>(`${baseEndpoint}`, payload);
        toast.success(t("groupCreated"));
        onSuccess?.();
      }
      setOpen(false);
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && mode === "create" && (
        <DialogTrigger asChild>
          {trigger ? (
            <div>{trigger}</div>
          ) : (
            <Button size="sm">
              <AddCircle size={16} />
              <span>{t("Add Group")}</span>
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-secondary-700 ty-body-xl-2">
              {isEdit ? t("updateGroupTitle") : t("createGroupTitle")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              id="group-id"
              label={t("groupID")}
              placeholder={t("groupID")}
              value={formValues.group_id}
              disabled={true}
              error={formErrors.group_id}
            />
          </div>
          <div>
            <Input
              id="group-name"
              label={t("nameLabel")}
              placeholder={t("groupNamePlaceholder")}
              value={formValues.name}
              onChange={onChange("name")}
              disabled={submitting}
              error={formErrors.name}
            />
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

export default GroupFormDialog;
