"use client";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton as ShadcnSkeleton } from "@/components/ui/skeleton";
const Skeleton =
  ShadcnSkeleton ??
  (({ className }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-md bg-neutral-200 ${className ?? ""}`}
    />
  ));

export type Column<Row> = {
  key: string;
  headerKey: string; // i18n key for header
  className?: string;
  render: (row: Row, idx: number) => React.ReactNode;
};

export default function PurchaseTable<Row>({
  rows,
  loading,
  columns,
  emptyI18nKey = "noRecords",
}: {
  rows: Row[];
  loading?: boolean;
  columns: Column<Row>[];
  emptyI18nKey?: string;
}) {
  const t = useTranslations("");
  const empty = !rows || rows.length === 0;
  return (
    <div className="mt-4 overflow-x-auto">
      <Table
        className="border-separate border-spacing-y-1"
        style={
          loading && rows.length ? { pointerEvents: "none", opacity: 0.5 } : {}
        }
      >
        <TableHeader className="border-0">
          <TableRow className="border-0">
            {columns.map((c) => (
              <TableHead key={c.key} className={c.className}>
                {t(c.headerKey)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="ty-body-sm text-neutral-black-800 border-0">
          {loading &&
            empty &&
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow
                key={`l-${i}`}
                className="border-0"
                style={{
                  borderRadius: 12,
                  backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                }}
              >
                {columns.map((c, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-[70%]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!empty &&
            rows.map((r, i) => (
              <TableRow
                key={i}
                className="border-0"
                style={{
                  borderRadius: 12,
                  backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                }}
              >
                {columns.map((c, j) => (
                  <TableCell
                    key={`${c.key}-${j}`}
                    className={
                      j === 0
                        ? "rounded-s-xl"
                        : j === columns.length - 1
                        ? "rounded-e-xl"
                        : ""
                    }
                  >
                    {c.render(r, i)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {empty && !loading && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t(emptyI18nKey)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
