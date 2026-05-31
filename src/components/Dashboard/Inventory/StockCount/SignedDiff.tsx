"use client";
import React from "react";

export default function SignedDiff({ value }: { value: number }) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value);
  const color =
    value > 0
      ? "text-emerald-600"
      : value < 0
      ? "text-rose-600"
      : "text-neutral-600";
  return (
    <span className={color}>
      {sign}
      {abs}
    </span>
  );
}
