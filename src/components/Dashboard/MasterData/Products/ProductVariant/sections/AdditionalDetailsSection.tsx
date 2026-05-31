"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Status } from "../types";

type Props = {
  disabled?: boolean;
  status: Status;
  notes: string;
  onChangeStatus: (v: Status) => void;
  onChangeNotes: (v: string) => void;
  statusError?: string;
  t: (k: string, p?: Record<string, unknown>) => string;
};

export default function AdditionalDetailsSection({
  disabled,
  status,
  notes,
  onChangeStatus,
  onChangeNotes,
  statusError,
  t,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Additional Details")}
      </p>

      <fieldset disabled={disabled}>
        <legend className="sr-only">{t("Status")}</legend>
        <Label className="mb-2 block">{t("Status")}</Label>
        <div className="mt-2 flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="active"
              checked={status === "active"}
              onChange={() => onChangeStatus("active")}
            />
            <span>{t("Active")}</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={status === "inactive"}
              onChange={() => onChangeStatus("inactive")}
            />
            <span>{t("in-active")}</span>
          </label>
        </div>
        {statusError && (
          <p className="mt-1 text-sm text-destructive text-start">
            {statusError}
          </p>
        )}
      </fieldset>

      <div>
        <Label className="mb-2 block">{t("Internal Notes")}</Label>
        <Textarea
          placeholder={t("Notes visible only to staff")}
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
