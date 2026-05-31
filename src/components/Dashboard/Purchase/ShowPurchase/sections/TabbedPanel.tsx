"use client";
import { useState } from "react";
import SectionCard from "./SectionCard";
import { cn } from "@/lib/utils";

export type Tab = { key: string; label: string; content: React.ReactNode };

export default function TabbedPanel({
  tabs,
  defaultKey,
}: {
  tabs: Tab[];
  defaultKey?: string;
}) {
  const [cur, setCur] = useState(defaultKey || tabs[0]?.key);
  return (
    <SectionCard className="p-0 pt-2">
      <div className="flex gap-6 border-b flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={cn(
              "relative -mb-px rounded-t-lg px-3 py-2 ty-body-xs transition-colors",
              cur === t.key
                ? "border-b-2 border-primary-700 text-primary-700"
                : "text-secondary-400 hover:text-primary-700"
            )}
            onClick={() => setCur(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-4 pb-0">{tabs.find((t) => t.key === cur)?.content}</div>
    </SectionCard>
  );
}
