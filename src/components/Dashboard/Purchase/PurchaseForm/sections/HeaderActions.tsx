"use client";
import { Button } from "@/components/ui/button";
import { DocumentText1, Send2 } from "iconsax-reactjs";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function HeaderActions({
  mode,
  onApprove,
  onSaveDraft,
  onCancel,
  loading,
}: {
  mode: "create" | "edit";
  onApprove: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const t = useTranslations("");
  const approveLabel = useMemo(
    () => t(mode === "create" ? "Submit for Approval" : "Save Changes"),
    [mode, t]
  );
  return (
    <div className="flex items-center gap-3 justify-end flex-wrap">
      <Button
        onClick={onApprove}
        disabled={loading}
        variant="default"
        size={"md"}
        className="rounded-md"
      >
        <Send2 size={20} />
        {approveLabel}
      </Button>
      {mode === "create" && (
        <Button
          onClick={onSaveDraft}
          disabled={loading}
          variant="secondary"
          size={"md"}
          className="rounded-md"
        >
          <DocumentText1 size={20} />
          {t("Save Draft")}
        </Button>
      )}
      <Button
        onClick={onCancel}
        disabled={loading}
        variant="secondary"
        size={"md"}
        className="rounded-md !text-destructive"
      >
        <XIcon size={20} />
        {t("Cancel")}
      </Button>
    </div>
  );
}
