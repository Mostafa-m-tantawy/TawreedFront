"use client";

import AttachmentsList from "./AttachmentsList";
import SectionCard from "./SectionCard";

export default function NotesAttachmentsTab({
  note,
  attachments,
}: {
  note?: string;
  attachments: any[];
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Notes" className="p-0">
        <div className="rounded-md bg-[#F8FAFC] p-4 ty-body-md text-neutral-black-300">
          {note || "—"}
        </div>
      </SectionCard>
      <AttachmentsList items={attachments} />
    </div>
  );
}
