"use client";

import { Button } from "@/components/ui/button";

export default function ActionsBar({
  submitting,
  loading,
  label,
}: {
  submitting: boolean;
  loading: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button type="submit" size="lg" disabled={submitting || loading}>
        {submitting && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
        )}
        {label}
      </Button>
    </div>
  );
}
