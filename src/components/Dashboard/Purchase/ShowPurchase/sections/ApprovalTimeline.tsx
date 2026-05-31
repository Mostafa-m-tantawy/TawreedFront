"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ActivityLog } from "@/types/activity-log";

export type ApprovalEvent = {
  id: number | string;
  title: string; // e.g. "Status changed by John Doe"
  at?: string; // formatted timestamp string
  changes?: Record<string, { old?: unknown; new?: unknown }>;
};

export default function ApprovalTimeline({
  logs,
  title = "Approval History",
}: {
  logs?: ActivityLog[];
  title?: string;
}) {
  const t = useTranslations("");

  // Map raw logs -> events if needed
  const derivedEvents: ApprovalEvent[] = useMemo(() => {
    if (!logs || !logs.length) return [];

    const pretty = (v: unknown) => {
      if (v === null || v === undefined || v === "") return "—";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    };

    return logs.map((r, i) => {
      const actor =
        r.user?.name ||
        [r.user?.first_name, r.user?.last_name].filter(Boolean).join(" ") ||
        t("Unknown user");

      const oldObj = r.changes?.old ?? {};
      const newObj = r.changes?.new ?? {};

      // Build structured change map: { field: {old, new} }
      const allKeys = Array.from(
        new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
      );

      const changes: Record<string, { old?: unknown; new?: unknown }> = {};
      const changePairs: string[] = [];

      allKeys.forEach((k) => {
        const from = (oldObj as any)[k];
        const to = (newObj as any)[k];
        if (from !== to) {
          changes[k] = { old: from, new: to };
          changePairs.push(`${k}: ${pretty(from)} → ${pretty(to)}`);
        }
      });

      const title =
        "status" in changes
          ? t("Status changed by {actor}", { actor })
          : t("Updated by {actor}", { actor });

      return {
        id: r.id ?? i,
        title,
        at: r.created_at ?? undefined,
        changes,
      };
    });
  }, [logs, t]);

  const items = derivedEvents;

  return (
    <div className="space-y-6 pl-2 pb-6">
      {items.map((e) => (
        <div
          key={String(e.id)}
          className="grid grid-cols-[24px_1fr_auto] gap-3 items-start"
        >
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-primary-100 border border-primary-200" />
          </div>

          <div>
            {/* Title is already fully composed text */}
            <div className="ty-body-sm mb-1">{e.title}</div>

            {e.changes && Object.keys(e.changes).length > 0 && (
              <div className="mt-1 space-y-1">
                {Object.entries(e.changes).map(([field, diff]) => {
                  const from =
                    diff.old === undefined ||
                    diff.old === null ||
                    diff.old === ""
                      ? "—"
                      : typeof diff.old === "object"
                      ? JSON.stringify(diff.old)
                      : String(diff.old);
                  const to =
                    diff.new === undefined ||
                    diff.new === null ||
                    diff.new === ""
                      ? "—"
                      : typeof diff.new === "object"
                      ? JSON.stringify(diff.new)
                      : String(diff.new);

                  return (
                    <div key={field} className="ty-body-xs text-[#00000066]">
                      <span className="font-medium text-[#00000099] capitalize">
                        {field}:
                      </span>{" "}
                      <span className="inline-block align-middle">{from}</span>{" "}
                      <span className="mx-1">→</span>
                      <span className="inline-block align-middle">{to}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="ty-body-xs text-[#00000066]">{e.at}</div>
        </div>
      ))}

      {!items.length && (
        <div className="ty-body-sm text-[#00000066]">{t("noRecords")}</div>
      )}
    </div>
  );
}
