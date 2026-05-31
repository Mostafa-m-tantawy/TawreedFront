"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ArrowDown2, ClipboardExport, DocumentText } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

export default function ExportMenu() {
  const t = useTranslations("");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="md"
          variant="secondary"
          className="rounded-md font-normal"
        >
          {t("Export")} <ArrowDown2 size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={0} className="min-w-44 p-1 ">
        <DropdownMenuItem>
          <button
            type="button"
            className="w-full h-full text-secondary-500 ty-body-md flex items-center gap-1"
          >
            <DocumentText className="!w-5 !h-5" />
            {t("Export PDF")}
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button
            type="button"
            className="w-full h-full text-secondary-500 ty-body-md flex items-center gap-1"
          >
            <ClipboardExport className="!w-5 !h-5" />
            {t("Export Excel")}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
