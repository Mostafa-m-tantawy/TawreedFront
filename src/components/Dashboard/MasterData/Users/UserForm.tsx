"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractFieldErrors } from "@/lib/utils";
import { UserRole, User, UserStatus } from "@/types/user";
import Link from "next/link";
import { Label } from "@/components/ui/label";

type Props = {
  mode: "create" | "edit";
  userId?: number;
};

type Department = { id: number; name: string };

export default function UserForm({ mode, userId }: Props) {
  const t = useTranslations("");
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [roles, setRoles] = useState<UserRole[]>([]);
  const [statuses, setStatuses] = useState<UserStatus[]>([
    "active",
    "inactive",
  ]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formValues, setFormValues] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    status: UserStatus;
    role_id: number | "";
    department_id: number | "";
  }>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    status: "active",
    role_id: "",
    department_id: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadCreateMeta = async () => {
    setLoadingMeta(true);
    try {
      const res = await api.get("/admin/users/create");
      const rolesRes: UserRole[] = res?.data?.roles ?? [];
      const statusRes: string[] = res?.data?.status ?? [];
      const depsRes: Department[] = res?.data?.departments ?? [];
      const ss = statusRes.filter(
        (s) => s === "active" || s === "inactive"
      ) as UserStatus[];
      setRoles(rolesRes);
      setDepartments(depsRes);
      if (ss.length) setStatuses(ss);
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadEditData = async (id: number) => {
    setLoadingMeta(true);
    try {
      const res = await api.get(`/admin/users/${id}/edit`);
      const rolesRes: UserRole[] = res?.data?.roles ?? [];
      const statusRes: string[] = res?.data?.status ?? [];
      const depsRes: Department[] = res?.data?.departments ?? [];
      const user: User | undefined = res?.data?.user;

      setRoles(rolesRes);
      setDepartments(depsRes);
      const ss = statusRes.filter(
        (s) => s === "active" || s === "inactive"
      ) as UserStatus[];
      if (ss.length) setStatuses(ss);

      if (user) {
        // Try to use explicit fields if available; otherwise split name
        const fn = (user as any).first_name ?? user.name?.split(" ")?.[0] ?? "";
        const ln =
          (user as any).last_name ??
          (user.name ? user.name.split(" ").slice(1).join(" ") : "") ??
          "";

        setFormValues((prev) => ({
          ...prev,
          first_name: fn,
          last_name: ln,
          email: user.email ?? "",
          phone: user.phone ?? "",
          status: (user.status as UserStatus) ?? "active",
          role_id: (user as any).role?.id ?? (user as any).role_id ?? "",
          department_id:
            (user as any).department?.id ?? (user as any).department_id ?? "",
          password: "",
          password_confirmation: "",
        }));
      }
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (isEdit && userId) loadEditData(userId);
    else loadCreateMeta();
  }, [isEdit, userId]);

  const onChange =
    (key: keyof typeof formValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormValues((p) => ({ ...p, [key]: value }));
      if (formErrors[key]) {
        const next = { ...formErrors };
        delete next[key];
        setFormErrors(next);
      }
    };

  const onChangeStatus = (v: string) => {
    if (v !== "active" && v !== "inactive") return;
    setFormValues((p) => ({ ...p, status: v as UserStatus }));
    if (formErrors.status) {
      const next = { ...formErrors };
      delete next.status;
      setFormErrors(next);
    }
  };

  const onChangeRole = (v: string) => {
    setFormValues((p) => ({ ...p, role_id: v ? Number(v) : "" }));
    if (formErrors.role_id) {
      const next = { ...formErrors };
      delete next.role_id;
      setFormErrors(next);
    }
  };

  const onChangeDepartment = (v: string) => {
    setFormValues((p) => ({ ...p, department_id: v ? Number(v) : "" }));
    if (formErrors.department_id) {
      const next = { ...formErrors };
      delete next.department_id;
      setFormErrors(next);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formValues.first_name.trim()) e.first_name = t("fieldRequired");
    if (!formValues.last_name.trim()) e.last_name = t("fieldRequired");
    if (!formValues.email.trim()) e.email = t("fieldRequired");

    if (!isEdit) {
      if (!formValues.password) e.password = t("fieldRequired");
      if (formValues.password !== formValues.password_confirmation) {
        e.password_confirmation = t("passwordsDoNotMatch");
      }
    } else if (formValues.password || formValues.password_confirmation) {
      if (formValues.password !== formValues.password_confirmation) {
        e.password_confirmation = t("passwordsDoNotMatch");
      }
    }

    if (!["active", "inactive"].includes(formValues.status))
      e.status = t("fieldRequired");
    if (formValues.role_id === "") e.role_id = t("fieldRequired");
    if (formValues.department_id === "") e.department_id = t("fieldRequired");

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        first_name: formValues.first_name.trim(),
        last_name: formValues.last_name.trim(),
        email: formValues.email.trim(),
        status: formValues.status,
        role_id: formValues.role_id || null,
        department_id: formValues.department_id || null,
        phone: formValues.phone || "",
        password: formValues.password || "",
        password_confirmation: formValues.password_confirmation || "",
      };

      // if (formValues.password) {
      //   payload.password = formValues.password;
      //   payload.password_confirmation = formValues.password_confirmation;
      // }

      if (isEdit && userId) {
        await api.put(`/admin/users/${userId}`, payload);
        toast.success(t("userUpdated"));
      } else {
        await api.post(`/admin/users`, payload);
        toast.success(t("userCreated"));
      }
      router.push("/dashboard/users");
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};
      if (Object.keys(fieldErrors).length) setFormErrors(fieldErrors);
      else
        toast.error(
          err?.response?.data?.message ||
            (isEdit ? t("updateFailed") : t("createFailed"))
        );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href={"/dashboard/users"}
          className="ty-body-sm text-primary-700 w-fit"
        >
          ← {t("Back to {cap}", { cap: t("Users") })}
        </Link>

        <h1 className="ty-body-xl-2 text-primary-700">
          {isEdit ? t("Edit User") : t("Add User")}
        </h1>
      </div>

      <div className="rounded-2xl bg-white p-6">
        <p className="mb-4 border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
          {t("Basic Info")}
        </p>

        <form onSubmit={onSubmit} className="space-y-4" aria-busy={submitting}>
          {/* Names & Email & Password */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t("First Name")}
              placeholder={t("enter first name")}
              value={formValues.first_name}
              onChange={onChange("first_name")}
              disabled={submitting || loadingMeta}
              error={formErrors.first_name}
            />
            <Input
              label={t("Last Name")}
              placeholder={t("enter last name")}
              value={formValues.last_name}
              onChange={onChange("last_name")}
              disabled={submitting || loadingMeta}
              error={formErrors.last_name}
            />
            <Input
              label={t("Email Address *")}
              placeholder={t("enter email address")}
              value={formValues.email}
              onChange={onChange("email")}
              disabled={submitting || loadingMeta}
              error={formErrors.email}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t("Phone Number")}
              placeholder={t("Phone Number")}
              value={formValues.phone}
              onChange={onChange("phone")}
              disabled={submitting || loadingMeta}
              error={formErrors.phone}
            />

            <Input
              type="password"
              label={t("Password")}
              placeholder={t("Password")}
              value={formValues.password}
              onChange={onChange("password")}
              disabled={submitting || loadingMeta}
              error={formErrors.password}
            />
            <Input
              type="password"
              label={t("Confirm Password")}
              placeholder={t("Password")}
              value={formValues.password_confirmation}
              onChange={onChange("password_confirmation")}
              disabled={submitting || loadingMeta}
              error={formErrors.password_confirmation}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <Label>{t("Status")}</Label>
              <Select
                value={formValues.status}
                onValueChange={onChangeStatus}
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
                  {statuses.map((s) => (
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

            {/* Role */}
            <div>
              <Label>{t("Role")}</Label>
              <Select
                value={formValues.role_id ? String(formValues.role_id) : ""}
                onValueChange={onChangeRole}
                disabled={submitting || loadingMeta}
              >
                <SelectTrigger
                  className={
                    "mt-4 " + `${formErrors.role_id ? "border-red-500" : ""}`
                  }
                >
                  <SelectValue placeholder={t("select role")} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role_id && (
                <p className="mt-1 text-sm text-destructive text-start">
                  {formErrors.role_id}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <Label>{t("Department")}</Label>
              <Select
                value={
                  formValues.department_id
                    ? String(formValues.department_id)
                    : ""
                }
                onValueChange={onChangeDepartment}
                disabled={submitting || loadingMeta}
              >
                <SelectTrigger
                  className={
                    "mt-4 " +
                    `${formErrors.department_id ? "border-red-500" : ""}`
                  }
                >
                  <SelectValue placeholder={t("select department")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.department_id && (
                <p className="mt-1 text-sm text-destructive text-start">
                  {formErrors.department_id}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          size={"lg"}
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
          )}
          {isEdit ? t("Save User") : t("Save User")}
        </Button>
      </div>
    </div>
  );
}
