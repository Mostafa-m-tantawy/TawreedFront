"use client";
import { cn } from "@/lib/utils";

export type KV = { label: string; value?: React.ReactNode };

export default function KeyValueGrid({
  items,
  cols = 3,
  className,
}: {
  items: KV[];
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const itemBoxCls = "border-t border-neutral-white-300 py-4";

  const firstRowResetCls = cn(
    "[&>*:first-child]:border-t-0 [&>*:first-child]:pt-0",
    "md:[&>*:nth-child(-n+2)]:border-t-0 md:[&>*:nth-child(-n+2)]:pt-0",
    cols === 3 &&
      "lg:[&>*:nth-child(-n+3)]:border-t-0 lg:[&>*:nth-child(-n+3)]:pt-0",
    cols === 4 &&
      "lg:[&>*:nth-child(-n+4)]:border-t-0 lg:[&>*:nth-child(-n+4)]:pt-0"
  );

  return (
    <div
      className={cn(
        // grid layout
        "grid gap-x- gap-y-2", // tighter gap-y; borders handle vertical separation
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        // apply the nth-child resets to the *children*
        firstRowResetCls,
        className
      )}
    >
      {items.map((kv, i) => (
        <div key={i} className={itemBoxCls}>
          <div className="text-secondary-500 ty-body-md">{kv.label}</div>
          <div className="ty-body-md text-black mt-2">{kv.value ?? "-"}</div>
        </div>
      ))}
    </div>
  );
}
