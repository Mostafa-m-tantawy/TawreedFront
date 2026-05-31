"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sms, Lock1 } from "iconsax-reactjs";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api.client";
import { useAuthStore } from "@/store/authStore";
import { extractFieldErrors } from "@/lib/utils";
import { Permission } from "@/types/role";
import { toast } from "sonner";

export const metadata = { title: "Login" };

type FormState = {
  login: string;
  password: string;
  isRemembered: boolean;
};

//TODO handle small screens text

export default function Login() {
  const t = useTranslations("");
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>({
    login: "admin@tawreed.com",
    password: "admin123",
    isRemembered: false,
  });

  const [errors, setErrors] = useState<{
    login?: string;
    password?: string;
    root?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const { setUser, setToken, setPermissions } = useAuthStore();

  const validate = () => {
    const next: typeof errors = {};
    if (!formData.login) next.login = t("emailRequired");
    else if (!/^\S+@\S+\.\S+$/.test(formData.login))
      next.login = t("invalidEmail");

    if (!formData.password) next.password = t("passwordRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors((x) => ({ ...x, root: undefined }));

    try {
      const res = await api.post("/login", {
        login: formData.login,
        password: formData.password,
        // remember: formData.isRemembered,
      });

      const { user, token, permissions } = res.data;

      if (formData.isRemembered) {
        localStorage.setItem("rememberedEmail", formData.login);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setUser(user);
      setToken(token);
      setPermissions(permissions?.map((p: Permission) => p.name));
      router.push("/dashboard");
      // router.refresh();
    } catch (err: any) {
      console.log(err);

      const fieldsErrros = extractFieldErrors(err);

      if (Object.keys(fieldsErrros).length > 0) {
        setErrors(fieldsErrros);
      } else {
        toast.error(err?.response?.data?.message || t("unableLogin"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full">
      <div className="text-center">
        <h1 className="ty-display-s ty-display-md text-primary-700">
          {t("Welcome Back")}
        </h1>
        <p className="ty-body-s ty-body-md text-secondary-500 mt-2">
          {t("loginDescription")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Input
            id="login"
            name="login"
            type="email"
            label={t("email")}
            placeholder={t("enterEmail")}
            leftIcon={<Sms size={20} className="text-primary-700" />}
            value={formData.login}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, login: e.target.value }))
            }
            disabled={loading}
            error={errors.login}
          />
        </div>

        <div>
          <Input
            id="password"
            name="password"
            type="password"
            label={t("Password")}
            placeholder={t("Password")}
            leftIcon={<Lock1 size={20} className="text-primary-700" />}
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={loading}
            error={errors.password}
          />
        </div>

        <div className="flex justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              name="remember"
              checked={formData.isRemembered}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isRemembered: Boolean(checked),
                }))
              }
              disabled={loading}
            />
            <Label
              htmlFor="remember"
              className="mb-0 text-body-md text-secondary-500 font-normal cursor-pointer"
            >
              {t("Remember me")}
            </Label>
          </div>

          <Link href="/forgot-password">
            <span className="ty-body-s ty-body-md text-[#F04438]">
              {t("Forgot Password?")}
            </span>
          </Link>
        </div>

        {errors.root && (
          <div className="rounded-md bg-destructive/10 text-destructive ty-body-sm p-3">
            {errors.root}
          </div>
        )}

        <Button
          className="w-full mt-4"
          size="lg"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? t("loading") : t("Login")}
        </Button>
      </form>

      {/* Optional: demo helper to prefill */}
      {/* <div className="mt-3 text-center">
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() =>
            setFormData({ email: "demo@example.com", password: "password", isRemembered: true })
          }
        >
          {t("Use demo credentials")}
        </button>
      </div> */}
    </div>
  );
}
