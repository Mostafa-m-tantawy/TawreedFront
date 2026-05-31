"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api.client";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/ui/status-badge";

type CustomField = { id: number; name: string; value: string };

type PartyBase = {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_number: string | null;
  notes: string | null;
  status: "active" | "inactive" | string;
  custom_fields: CustomField[];
};

type SupplierDetails = PartyBase;
type CustomerDetails = PartyBase;

type UserRole = { id: number; name: string | null };
type UserDepartment = { id: number; name: any; status: string };
type UserDetails = {
  id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive" | string;
  role?: UserRole | null;
  department?: UserDepartment | null;
  avatar?: string | null;
};

type EntityKind = "supplier" | "customer" | "user";

export type EntityDetailsProps = {
  entity: EntityKind;
  id: number;
  backHref: string;
  className?: string;
};

const ENDPOINTS = {
  supplier: (id: number) => `/admin/suppliers/${id}`,
  customer: (id: number) => `/admin/customers/${id}`,
  user: (id: number) => `/admin/users/${id}`,
};

const TITLE_PLURAL_KEY: Record<EntityKind, string> = {
  supplier: "Suppliers",
  customer: "Customers",
  user: "Users",
};

function KV({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="ty-body-md text-secondary-500">{label}</div>
      <div className="ty-body-md text-black break-words">{value ?? "—"}</div>
    </div>
  );
}

function CustomFieldsTable({ fields }: { fields: CustomField[] }) {
  const t = useTranslations("");
  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead>{t("Name")}</TableHead>
            <TableHead>{t("Value")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {fields.map((f, idx) => (
            <TableRow
              key={f.id}
              className="border-0 hover:bg-opacity-80 text-start"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              <TableCell className="rounded-s-xl">{f.name}</TableCell>
              <TableCell className="rounded-e-xl">{f.value}</TableCell>
            </TableRow>
          ))}
          {!fields.length && (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                {t("noRecords")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EntityDetails({
  entity,
  id,
  backHref,
  className,
}: EntityDetailsProps) {
  const t = useTranslations("");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [supplier, setSupplier] = React.useState<SupplierDetails | null>(null);
  const [customer, setCustomer] = React.useState<CustomerDetails | null>(null);
  const [user, setUser] = React.useState<UserDetails | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const url = ENDPOINTS[entity](id);
        const res = await api.get(url);
        const data = res?.data?.data ?? res?.data;

        if (cancelled) return;
        if (entity === "supplier") setSupplier(data as SupplierDetails);
        else if (entity === "customer") setCustomer(data as CustomerDetails);
        else setUser(data as UserDetails);
      } catch (e: any) {
        const msg = e?.response?.data?.message || t("fetchFailed");
        if (!cancelled) {
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [entity, id, t]);

  const record =
    (entity === "supplier" && supplier) ||
    (entity === "customer" && customer) ||
    (entity === "user" && user);

  return (
    <div className={cn("p-4", className)}>
      {/* Back */}
      <div className="mb-4">
        <Link href={backHref} className="ty-body-sm text-primary-700 w-fit">
          ← {t("Back to {cap}", { cap: t(TITLE_PLURAL_KEY[entity]) })}
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="rounded-xl border bg-white p-6">{t("loading")}</div>
      )}
      {!loading && error && (
        <div className="rounded-xl border bg-white p-6 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && record && (
        <>
          {/* Title + status */}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="ty-body-xl-2 text-primary-700">
              {entity === "user"
                ? user?.name ||
                  [user?.first_name, user?.last_name]
                    .filter(Boolean)
                    .join(" ") ||
                  t("User")
                : (record as SupplierDetails | CustomerDetails).name}
            </h1>
            <StatusBadge value={(record as any).status} />
          </div>

          {/* Summary card */}
          <div className="rounded-2xl border border-neutral-white-300 bg-white p-6 mb-6">
            {entity !== "user" ? (
              <>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="text-primary-800 ty-body-lg">
                    <span>{t("Contact Person")} : </span>
                    <span>
                      {(record as SupplierDetails | CustomerDetails)
                        .contact_person || "—"}
                    </span>
                  </div>
                  <div className="ty-body-md text-neutral-black-100">
                    <span>{t("Phone number")} : </span>
                    <span>
                      {(record as SupplierDetails | CustomerDetails).phone ||
                        "—"}
                    </span>
                  </div>
                </div>

                {(record as SupplierDetails | CustomerDetails).notes ? (
                  <div className="mt-2 text-neutral-black-100">
                    <span className="ty-body-lg">{t("Note")} : </span>
                    <span className="ty-body-md">
                      {(record as SupplierDetails | CustomerDetails).notes}
                    </span>
                  </div>
                ) : null}

                <hr className="my-4 border-neutral-white-300" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <KV
                    label={t("Email Address")}
                    value={(record as any).email}
                  />
                  <KV label={t("Address")} value={(record as any).address} />
                  <KV
                    label={t("Tax Number")}
                    value={(record as any).tax_number}
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <KV label={t("Name")} value={user?.name} />
                <KV label={t("Email Address")} value={user?.email || "—"} />
                <KV label={t("Phone number")} value={user?.phone || "—"} />
                <KV label={t("Role")} value={user?.role?.name || "—"} />
                <KV
                  label={t("Department")}
                  value={
                    Array.isArray(user?.department?.name)
                      ? user?.department?.name?.join(" ")
                      : (user?.department?.name as any) || "—"
                  }
                />
              </div>
            )}
          </div>

          {(entity === "supplier" || entity === "customer") && (
            <div className="rounded-2xl border border-neutral-white-300 bg-white p-6">
              <h2 className="mb-2 ty-body-lg-2 text-primary-700 pb-4 border-b border-neutral-white-300">
                {t("Custom Fields")}
              </h2>
              <CustomFieldsTable
                fields={
                  (record as SupplierDetails | CustomerDetails).custom_fields ||
                  []
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
