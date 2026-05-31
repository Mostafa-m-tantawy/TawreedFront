"use client";
import { cn } from "@/lib/utils";

export default function SectionCard({
  title,
  right,
  children,
  className,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl p-6", className)}>
      {(title || right) && (
        <div className="flex justify-between items-center mb-4">
          {typeof title === "string" ? (
            <p className="ty-body-md-2 text-[#111827]">{title}</p>
          ) : (
            title
          )}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
