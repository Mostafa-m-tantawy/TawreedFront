"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import { useEffect, useState, useMemo } from "react";
import { PageResult } from "@/types/common";
import api from "@/lib/api.client";

export type InvoicePartyMetaValues = {
  supplier_id: number | "";
  code: string;
  invoice_date: string;
  po_id: number | "";
  payment_terms: string | "";
};

export default function InvoicePartyAndMeta({
  values,
  onChange,
  termsList,
  poDisabled,
  formErrors,
}: {
  values: InvoicePartyMetaValues;
  onChange: (patch: Partial<InvoicePartyMetaValues>) => void;
  termsList: string[];
  poDisabled?: boolean;
  formErrors: Record<string, string>;
}) {
  const t = useTranslations("");

  /** ----------------------- Selected display state ---------------------- */
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: number;
    name: string;
  }>({ id: 0, name: "" });

  const [selectedPO, setSelectedPO] = useState<{ id: number; name: string }>({
    id: 0,
    name: "",
  });

  /** ------------------------ preload when editing ----------------------- */
  useEffect(() => {
    const loadSupplier = async () => {
      if (values.supplier_id && !selectedSupplier.name) {
        try {
          const res = await api.get(`/admin/suppliers/${values.supplier_id}`);
          setSelectedSupplier({
            id: res.data?.data?.id,
            name: res.data?.data?.name,
          });
        } catch {
          setSelectedSupplier({
            id: Number(values.supplier_id),
            name: `#${values.supplier_id}`,
          });
        }
      }
    };
    loadSupplier();
  }, [values.supplier_id]);

  useEffect(() => {
    const loadPO = async () => {
      if (values.po_id && !selectedPO.name) {
        try {
          const res = await api.get(`/admin/purchase-orders/${values.po_id}`);
          setSelectedPO({ id: res.data?.data?.id, name: res.data?.data?.code });
        } catch {
          setSelectedPO({
            id: Number(values.po_id),
            name: `PO #${values.po_id}`,
          });
        }
      }
    };
    loadPO();
  }, [values.po_id]);

  /** -------------------- paged fetchers ------------------- */
  const fetchSuppliersPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/paginated-suppliers`, {
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

  const fetchPurchaseOrdersPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/purchase-invoices/get-purchase-orders`, {
      params: {
        page,
        per_page: 10,
        search: query || undefined,
        supplier_id: values.supplier_id || undefined,
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

  // Keep local filter in sync when external value changes (e.g., form reset)
  useEffect(() => {
    setFilter(values.payment_terms ?? "");
  }, [values.payment_terms]);

  // filtered list (case-insensitive substring match)
  const filteredTerms = useMemo(() => {
    const v = (filter ?? "").trim().toLowerCase();
    if (!v) return termsList.slice(0, 10); // show top few when empty
    return termsList.filter((s) => s.toLowerCase().includes(v)).slice(0, 10);
  }, [filter, termsList]);

  const handleSelectTerm = (term: string) => {
    setFilter(term);
    setShowTermsDropdown(false);
    onChange({ payment_terms: term });
  };

  return (
    <div className="rounded-2xl bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Supplier */}
      <div>
        <Label>{t("Supplier")}</Label>
        <div className="mt-4">
          <PagedSingleSelect
            disabled={false}
            value={selectedSupplier.id || ""}
            display={selectedSupplier.name || ""}
            placeholder={t("Select a Supplier")}
            fetchPage={fetchSuppliersPage}
            onChange={(id, name) => {
              setSelectedSupplier({ id, name });
              onChange({ supplier_id: id });
            }}
            t={t}
            error={!!formErrors.supplier_id}
          />
        </div>
        <Err field="supplier_id" />
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

      {/* Linked Purchase Order */}
      <div>
        <Label>{t("Linked Purchase Order")}</Label>
        <div className="mt-4">
          <PagedSingleSelect
            disabled={poDisabled}
            value={selectedPO.id || ""}
            display={selectedPO.name || ""}
            placeholder={t("Select a Purchase Order")}
            fetchPage={fetchPurchaseOrdersPage}
            onChange={(id, name) => {
              setSelectedPO({ id, name });
              onChange({ po_id: id });
            }}
            t={t}
            error={!!(formErrors.po_id || formErrors.purchase_order_id)}
          />
        </div>
        <Err field="po_id" />
        <Err field="purchase_order_id" />
      </div>

      {/* Payment terms (autocomplete + free text) */}
      <div className="relative">
        <Label>{t("Payment Terms")}</Label>

        <div className="mt-4">
          <Input
            label={undefined}
            placeholder={t("Payment Terms")}
            value={filter}
            onChange={(e) => {
              const val = e.target.value;
              setFilter(val);
              setShowTermsDropdown(true);
              // push immediate change so parent form sees the typed value
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

        {/* suggestions dropdown */}
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
