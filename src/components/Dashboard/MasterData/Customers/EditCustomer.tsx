"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonMasterDataForm from "../CommonMasterDataElements/CommonMasterDataList/CommonMasterDataForm";
import { useTranslations } from "next-intl";

export default function EditCustomer({ id }: { id: number }) {
  const router = useRouter();
  const t = useTranslations("");

  return (
    <CommonMasterDataForm
      party="customer"
      mode="edit"
      id={id}
      showBack={
        <Link href="/dashboard/customers" className="text-sm text-slate-600">
          ← {t("Back to {cap}", { cap: t("Customers") })}
        </Link>
      }
      onSuccess={() => {
        router.push("/dashboard/customers");
        router.refresh();
      }}
    />
  );
}
