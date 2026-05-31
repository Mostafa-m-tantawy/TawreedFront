"use client";

import { useTranslations } from "next-intl";
import ApprovalTimeline from "../../sections/ApprovalTimeline";
import { ActivityLog } from "@/types/activity-log";

export default function ApprovalHistoryTab({
  logs,
  loading = false,
}: {
  logs: ActivityLog[];
  loading?: boolean;
}) {
  const t = useTranslations("");

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-6 pb-8">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="ty-body-sm">{t("loading")}</span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-6 text-center text-muted-foreground">
        <div className="ty-body-md">{t("No activity yet")}</div>
        <div className="ty-body-sm mt-1">
          {t("Updates and status changes will appear here")}
        </div>
      </div>
    );
  }

  return <ApprovalTimeline logs={logs} />;
}
