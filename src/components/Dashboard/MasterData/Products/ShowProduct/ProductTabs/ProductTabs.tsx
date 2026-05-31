"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { Clipboard } from "iconsax-reactjs";

type TabKey =
  | "overview"
  | "movements"
  | "documents"
  | "variants"
  | "groupedProducts";

export default function ProductTabs({
  active,
  onChange,
  isShowGroupedProducts,
  isShowVariants,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  isShowGroupedProducts?: boolean | null;
  isShowVariants?: boolean | null;
}) {
  const t = useTranslations("product");

  const items: { key: TabKey; label: string; icon?: React.ReactNode }[] = [
    {
      key: "overview",
      label: t("tabs.overview"),
      icon: <Clipboard size={18} />,
    },
    // TODO implement ui like design for these tabs
    {
      key: "movements",
      label: t("tabs.movements"),
      icon: <Clipboard size={18} />,
    },
    {
      key: "documents",
      label: t("tabs.documents"),
      icon: <Clipboard size={18} />,
    },
  ];

  if (isShowVariants) {
    items.push({
      key: "variants",
      label: t("tabs.variants"),
      icon: <Clipboard size={18} />,
    });
  }
  if (isShowGroupedProducts) {
    items.push({
      key: "groupedProducts",
      label: t("tabs.groupedProducts"),
      icon: <Clipboard size={18} />,
    });
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 border-b pt-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={clsx(
              "relative -mb-px rounded-t-lg px-3 py-2 ty-body-xs transition-colors flex items-center gap-2",
              active === it.key
                ? "border-b-2 border-primary-700 text-primary-700"
                : "text-secondary-400 hover:text-primary-700"
            )}
          >
            {it.icon}
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
