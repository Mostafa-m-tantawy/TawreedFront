"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category, FormValues, ProductFlow } from "../types";
import { useLocale, useTranslations } from "next-intl";
import CategoryTreeSelect from "@/components/Dashboard/InventorySettings/CategoryTreeSelect";
import FileInput from "@/components/ui/file-input";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function BasicInfo({
  kind,
  values,
  imageToEdit,
  setImageToEdit,
  errors,
  disabled,
  categories,
  productFlows,
  onChangeText,
  onChangeSelect,
  onFile,
  onSelectCategory,
  isPhysicalOrGrouped,
  isEditing,
}: {
  kind: "service" | "physical" | "grouped-product";
  values: FormValues;
  imageToEdit?: any[];
  setImageToEdit?: Dispatch<SetStateAction<any[]>>;
  errors: Record<string, string>;
  disabled: boolean;
  categories: (Category & { parentId?: number | null })[];
  productFlows: ProductFlow[];
  onChangeText: (k: keyof FormValues, v: string) => void;
  onChangeSelect: (k: keyof FormValues, v: string) => void;
  onFile: (f: File | null) => void;
  onSelectCategory: (id: number | "") => void;
  isPhysicalOrGrouped?: boolean;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("");
  const isRTL = useLocale() === "ar";

  const isPhysical = kind === "physical";
  const isService = kind === "service";
  const isGrouped = kind === "grouped-product";

  const initialProductFlow = useMemo(() => {
    if (isPhysical) {
      return values.product_flow || (kind as string);
    }

    return kind as string;
  }, [isPhysical]);

  const [productFlow, setProductFlow] = useState(initialProductFlow);

  const productOptions = useMemo(() => {
    let options: any = [];

    const flows = productFlows.map((f) => ({
      value: f,
      label:
        f === "product"
          ? t("Products")
          : f === "raw_material"
          ? t("Raw Material")
          : t("Finished good"),
    }));

    if (isPhysical) {
      if (!isEditing) {
        options = [
          { value: "service", label: t("Service Product") },
          { value: "grouped-product", label: t("Grouped Product") },
        ];
      }

      options = [...options, ...flows];
    }

    if (isService) {
      options = [
        // { value: "physical", label: t("Physical Product") },
        { value: "service", label: t("Service Product") },
        { value: "grouped-product", label: t("Grouped Product") },
        ...flows,
      ];
    }

    if (isGrouped) {
      options = [
        // { value: "physical", label: t("Physical Product") },
        { value: "grouped-product", label: t("Grouped Product") },
        { value: "service", label: t("Service Product") },
        ...flows,
      ];
    }

    return options;
  }, [productFlows]);

  useEffect(() => {
    if (productFlow === "service") {
      if (!isEditing) router.replace("/dashboard/products/create/service");
    } else if (productFlow === "grouped-product") {
      if (!isEditing)
        router.replace("/dashboard/products/create/grouped-product");
    } else {
      if (!isPhysical) {
        router.replace("/dashboard/products/create");
      }
      onChangeSelect("product_flow", productFlow);
    }
  }, [productFlow]);

  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Basic Information")}
      </p>

      {/* Flow + Category */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {(isPhysical || !isEditing) && (
          <div>
            <Label>{t("Product flow")}</Label>
            <Select
              value={productFlow}
              onValueChange={(v) => setProductFlow(v)}
            >
              <SelectTrigger id={"product_flow"} className="mt-4">
                <SelectValue placeholder={t("selectOption")} />
              </SelectTrigger>
              <SelectContent>
                {(productOptions ?? []).map((opt: any) => {
                  const { value, label } = opt;
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {/* <div className="mt-4 flex flex-wrap gap-2">
              {productFlows.map((pf) => (
                <button
                  key={pf}
                  type="button"
                  onClick={() => onChangeSelect("product_flow", pf)}
                  className={
                    "rounded-xl border px-4 py-2 h-full" + // <-- space fixed before conditional classes
                    (values.product_flow === pf
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200")
                  }
                  disabled={disabled}
                ></button>
              ))}
            </div> */}
          </div>
        )}
        {isPhysical && (
          <div>
            <Label>{t("Category")}</Label>
            <CategoryTreeSelect
              categories={(categories ?? []) as any}
              value={values.category_id ? String(values.category_id) : ""}
              onChange={(v) => onSelectCategory(v ? Number(v) : "")}
              placeholder={t("selectOption")}
              inputPlaceholder={t("search")}
              emptyLabel={t("noRecords")}
              allowParentSelection
              rtl={isRTL}
              error={!!errors.category_id}
              disabled={disabled}
              leafOnly
            />
            {errors.category_id && (
              <p className="mt-1 text-sm text-destructive text-start">
                {errors.category_id}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Name / SKU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("Product Name")}
          placeholder={t("enter your product name")}
          value={values.name}
          onChange={(e) => onChangeText("name", e.target.value)}
          disabled={disabled}
          error={errors.name}
        />
        <Input
          label={t("SKU / Serial Number")}
          placeholder={t("enter your unique identifier for your product")}
          value={values.sku}
          onChange={(e) => onChangeText("sku", e.target.value)}
          disabled={disabled}
          error={errors.sku}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={kind === "service" ? "col-span-full" : ""}>
          <Input
            label={t("Brand")}
            placeholder={t("enter brand name")}
            value={values.brand_name}
            onChange={(e) => onChangeText("brand_name", e.target.value)}
            disabled={disabled}
            error={errors.brand_name}
          />
        </div>

        {isPhysicalOrGrouped && (
          <Input
            label={t("barcode")}
            placeholder={t("barcode")}
            value={values.barcode}
            onChange={(e) => onChangeText("barcode", e.target.value)}
            disabled={disabled}
            error={errors.barcode}
          />
        )}
      </div>

      {/* Description */}
      <div>
        <Label>{t("Description")}</Label>
        <Textarea
          placeholder={t("enter your product description")}
          value={values.description}
          onChange={(e) => onChangeText("description", e.target.value)}
          disabled={disabled}
          className="mt-2"
          error={errors.description}
        />
      </div>

      <FileInput
        value={values.image ? [values.image] : []}
        existing={imageToEdit}
        onChangeExisting={setImageToEdit}
        onChange={(arr) => onFile(arr[0] ?? null)}
        accept="image/*"
        multiple={false}
        maxFiles={1}
        maxSizeMB={50}
        disabled={disabled}
        label={() => t("addProductImage")}
        description={({ size }) => t("uploadHintWithLimit", { size })}
        browseLabel={() => t("browseFile")}
        filesSelectedText={({ count }) => t("filesSelected", { count })}
        error={errors.image}
      />
    </div>
  );
}
