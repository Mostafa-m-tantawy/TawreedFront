import { DisplayItem } from "./ShowPurchase/sections/ItemsTable";

type UnitLite = { id: number; name: string; conversion_factor: number };

export function adaptOriginalUnit(productable: any): UnitLite | null {
  const product = productable?.product ?? productable;
  const u = product?.unit || product?.units;
  if (!u) return null;
  return {
    id: Number(u.id),
    name: String(u.name?.en ?? u.name ?? ""),
    conversion_factor: Number(u.conversion_factor ?? 1),
  };
}

export function adaptDerivedUnits(productable: any): UnitLite[] {
  const product = productable?.product ?? productable;
  const list = product?.units?.derived_units ?? product?.derived_units ?? [];
  return list.map((du: any) => ({
    id: Number(du.id),
    name: String(du.name?.en ?? du.name ?? ""),
    conversion_factor: Number(du.conversion_factor ?? 1),
  }));
}

export function adaptVariantAttributes(
  productable: any
): Array<{ name: string; value: string }> {
  const avs = productable?.attributeValues ?? [];
  return avs.map((av: any) => ({
    name: String(av?.name ?? ""),
    value: String(av?.value ?? ""),
  }));
}

export function normalizePurchaseItem(it: any) {
  const productable = it.productable ?? {};
  const type = String(it.productable_type ?? "Product");
  const pid = Number(productable.id);
  const key = `${type}:${pid}`;

  const name = productable?.name?.en ?? productable?.name ?? "";
  const sku = productable?.sku ?? null;

  const originalUnit = adaptOriginalUnit(productable);
  const derivedUnits = adaptDerivedUnits(productable);

  const unitsForRow = productable?.product
    ? productable.product?.units
    : productable?.units ?? {
        dervied_unit: derivedUnits,
      };

  const trackExpiry = Boolean(productable?.track_expiry_date);

  const attributes =
    type === "ProductVariant" ? adaptVariantAttributes(productable) : [];

  return {
    productKey: key,
    productLabel: sku ? `${name} - ${sku}` : name,

    // optional convenience fields
    product_id: pid,
    name,
    sku,

    // numbers
    quantity: Number(it.quantity ?? it.quantity_receive ?? 0),
    unit_price: Number(it.price ?? it.unit_price ?? 0),
    tax_percent: Number(it.tax ?? it.tax_percent ?? 0),

    // expiry
    expiry_date: it.expired_date ?? it.expiry_date ?? null,
    track_expiry_date: trackExpiry,

    // units
    unit: it?.unit || originalUnit, // currently-selected unit object
    originalUnit: originalUnit, // used for base-unit price hint
    units: unitsForRow, // provides the derived list

    // attributes (variants)
    attributes,

    // anything else your row type carries
    received_quantity: Number(it.received_quantity ?? 0),
    line_total: Number(it.sub_total ?? 0),
    unit_id: originalUnit?.id ?? it.unit_id ?? null,
    warehouse: it?.warehouse ?? null,
    warehouse_id: it?.warehouse?.id ?? null,
  };
}

export const editOrdDeleteStatuses = ["Draft", "Pending"];

/** Map a single PO item from API -> ItemsTable DisplayItem */
export function mapPOItemToDisplay(item: any): DisplayItem {
  const p = item?.productable ?? {};
  const unitFromProduct =
    item?.unit?.name ?? p?.unit?.name ?? p?.units?.name ?? null;

  const taxPercent =
    item?.tax != null
      ? Number(item.tax)
      : p?.tax_1 != null
      ? Number(p.tax_1)
      : null;

  return {
    product_name: p?.name ?? null,
    sku: p?.sku ?? null,

    quantity: item?.quantity ?? null,
    quantity_receive: item?.quantity_receive ?? item?.received_quantity ?? null,

    unit: unitFromProduct,

    unit_price: item?.price != null ? Number(item.price) : null,

    tax_percent: taxPercent,

    expiry_date: item?.expired_date ?? null,

    line_total:
      item?.total_price != null
        ? Number(item.total_price)
        : item?.quantity != null && item?.price != null
        ? Number(item.quantity) * Number(item.price)
        : null,
    warehouse: item?.warehouse ?? null,
  };
}

/** Map an array safely */
export function mapPOItemsToDisplay(
  rows: any[] | undefined | null
): DisplayItem[] {
  if (!Array.isArray(rows)) return [];
  return rows.map(mapPOItemToDisplay);
}
