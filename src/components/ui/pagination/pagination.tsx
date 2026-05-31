"use client";

import { useLocale } from "next-intl";
import {
  PaginationUI,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination/components";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (totalPages < 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);

    if (start > 2) {
      pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    if (totalPages > 1) {
      pages.push(totalPages); // Always show last page
    }

    return pages;
  };

  const handleChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <PaginationUI dir={isRTL ? "rtl" : "ltr"}>
      {/* Swap arrows based on direction */}
      {isRTL ? (
        <>
          <PaginationNext onClick={() => handleChange(currentPage - 1)} />
          <PaginationContent>
            {generatePageNumbers().map((page, index) => {
              if (page === "ellipsis-start" || page === "ellipsis-end") {
                return <PaginationEllipsis key={page + index} />;
              }
              const pageNumber = page as number;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => handleChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </PaginationContent>
          <PaginationPrevious onClick={() => handleChange(currentPage + 1)} />
        </>
      ) : (
        <>
          <PaginationPrevious onClick={() => handleChange(currentPage - 1)} />
          <PaginationContent>
            {generatePageNumbers().map((page, index) => {
              if (page === "ellipsis-start" || page === "ellipsis-end") {
                return <PaginationEllipsis key={page + index} />;
              }
              const pageNumber = page as number;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => handleChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </PaginationContent>
          <PaginationNext onClick={() => handleChange(currentPage + 1)} />
        </>
      )}
    </PaginationUI>
  );
}
