"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonMasterDataForm from "../CommonMasterDataElements/CommonMasterDataList/CommonMasterDataForm";
import { useTranslations } from "next-intl";

export default function EditSupplier({ id }: { id: number }) {
  const router = useRouter();
  const t = useTranslations("");

  return (
    <CommonMasterDataForm
      party="supplier"
      mode="edit"
      id={id}
      showBack={
        <Link
          href="/dashboard/suppliers"
          className="ty-body-sm text-primary-700 w-fit"
        >
          ← {t("Back to {cap}", { cap: t("Suppliers") })}
        </Link>
      }
      onSuccess={() => {
        router.push("/dashboard/suppliers");
        router.refresh();
      }}
    />
  );
}
