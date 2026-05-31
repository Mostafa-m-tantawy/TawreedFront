"use client";

import * as React from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ArrowDown2 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

type LocaleOption = { code: "en" | "ar"; label: string };

const LOCALES: LocaleOption[] = [
  { code: "en", label: "English (US)" },
  { code: "ar", label: "العربية" },
];

const LanguageSwitcher = ({ isDropDown = true }: { isDropDown?: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams() as { locale?: string };

  const current = (params?.locale === "ar" ? "ar" : "en") as "en" | "ar";
  const currentLabel =
    LOCALES.find((l) => l.code === current)?.label ?? "English";

  const switchTo = (to: "en" | "ar") => {
    if (to === current) return;

    document.cookie = `locale=${to}; path=/; max-age=31536000`;

    const nextPath = pathname
      ? pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${to}`)
      : `/${to}`;

    router.push(nextPath);
    router.refresh();
  };

  if (isDropDown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="min-w-20 flex-center gap-2 text-[#333333]"
          >
            <span className="truncate">{currentLabel}</span>
            <ArrowDown2 size={16} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-40">
          {LOCALES.map((opt) => (
            <DropdownMenuItem
              key={opt.code}
              onSelect={(e) => {
                e.preventDefault();
                switchTo(opt.code);
              }}
              className="flex items-center justify-between cursor-pointer"
              style={
                opt.code === "ar"
                  ? {
                      fontFamily: "Cairo, sans-serif",
                    }
                  : {
                      fontFamily: "Poppins, sans-serif",
                    }
              }
            >
              <span>{opt.label}</span>
              {opt.code === current && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="grid xs:grid-cols-2 bg-primary-50 rounded-xl">
      {LOCALES.map((opt) => (
        <button
          key={opt.code}
          onClick={() => switchTo(opt.code)}
          className={cn(
            "text-center text-sm cursor-pointer py-2 rounded-xl",
            opt.code === current
              ? "bg-primary-700 text-white"
              : "text-[#464646]"
          )}
          type="button"
          style={
            opt.code === "ar"
              ? {
                  fontFamily: "Cairo, sans-serif",
                }
              : {
                  fontFamily: "Poppins, sans-serif",
                }
          }
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
