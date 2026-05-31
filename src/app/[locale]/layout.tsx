import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { poppins, cairo } from "@/fonts";
import "../globals.css";
import { AppInitializer } from "@/components/AppInitializer";
import { Suspense } from "react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function LoadingFallback() {
  return (
    <div className="min-h-dvh grid place-items-center">
      <div
        aria-label="Loading"
        role="status"
        className="flex items-center gap-3 text-muted-foreground"
      >
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  const fontClass = locale === "ar" ? cairo.className : poppins.className;

  return (
    <div
      lang={locale}
      className={fontClass}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        <AppInitializer />
      </NextIntlClientProvider>
    </div>
  );
}
