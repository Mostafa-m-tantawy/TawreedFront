"use client";
import SectionCard from "./SectionCard";
import { Button } from "@/components/ui/button";
import { DocumentDownload } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

export type Attachment = {
  id: number;
  file_name: string;
  uploaded_by?: string;
  uploaded_at?: string;
  url?: string;
};

export default function AttachmentsList({ items }: { items: Attachment[] }) {
  const t = useTranslations("");
  return (
    <SectionCard title="Attachments" className="p-0">
      <div className="space-y-3">
        {items.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-md bg-[#F8FAFC] p-4"
          >
            <div>
              <a
                className="text-primary-600 underline ty-body-md"
                href={a.url || "#"}
              >
                {a.file_name}
              </a>
              {(a.uploaded_by || a.uploaded_at) && (
                <div className="ty-body-xs text-secondary-500 mt-1">
                  {t("Uploaded by")} {a.uploaded_by || "—"} on{" "}
                  {a.uploaded_at || "—"}
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              size={"md"}
              className="rounded-md font-normal"
            >
              <DocumentDownload size={24} /> {t("Download")}
            </Button>
          </div>
        ))}
        {!items.length && (
          <div className="text-sm text-muted-foreground">{t("noRecords")}</div>
        )}
      </div>
    </SectionCard>
  );
}
