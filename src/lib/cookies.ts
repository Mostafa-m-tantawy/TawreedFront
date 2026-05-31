"use client";

import Cookies from "js-cookie";
import { encrypt, decrypt } from "./crypto";

/**
 * Sets an encrypted cookie (client-side only)
 */
export function setEncryptedCookie(
  name: string,
  value: string,
  expiresDays: number = 7,
  destination = "cookies"
): void {
  const encryptedValue = encrypt(value);
  if (destination === "cookies") {
    Cookies.set(name, encryptedValue, {
      expires: 365 * 100,
      secure: true,
      sameSite: "Strict",
    });
  } else {
    localStorage.setItem(name, encryptedValue);
  }
}

/**
 * Gets and decrypts a cookie (client-side only)
 */
export function getDecryptedCookie(
  name: string,
  destination = "cookies"
): string | null {
  const encryptedValue =
    destination === "cookies" ? Cookies.get(name) : localStorage.getItem(name);

  if (!encryptedValue) return "";

  try {
    return decrypt(encryptedValue);
  } catch (error) {
    return "";
  }
}

/**
 * Removes a cookie by name (client-side only)
 */
export function removeCookie(name: string, destination = "cookies"): void {
  if (destination === "cookies") {
    Cookies.remove(name);
  } else {
    localStorage.removeItem(name);
  }
}
