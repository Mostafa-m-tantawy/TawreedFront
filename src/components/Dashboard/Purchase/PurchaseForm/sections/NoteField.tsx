"use client";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

export default function NoteField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const t = useTranslations("");
  return (
    <div className="rounded-2xl bg-white p-6">
      <p className="mb-2">{t("Note (Options)")}</p>
      <Textarea
        placeholder={t("write any note you want")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
    </div>
  );
}
