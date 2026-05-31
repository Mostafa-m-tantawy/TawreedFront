"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import { PageResult } from "@/types/common";
import api from "@/lib/api.client";
import { cn } from "@/lib/utils";

export type OrderPartyAndMetaValues = {
  supplier_id: number | "";
  code: string;
  order_date: string;
  expected_delivery: string;
  payment_terms: string;
  currency_id: string;
};

export default function OrderPartyAndMeta({
  values,
  onChange,
  termsList,
  currencies,
  formErrors,
  initialSupplier,
}: {
  values: OrderPartyAndMetaValues;
  onChange: (patch: Partial<OrderPartyAndMetaValues>) => void;
  termsList: string[];
  currencies: Array<{
    id: number;
    title: string;
    symbol: string;
    code: string;
  }>;
  formErrors: Record<string, string>;
  initialSupplier?: { id: number; name: string };
}) {
  const t = useTranslations("");
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: number;
    name: string;
  }>({
    id: 0,
    name: "",
  });

  /** ---------------- Payment terms autocomplete state ----------------- */
  const [termsFilter, setTermsFilter] = useState<string>(
    values.payment_terms ?? ""
  );
  const [showTermsDropdown, setShowTermsDropdown] = useState(false);

  useEffect(() => {
    setTermsFilter(values.payment_terms ?? "");
  }, [values.payment_terms]);

  const filteredTerms = useMemo(() => {
    const v = (termsFilter ?? "").trim().toLowerCase();
    if (!v) return termsList.slice(0, 10);
    return termsList.filter((s) => s.toLowerCase().includes(v)).slice(0, 10);
  }, [termsFilter, termsList]);

  const handleSelectTerm = (term: string) => {
    setTermsFilter(term);
    setShowTermsDropdown(false);
    onChange({ payment_terms: term });
  };

  /** ---------- Currency search + pagination (client-side) ---------- */
  const [currencyQuery, setCurrencyQuery] = useState("");
  const [currencyPage, setCurrencyPage] = useState(1);
  const pageSize = 20;

  const filteredCurrencies = useMemo(() => {
    const q = currencyQuery.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter((c) =>
      [c.title, c.symbol, c.code].some((x) =>
        String(x).toLowerCase().includes(q)
      )
    );
  }, [currencies, currencyQuery]);

  const lastPage = Math.max(1, Math.ceil(filteredCurrencies.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (currencyPage - 1) * pageSize;
    return filteredCurrencies.slice(start, start + pageSize);
  }, [filteredCurrencies, currencyPage]);

  const selectedCurrency = useMemo(
    () =>
      currencies.find((c) => String(c.id) === String(values.currency_id || "")),
    [currencies, values.currency_id]
  );

  // Compose the list shown: pinned selected (if any) + current page, without duplicates
  const displayedItems = useMemo(() => {
    const dedupIds = new Set<number>();
    const out: typeof currencies = [];
    if (selectedCurrency) {
      dedupIds.add(selectedCurrency.id);
      out.push(selectedCurrency);
    }
    for (const it of pageItems) {
      if (!dedupIds.has(it.id)) {
        dedupIds.add(it.id);
        out.push(it);
      }
    }
    return out;
  }, [pageItems, selectedCurrency]);

  const resetCurrencyPaging = () => {
    setCurrencyPage(1);
  };

  const fetchSuppliersPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/purchase-orders/get-suppliers`, {
      params: {
        page,
        per_page: 10,
        name: query || undefined,
      },
    });

    const items =
      (res?.data?.data ?? []).map((u: any) => ({
        id: u.id,
        name: u.name,
      })) ?? [];

    const meta = res?.data?.meta ?? {};
    return {
      items,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? items.length,
    };
  };

  useEffect(() => {
    if (selectedSupplier.id) {
      onChange({ supplier_id: selectedSupplier.id });
    }
  }, [selectedSupplier]);

  useEffect(() => {
    if (initialSupplier && initialSupplier.id) {
      setSelectedSupplier({
        id: initialSupplier.id,
        name: initialSupplier.name,
      });
      return;
    }
  }, [initialSupplier, values.supplier_id]);

  return (
    <div className="rounded-2xl bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>{t("Supplier")}</Label>

        <div className="mt-4">
          <PagedSingleSelect
            disabled={false}
            value={selectedSupplier.id || ""}
            display={selectedSupplier.name || ""}
            placeholder={t("Select a Supplier")}
            fetchPage={fetchSuppliersPage}
            onChange={(id, name) =>
              setSelectedSupplier({
                id,
                name,
              })
            }
            t={t}
            error={!!formErrors.supplier_id}
          />
        </div>

        {formErrors.supplier_id && (
          <p className="mt-1 text-sm text-destructive text-start">
            {formErrors.supplier_id}
          </p>
        )}
      </div>

      <Input
        label={t("PO-number")}
        placeholder="PO-1001"
        value={values.code}
        onChange={(e) => onChange({ code: e.target.value })}
        error={formErrors.code}
      />

      <Input
        type="date"
        label={t("Order date")}
        value={values.order_date}
        onChange={(e) => onChange({ order_date: e.target.value })}
        error={formErrors.order_date}
      />
      <Input
        type="date"
        label={t("Expected Delivery Date")}
        value={values.expected_delivery}
        onChange={(e) => onChange({ expected_delivery: e.target.value })}
        error={formErrors.expected_delivery}
      />

      {/* Payment Terms: autocomplete + free text */}
      <div className="relative">
        <Label>{t("Payment Terms")}</Label>

        <div className="mt-4">
          <Input
            label={undefined}
            placeholder={t("Payment Terms")}
            value={termsFilter}
            onChange={(e) => {
              const val = e.target.value;
              setTermsFilter(val);
              setShowTermsDropdown(true);
              onChange({ payment_terms: val });
            }}
            onFocus={() => setShowTermsDropdown(true)}
            onBlur={() => {
              // small timeout to allow click to register on suggestion
              setTimeout(() => setShowTermsDropdown(false), 150);
            }}
            error={formErrors.payment_terms}
          />
        </div>

        {showTermsDropdown && filteredTerms.length > 0 && (
          <ul
            className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-white shadow-lg"
            role="listbox"
          >
            {filteredTerms.map((term, idx) => (
              <li
                key={term + idx}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectTerm(term);
                }}
                role="option"
                aria-selected={values.payment_terms === term}
              >
                {term}
              </li>
            ))}
          </ul>
        )}

        {formErrors.payment_terms && (
          <p className="mt-1 text-sm text-destructive text-start">
            {formErrors.payment_terms}
          </p>
        )}
      </div>

      <div>
        <Label>{t("Currency")}</Label>
        <Select
          value={String(values.currency_id)}
          onValueChange={(v) => onChange({ currency_id: v })}
          onOpenChange={(open: boolean) => {
            if (open) resetCurrencyPaging();
          }}
        >
          <SelectTrigger
            className={cn(
              "mt-4",
              formErrors.currency_id && "border-destructive"
            )}
          >
            <SelectValue placeholder={t("select currency")} />
          </SelectTrigger>

          <SelectContent onKeyDown={(e) => e.stopPropagation()}>
            <div className="p-2 bg-white">
              <Input
                placeholder={t("Search currency by name, code, or symbol")}
                value={currencyQuery}
                onChange={(e) => {
                  setCurrencyQuery(e.target.value);
                  setCurrencyPage(1);
                }}
              />
            </div>

            {selectedCurrency && (
              <>
                <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("Selected")}
                </div>
                <SelectItem value={String(selectedCurrency.id)}>
                  {selectedCurrency.title} ({selectedCurrency.code}) —{" "}
                  {selectedCurrency.symbol}
                </SelectItem>
                <div className="my-1 border-t" />
                <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("Results")}
                </div>
              </>
            )}

            {/* Paged results (de-duped from the pinned selected) */}
            {displayedItems.length ? (
              displayedItems.map((c, idx) => {
                if (
                  selectedCurrency &&
                  c.id === selectedCurrency.id &&
                  idx === 0
                ) {
                  return null;
                }
                return (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title} ({c.code}) — {c.symbol}
                  </SelectItem>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {t("noResults")}
              </div>
            )}

            {/* Pagination footer */}
            <div className="flex items-center justify-between gap-2 p-2 border-t">
              <div className="text-xs text-muted-foreground">
                {t("Showing")}{" "}
                {filteredCurrencies.length
                  ? `${(currencyPage - 1) * pageSize + 1}-${Math.min(
                      currencyPage * pageSize,
                      filteredCurrencies.length
                    )}`
                  : "0-0"}{" "}
                {t("of")} {filteredCurrencies.length}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrencyPage((p) => Math.max(1, p - 1))}
                  disabled={currencyPage <= 1}
                >
                  {t("Prev")}
                </Button>
                <span className="text-xs">
                  {currencyPage} / {lastPage}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrencyPage((p) => Math.min(lastPage, p + 1))
                  }
                  disabled={currencyPage >= lastPage}
                >
                  {t("Next")}
                </Button>
              </div>
            </div>
          </SelectContent>
        </Select>

        {formErrors.currency_id && (
          <p className="mt-1 text-sm text-destructive text-start">
            {formErrors.currency_id}
          </p>
        )}
      </div>
    </div>
  );
}
