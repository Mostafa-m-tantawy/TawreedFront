"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Attribute = { name: string; value: string };

export default function ProductAttributesSlider({
  attributes,
  className,
}: {
  attributes: Attribute[];
  className?: string;
}) {
  const [page, setPage] = React.useState(0);
  const perPage = 2;

  const totalPages = Math.max(
    1,
    Math.ceil((attributes?.length ?? 0) / perPage)
  );

  // Clamp page if attributes change
  React.useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [totalPages, page]);

  if (!attributes?.length) return null;

  const start = page * perPage;
  const current = attributes.slice(start, start + perPage);

  const chipStyle = (i: number) => {
    const even = (start + i) % 2 === 0;
    return {
      color: even ? "#B29049" : "#1E2C39",
      backgroundColor: even ? "#F6F2E9" : "#DAE1F1",
      borderColor: even ? "#EAE1CC" : "#B4C2E4",
    } as React.CSSProperties;
  };

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className={cn("relative", className)}>
      {/* Inline controls + chips */}
      <div className="flex items-center justify-between gap-2">
        {/* Prev */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!canPrev}
          className={cn(
            `h-7 w-7 shrink-0 rounded-full border bg-white/90 backdrop-blur
             flex items-center justify-center shadow-sm transition`,
            !canPrev
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-white active:scale-95"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>

        {/* Chips (2 max per page) */}
        <div className="flex items-center flex-wrap gap-2">
          {current.map((av, i) => (
            <span
              key={`${av.name}-${start + i}`}
              className="inline-flex items-center rounded-full px-1 text-[8px] border"
              style={chipStyle(i)}
              title={`${av.name}: ${av.value}`}
            >
              {av.name}: {av.value}
            </span>
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          aria-label="Next"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={!canNext}
          className={cn(
            `h-7 w-7 shrink-0 rounded-full border bg-white/90 backdrop-blur
             flex items-center justify-center shadow-sm transition`,
            !canNext
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-white active:scale-95"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
