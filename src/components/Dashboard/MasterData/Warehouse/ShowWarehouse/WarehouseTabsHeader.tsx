"use client";

import * as React from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import {
  ClipboardList,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat2,
} from "lucide-react";

type TabKey = "opening" | "stock" | "incoming" | "outgoing" | "transfer";

export default function WarehouseTabsHeader({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const t = useTranslations("warehouse");

  const items: { key: TabKey; label: string; icon?: React.ReactNode }[] = [
    {
      key: "opening",
      label: t("tabs.openingBalance"),
      icon: <ClipboardList size={18} />,
    },
    {
      key: "stock",
      label: t("tabs.inventoryStock"),
      icon: <Boxes size={18} />,
    },
    {
      key: "incoming",
      label: t("tabs.incomingShipments"),
      icon: <ArrowDownToLine size={18} />,
    },
    {
      key: "outgoing",
      label: t("tabs.outgoingShipments"),
      icon: <ArrowUpFromLine size={18} />,
    },
    { key: "transfer", label: t("tabs.transfer"), icon: <Repeat2 size={18} /> },
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-b pt-1">
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
