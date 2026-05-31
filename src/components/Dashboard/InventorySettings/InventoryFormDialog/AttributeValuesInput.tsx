"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Add, CloseCircle } from "iconsax-reactjs";

type Dir = "ltr" | "rtl";

const AttributeValuesInput = ({
  label,
  values,
  error,
  onChange,
  t,
  direction,
}: {
  label: string;
  values: string[];
  error?: string;
  onChange: (next: string[]) => void;
  t: (k: string) => string;
  direction?: Dir;
}) => {
  const locale = useLocale();
  const derivedDir: Dir = (direction ??
    (locale === "ar" ? "rtl" : "ltr")) as Dir;
  const isRTL = derivedDir === "rtl";

  const [draft, setDraft] = useState("");

  const addTokens = (raw: string) => {
    const tokens = raw
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const lc = new Set(values.map((v) => v.toLowerCase()));
    const merged = [...values];

    for (const tok of tokens) {
      if (!lc.has(tok.toLowerCase())) {
        merged.push(tok);
        lc.add(tok.toLowerCase());
      }
    }
    onChange(merged);
    setDraft("");
  };

  const removeAt = (idx: number) => {
    const next = values.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-2" dir={derivedDir}>
      {/* Input with right-side addon (+) */}
      <div className="relative grid grid-cols-[1fr_auto]">
        <Input
          label={label}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTokens(draft);
            }
            if (e.key === "," && !e.shiftKey) {
              e.preventDefault();
              addTokens(draft);
            }
            if (e.key === "Backspace" && draft === "" && values.length > 0) {
              e.preventDefault();
              onChange(values.slice(0, values.length - 1));
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes("\n") || text.includes(",")) {
              e.preventDefault();
              addTokens(text);
            }
          }}
          placeholder={
            t("enterValuesCommaOrNewline") ?? "Type and press Enter or ,"
          }
          className="!rounded-e-none"
          error={error}
          direction={derivedDir}
        />

        {/* plus button inside the input (direction-aware) */}
        <button
          type="button"
          className="w-16 h-13 flex-center mt-auto bg-[#F9FAFB] hover:bg-primary-50 border border-s-0 border-input rounded-e-md"
          onClick={() => addTokens(draft)}
          aria-label={t("add") ?? "Add"}
          tabIndex={-1}
        >
          <Add size="24" color="#000" />
        </button>
      </div>

      {/* chips */}
      {values.length > 0 && (
        <div className={cn("flex flex-wrap gap-2 pt-1")}>
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 ty-body-xs text-primary-700"
            >
              {v}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={t("remove") ?? "Remove"}
              >
                <CloseCircle size="16" color="#000" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttributeValuesInput;
