"use client";

import { Badge } from "@/components/ui/badge";
import { MapPin, User2, Phone, PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";

export default function WarehouseHeader({
  name,
  address,
  manager,
  phone,
  capacity,
  status,
}: {
  name: string;
  address: string;
  manager: string;
  phone: string;
  capacity: string;
  status: "active" | "inactive";
}) {
  const t = useTranslations("warehouse.header");

  return (
    <div className="rounded-2xl bg-white p-6">
      <h2 className="text-lg font-semibold text-[#111827]">{name}</h2>
      <p className="text-sm text-muted-foreground mt-1">{t("detailsTitle")}</p>

      <div className="mt-6 divide-y rounded-2xl border">
        <InfoRow
          icon={<MapPin className="h-5 w-5" />}
          label={t("address")}
          value={address}
        />
        <InfoRow
          icon={<User2 className="h-5 w-5" />}
          label={t("manager")}
          value={manager}
        />
        <InfoRow
          icon={<Phone className="h-5 w-5" />}
          label={t("contactNumber")}
          value={phone}
        />
        <InfoRow
          icon={<PackageOpen className="h-5 w-5" />}
          label={t("capacity")}
          value={capacity}
        />
        <div className="grid grid-cols-12 items-center p-4">
          <div className="col-span-3 text-sm text-muted-foreground">
            {t("status")}
          </div>
          <div className="col-span-9">
            <Badge
              className={
                status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }
            >
              {status === "active" ? t("active") : t("inactive")}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-center p-4">
      <div className="col-span-3 flex items-center gap-3 text-sm text-[#6B7280]">
        <span>{icon}</span>
        {label}
      </div>
      <div className="col-span-9 text-sm text-[#111827]">{value}</div>
    </div>
  );
}
