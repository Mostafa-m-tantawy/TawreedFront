"use client";

import { create } from "zustand";
import {
  setEncryptedCookie,
  getDecryptedCookie,
  removeCookie,
} from "@/lib/cookies";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  type: string;
  tenant_id: number;
  [key: string]: any;
};

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];

  setUser: (user: User) => void;
  getUser: () => User | null;

  setToken: (token: string, isInitial?: boolean) => void;
  getToken: () => string | null;

  setPermissions: (permissions: string[]) => void;
  getPermissions: () => string[];

  hasPermission: (permission: string | string[]) => boolean;

  logout: () => void;
}

// Initialize from cookies
const initialUser = getDecryptedCookie("user", "localStorage");
const initialToken = getDecryptedCookie("token");
const initialPermissions = getDecryptedCookie("permissions", "localStorage");

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser ? JSON.parse(initialUser) : null,
  token: initialToken || null,
  permissions: initialPermissions ? JSON.parse(initialPermissions) : [],

  setUser: (user) => {
    set({ user });
    setEncryptedCookie("user", JSON.stringify(user), 1, "localStorage");
  },

  getUser: () => get().user,

  setToken: (token, isInitial = false) => {
    set({ token });
    if (isInitial) {
      return;
    }
    const MAX_COOKIE_DAYS = 400;
    setEncryptedCookie("token", token, MAX_COOKIE_DAYS);
  },

  getToken: () => get().token,

  setPermissions: (permissions) => {
    set({ permissions });
    setEncryptedCookie(
      "permissions",
      JSON.stringify(permissions),
      1,
      "localStorage"
    );
  },

  getPermissions: () => get()?.permissions || [],

  hasPermission: (permission) => {
    if (Array.isArray(permission)) {
      return permission?.every((p) => get()?.permissions?.includes(p));
    } else {
      return get()?.permissions?.includes(permission);
    }
  },

  logout: () => {
    set({ user: null, token: null, permissions: [] });
    removeCookie("token");
    removeCookie("user", "localStorage");
    removeCookie("permissions", "localStorage");
    localStorage.removeItem("tenantId");
  },
}));
