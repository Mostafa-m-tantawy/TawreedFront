"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { Add } from "iconsax-reactjs";

import { Button } from "@/components/ui/button";
import SectionCard from "@/components/Dashboard/Purchase/ShowPurchase/sections/SectionCard";
import KeyValueGrid from "@/components/Dashboard/Purchase/ShowPurchase/sections/KeyValueGrid";
import StatusPill from "@/components/Dashboard/Purchase/ShowPurchase/sections/StatusPill";
import ProtectedElement from "@/components/ui/protected-element";
import OrderedItemsTab from "@/components/Dashboard/Purchase/ShowPurchase/sections/ItemsTab";
import ExportMenu from "@/components/Dashboard/Purchase/Common/ExportMenu";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";

// Mock API for demo
async function mockApiGet(path: string) {
  console.log("Mock GET:", path);
  await new Promise((r) => setTimeout(r, 400));

  return {
    data: {
      id: 12,
      code: "QT-2025-009",
      date: "2025-10-12",
      customer: { id: 2, name: "Elegant Interiors" },
      validity_period: 30,
      status: "Pending",
      notes: "Valid for 30 days from issue date.",
      currency: { id: 1, title: "Saudi Riyal", symbol: "ر.س", code: "SAR" },
      quotation_items: [
        {
          id: 1,
          productable: { name: "Curtain Fabric", sku: "CF-100" },
          quantity: 20,
          price: 50,
          discount: 5,
          tax: 7.5,
          total_price: 1000,
          unit: { name: "Meter", short_code: "M" },
        },
        {
          id: 2,
          productable: { name: "Metal Rod", sku: "MR-200" },
          quantity: 10,
          price: 80,
          discount: 10,
          tax: 12,
          total_price: 800,
          unit: { name: "Piece", short_code: "P" },
        },
      ],
    },
  };
}

export default function SalesQuotationDetails({ id }: { id: number }) {
  const t = useTranslations("");
  const locale = useLocale();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockApiGet(`/admin/quotations/${id}`);
      setQuotation(res.data);
    } catch (e: any) {
      toast.error(t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!quotation) return null;

  const { code, date, customer, validity_period, status, notes, currency } =
    quotation;
  const items = quotation.quotation_items || [];

  // Totals
  const subtotal = items.reduce(
    (s: number, i: any) => s + i.quantity * i.price,
    0
  );
  const discount = items.reduce(
    (s: number, i: any) => s + (i.discount ?? 0),
    0
  );
  const tax = items.reduce((s: number, i: any) => s + (i.tax ?? 0), 0);
  const grandTotal = subtotal - discount + tax;

  // Actions
  const handleConvertToOrder = () => {
    toast.success(t("Quotation converted to Sales Order"));
  };

  const handleReject = () => {
    toast.error(t("Quotation rejected"));
  };

  const handlePrint = () => window.print();

  const canShowApprove = status?.toLowerCase() === "pending";
  const canShowReject = status?.toLowerCase() === "pending";

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/sales/quotations"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Quotations")}
      </Link>

      {/* Header & Inline Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t("Quotation Details")}
        </h1>

        <div className="flex gap-2 flex-wrap">
          {canShowApprove && (
            <Button
              variant="secondary"
              onClick={handleConvertToOrder}
              disabled={loading}
              size="md"
              className="rounded-md font-normal !text-[#29A548]"
            >
              {t("Convert to Order")}
            </Button>
          )}

          {canShowReject && (
            <Button
              variant="secondary"
              onClick={handleReject}
              disabled={loading}
              size="md"
              className="rounded-md font-normal !text-[#FF3B30]"
            >
              {t("Reject")}
            </Button>
          )}

          {/* <ProtectedElement permissions="view-quotations"> */}
          <Button
            variant="secondary"
            onClick={handlePrint}
            disabled={loading}
            size="md"
            className="rounded-md font-normal"
          >
            <Printer size={18} />
            {t("Print")}
          </Button>
          {/* </ProtectedElement> */}

          {/* <ProtectedElement permissions="export-quotations"> */}
          <ExportMenu />
          {/* </ProtectedElement> */}
        </div>
      </div>

      {/* Summary Info */}
      <SectionCard>
        <KeyValueGrid
          cols={3}
          items={[
            { label: t("Quotation No"), value: code ?? "-" },
            { label: t("Quotation Date"), value: date ?? "-" },
            { label: t("Customer"), value: customer?.name ?? "-" },
            { label: t("Validity (days)"), value: validity_period ?? "-" },
            { label: t("Status"), value: <StatusPill value={status} /> },
          ]}
        />
      </SectionCard>

      {/* Products Table */}
      <SectionCard>
        <OrderedItemsTab
          currency={currency?.symbol || ""}
          rows={items.map((i: any) => ({
            ...i,
            sub_total: i.quantity * i.price,
            total_price: i.total_price,
          }))}
        />
      </SectionCard>

      {/* Totals */}
      <SectionCard>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{t("Notes")}</p>
            <p className="mt-1 text-sm">{notes || "-"}</p>
          </div>
          <div className="text-sm space-y-1 text-right">
            <p>
              {t("Subtotal")}: {currency?.symbol} {nfCurrency(locale, subtotal)}
            </p>
            <p>
              {t("Discount")}: {currency?.symbol} {nfCurrency(locale, discount)}
            </p>
            <p>
              {t("Taxes")}: {currency?.symbol} {nfCurrency(locale, tax)}
            </p>
            <hr className="my-2" />
            <p className="font-semibold">
              {t("Grand Total")}: {currency?.symbol}{" "}
              {nfCurrency(locale, grandTotal)}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
