"use client";

import * as React from "react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Sms } from "iconsax-reactjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api.client";
import Link from "next/link";

export const metadata = { title: "Login" };

type FormState = {
  email: string;
};

//TODO handle small screens text

export default function ForgotPassword() {
  const t = useTranslations("");
  const locale = useLocale();

  const [formData, setFormData] = useState<FormState>({
    email: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!formData.email) next.email = t("emailRequired");
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      next.email = t("invalidEmail");

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors((x) => ({ ...x, email: "" }));

    try {
      await api.post("/forgot-password", {
        email: formData.email,
      });

      setIsSent(true);
    } catch (err: any) {
      setErrors((x) => ({ ...x, email: err.message || t("unableReset") }));
    } finally {
      setLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="mx-auto w-full max-w-lg text-center">
        <div>
          <h1 className="ty-display-s ty-display-md text-primary-700">
            {t("passwordResetEmailTo")}
          </h1>
          <p className="ty-body-lg ty-body-xl text-secondary-500 mt-2">
            {formData.email || ""}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <p className="ty-body- ty-body-lg text-secondary-500">
            {t("checkInbox")}
          </p>

          <Link href={"/login"}>
            <Button type="button" className="w-full mt-4" size="lg">
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="text-center">
        <h1 className="ty-display-s ty-display-md text-primary-700">
          {t("resetPassword")}
        </h1>
        <p className="ty-body-s ty-body-md text-secondary-500 mt-2">
          {t("resetDescription")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            label={t("email")}
            placeholder={t("enterEmail")}
            leftIcon={<Sms size={20} className="text-primary-700" />}
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={loading}
            error={errors.email}
          />
        </div>

        <Button
          className="w-full mt-4"
          size="lg"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? t("loading") : t("next")}
        </Button>
      </form>

      <div className="flex-center mt-5">
        <Link
          href={"/login"}
          className="flex gap-2 items-center ty-body-md text-primary-900"
        >
          {locale === "ar" ? (
            <ArrowRight size={24} className="text-primary-900" />
          ) : (
            <ArrowLeft size={24} className="text-primary-900" />
          )}
          <span>{t("backToLogin")}</span>
        </Link>
      </div>

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
