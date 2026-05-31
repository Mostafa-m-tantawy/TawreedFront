"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { getDecryptedCookie } from "@/lib/cookies";
import { useLocale } from "next-intl";
import { setApiLanguage } from "@/lib/api.client";

export const AppInitializer = () => {
  const { setToken, setUser, setPermissions } = useAuthStore();

  const locale = useLocale();

  useEffect(() => {
    setApiLanguage(locale);
  }, [locale]);

  useEffect(() => {
    const load = () => {
      const token = getDecryptedCookie("token");
      const userRaw = getDecryptedCookie("user", "localStorage");
      const permissions = getDecryptedCookie("permissions", "localStorage");

      if (token) setToken(token, true);
      if (userRaw) setUser(JSON.parse(userRaw));
      if (permissions) setPermissions(JSON.parse(permissions));
    };

    load();
  }, []);

  return null;
};
