// /components/products/tabs/LinkedDocsTab.tsx
"use client";

import { FileText, Repeat, ShoppingCart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

type Doc = {
  id: string;
  type: "purchase" | "sales" | "return";
  date: string;
  status: "completed" | "processed" | "in_progress";
};

function Badge({
  tone,
  children,
}: {
  tone: "success" | "info" | "warning";
  children: React.ReactNode;
}) {
  const map = {
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-indigo-100 text-indigo-700",
    warning: "bg-violet-100 text-violet-700",
  } as const;
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export default function LinkedDocsTab({ docs }: { docs: Doc[] }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const dir = locale?.startsWith("ar") ? "rtl" : "ltr";

  const iconFor = (type: Doc["type"]) =>
    type === "purchase" ? (
      <ShoppingCart className="h-5 w-5" />
    ) : type === "return" ? (
      <Repeat className="h-5 w-5" />
    ) : (
      <FileText className="h-5 w-5" />
    );

  const tone = (status: Doc["status"]) =>
    status === "completed"
      ? "success"
      : status === "processed"
      ? "warning"
      : "info";

  const label = (status: Doc["status"]) =>
    status === "completed"
      ? t("docs.completed")
      : status === "processed"
      ? t("docs.processed")
      : t("docs.inProgress");

  return (
    <div dir={dir} className="rounded-2xl bg-white p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {t("docs.title")}
        </h2>
        <span className="text-sm text-slate-500">
          {t("docs.subtitleRight")}
        </span>
      </div>

      <p className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        {t("docs.helper")}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <div key={d.id} className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                  {iconFor(d.type)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">
                    {d.type === "purchase"
                      ? t("docs.purchaseOrder")
                      : d.type === "return"
                      ? t("docs.return")
                      : t("docs.salesOrder")}
                  </div>
                  <div className="text-sm text-slate-500">
                    {t("docs.documentId")}: {d.id}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {t("docs.date")}: {d.date}
                  </div>
                </div>
              </div>
              <Badge tone={tone(d.status)}>{label(d.status)}</Badge>
            </div>
          </div>
        ))}
        {!docs.length && (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
            {t("noRecords")}
          </div>
        )}
      </div>
    </div>
  );
}
