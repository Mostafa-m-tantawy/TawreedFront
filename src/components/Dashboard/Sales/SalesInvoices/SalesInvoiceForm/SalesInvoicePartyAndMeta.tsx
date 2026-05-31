"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import api from "@/lib/api.client";
import type { PageResult } from "@/types/common";

export type SalesPartyMetaValues = {
  customer_id: number | "";
  code: string;
  invoice_date: string;
  so_id: number | "";
  payment_terms: string | "";
};

export default function SalesInvoicePartyAndMeta({
  values,
  onChange,
  termsList,
  soDisabled,
  formErrors,
}: {
  values: SalesPartyMetaValues;
  onChange: (patch: Partial<SalesPartyMetaValues>) => void;
  termsList: string[];
  soDisabled?: boolean;
  formErrors: Record<string, string>;
}) {
  const t = useTranslations("");

  /** ----------------------- Selected display state ---------------------- */
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  }>({
    id: 0,
    name: "",
  });
  const [selectedSO, setSelectedSO] = useState<{ id: number; name: string }>({
    id: 0,
    name: "",
  });

  /** ------------------------ preload when editing ----------------------- */
  useEffect(() => {
    const loadCustomer = async () => {
      if (values.customer_id && !selectedCustomer.name) {
        try {
          const res = await api.get(`/admin/customers/${values.customer_id}`);
          setSelectedCustomer({
            id: res.data?.data?.id,
            name: res.data?.data?.name,
          });
        } catch {
          setSelectedCustomer({
            id: Number(values.customer_id),
            name: `#${values.customer_id}`,
          });
        }
      }
    };
    loadCustomer();
  }, [values.customer_id]);

  useEffect(() => {
    const loadSO = async () => {
      if (values.so_id && !selectedSO.name) {
        try {
          const res = await api.get(`/admin/sales-orders/${values.so_id}`);
          setSelectedSO({ id: res.data?.data?.id, name: res.data?.data?.code });
        } catch {
          setSelectedSO({
            id: Number(values.so_id),
            name: `SO #${values.so_id}`,
          });
        }
      }
    };
    loadSO();
  }, [values.so_id]);

  /** -------------------- paged fetchers ------------------- */
  const fetchCustomersPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/customers`, {
      params: {
        page,
        per_page: 20,
        status: "active",
        name: query || undefined,
      },
    });
    const items =
      (res?.data?.data ?? []).map((u: any) => ({ id: u.id, name: u.name })) ??
      [];
    const meta = res?.data?.meta ?? {};
    return {
      items,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? items.length,
    };
  };

  const fetchSalesOrdersPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/sales-invoices/get-sales-orders`, {
      params: {
        page,
        per_page: 10,
        search: query || undefined,
        customer_id: values.customer_id || undefined,
      },
    });
    const items =
      (res?.data?.data ?? []).map((u: any) => ({ id: u.id, name: u.code })) ??
      [];
    const meta = res?.data?.meta ?? {};
    return {
      items,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? items.length,
    };
  };

  /** ------------------------------- UI --------------------------------- */
  const Err = ({ field }: { field: string }) =>
    formErrors[field] ? (
      <p className="mt-1 text-sm text-destructive text-start">
        {formErrors[field]}
      </p>
    ) : null;

  /** ---------------- Payment terms autocomplete state ----------------- */
  const [showTermsDropdown, setShowTermsDropdown] = useState(false);
  const [filter, setFilter] = useState<string>(values.payment_terms ?? "");

  useEffect(() => {
    setFilter(values.payment_terms ?? "");
  }, [values.payment_terms]);

  const filteredTerms = useMemo(() => {
    const v = (filter ?? "").trim().toLowerCase();
    if (!v) return termsList.slice(0, 10);
    return termsList.filter((s) => s.toLowerCase().includes(v)).slice(0, 10);
  }, [filter, termsList]);

  const handleSelectTerm = (term: string) => {
    setFilter(term);
    setShowTermsDropdown(false);
    onChange({ payment_terms: term });
  };

  return (
    <div className="rounded-2xl bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Customer */}
      <div>
        <Label>{t("Customer")}</Label>
        <div className="mt-4">
          <PagedSingleSelect
            disabled={false}
            value={selectedCustomer.id || ""}
            display={selectedCustomer.name || ""}
            placeholder={t("Select a Customer")}
            fetchPage={fetchCustomersPage}
            onChange={(id, name) => {
              setSelectedCustomer({ id, name });
              // clearing the Sales Order if customer changes
              if (values.so_id) {
                setSelectedSO({ id: 0, name: "" });
                onChange({ so_id: "" });
              }
              onChange({ customer_id: id });
            }}
            t={t}
            error={!!formErrors.customer_id}
          />
        </div>
        <Err field="customer_id" />
      </div>

      {/* Invoice number */}
      <Input
        label={t("Invoice Number")}
        placeholder={t("add invoice number")}
        value={values.code}
        onChange={(e) => onChange({ code: e.target.value })}
        error={formErrors.code}
      />

      {/* Invoice date */}
      <Input
        type="date"
        label={t("Invoice date")}
        value={values.invoice_date}
        onChange={(e) => onChange({ invoice_date: e.target.value })}
        error={formErrors.invoice_date}
      />

      {/* Linked Sales Order */}
      <div>
        <Label>
          {t("Linked Sales Order")}{" "}
          <span className="text-muted-foreground">
            ({t("Please select a customer first")})
          </span>
        </Label>
        <div className="mt-4">
          <PagedSingleSelect
            disabled={soDisabled}
            value={selectedSO.id || ""}
            display={selectedSO.name || ""}
            placeholder={t("select sales order")}
            fetchPage={fetchSalesOrdersPage}
            onChange={(id, name) => {
              setSelectedSO({ id, name });
              onChange({ so_id: id });
            }}
            t={t}
            error={!!(formErrors.so_id || formErrors.sales_order_id)}
          />
        </div>
        <Err field="so_id" />
        <Err field="sales_order_id" />
      </div>

      {/* Payment terms (autocomplete + free text) */}
      <div className="relative">
        <Label>{t("Payment Terms")}</Label>
        <div className="mt-4">
          <Input
            label={undefined}
            placeholder={t("select payment terms")}
            value={filter}
            onChange={(e) => {
              const val = e.target.value;
              setFilter(val);
              setShowTermsDropdown(true);
              onChange({ payment_terms: val });
            }}
            onFocus={() => setShowTermsDropdown(true)}
            onBlur={() => setTimeout(() => setShowTermsDropdown(false), 150)}
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
        <Err field="payment_terms" />
      </div>
    </div>
  );
}
