"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Variant = {
  id: number;
  name: string;
  sku?: string | null;
  sale_price?: number | null;
  attributeValues?: { name: string; value: string }[];
};

type Product = {
  id: number;
  variants?: Variant[];
};

type AttrMap = Record<string, string>;

function shallowEqualObj(a: Record<string, any>, b: Record<string, any>) {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export default function VariantSelector({
  product,
  selectedVariantId,
  onChange,
  initialSelectedAttributes, // optional
  onAttributesChange, // optional
}: {
  product: Product;
  selectedVariantId: number | null;
  onChange: (id: number | null) => void;
  initialSelectedAttributes?: AttrMap;
  onAttributesChange?: (attrs: AttrMap) => void;
}) {
  const t = useTranslations("");
  const variants = product.variants ?? [];

  // ----- Build ordered attribute names (stable) -----
  const attributeNames = React.useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const v of variants) {
      for (const av of v.attributeValues ?? []) {
        if (!seen.has(av.name)) {
          seen.add(av.name);
          order.push(av.name);
        }
      }
    }
    return order;
  }, [variants]);

  // All distinct values per attribute
  const allAttributeValues = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const name of attributeNames) {
      const set = new Set<string>();
      for (const v of variants) {
        for (const av of v.attributeValues ?? []) {
          if (av.name === name) set.add(String(av.value));
        }
      }
      map.set(name, Array.from(set));
    }
    return map;
  }, [attributeNames, variants]);

  // Helpers
  const attrsOfVariant = React.useCallback(
    (vid: number | null): AttrMap => {
      if (!vid) return {};
      const v = variants.find((x) => x.id === vid);
      const m: AttrMap = {};
      for (const av of v?.attributeValues ?? []) m[av.name] = String(av.value);
      return m;
    },
    [variants]
  );

  const isMatch = React.useCallback((v: Variant, sel: AttrMap) => {
    const bag: AttrMap = {};
    for (const av of v.attributeValues ?? []) bag[av.name] = String(av.value);
    return Object.entries(sel).every(([k, val]) => bag[k] === val);
  }, []);

  const resolveVariantId = React.useCallback(
    (sel: AttrMap): number | null => {
      if (!attributeNames.length) return null;
      if (!attributeNames.every((a) => sel[a])) return null; // require full selection
      const matches = variants.filter((v) => isMatch(v, sel));
      return matches.length === 1 ? matches[0].id : null;
    },
    [attributeNames, variants, isMatch]
  );

  // ----- Selection state -----
  const [selection, setSelection] = React.useState<AttrMap>({});
  const selectionRef = React.useRef<AttrMap>({});
  React.useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  // Initialize / sync selection when product or selectedVariantId changes.
  React.useEffect(() => {
    // base from variant if provided and belongs to this product
    const fromVariant = attrsOfVariant(selectedVariantId);
    const hasFromVariant = Object.keys(fromVariant).length > 0;

    // fallback base from props (filtered to known attributes)
    const fromInitial: AttrMap = {};
    if (!hasFromVariant && initialSelectedAttributes) {
      for (const k of Object.keys(initialSelectedAttributes)) {
        if (attributeNames.includes(k)) {
          fromInitial[k] = String(initialSelectedAttributes[k]);
        }
      }
    }

    const base = hasFromVariant ? fromVariant : fromInitial;

    // Guard: only update selection if different
    if (!shallowEqualObj(selectionRef.current, base)) {
      setSelection(base);
      if (!onAttributesChange || shallowEqualObj(selectionRef.current, base)) {
        // no-op
      } else {
        onAttributesChange(base);
      }
    }
  }, [
    product.id,
    selectedVariantId,
    attributeNames,
    initialSelectedAttributes,
    attrsOfVariant,
  ]);

  // Compute availability per attribute *given current partial selection*
  const isValueAvailable = React.useCallback(
    (attrName: string, value: string) => {
      const candidate: AttrMap = { ...selectionRef.current, [attrName]: value };
      return variants.some((v) => isMatch(v, candidate));
    },
    [variants, isMatch]
  );

  // Live-resolve the chosen variant id and inform parent (only if changed)
  const resolvedVariantId = React.useMemo(
    () => resolveVariantId(selection),
    [selection, resolveVariantId]
  );

  const prevSentIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    const nextId = resolvedVariantId;
    // Only notify if actually changed from prop AND from last sent value
    if (nextId !== selectedVariantId && nextId !== prevSentIdRef.current) {
      prevSentIdRef.current = nextId;
      onChange(nextId);
    }
  }, [resolvedVariantId, selectedVariantId, onChange]);

  // Toggle a value for an attribute, pruning incompatible picks
  function toggle(attr: string, value: string) {
    if (!isValueAvailable(attr, value)) return;

    setSelection((prev) => {
      const isSame = prev[attr] === value;
      const next: AttrMap = { ...prev };

      if (isSame) {
        delete next[attr];
      } else {
        next[attr] = value;
      }

      // Prune other attributes that became incompatible with this new choice
      for (const other of attributeNames) {
        if (other === attr) continue;
        const chosen = next[other];
        if (chosen && !isValueAvailable(other, chosen)) {
          delete next[other];
        }
      }

      if (onAttributesChange && !shallowEqualObj(prev, next)) {
        onAttributesChange(next);
      }
      return next;
    });
  }

  // Availability map for rendering state (computed from current selection)
  const availability = React.useMemo(() => {
    const result = new Map<string, Set<string>>();
    for (const attr of attributeNames) {
      const set = new Set<string>();
      const values = allAttributeValues.get(attr) ?? [];
      for (const val of values) {
        if (isValueAvailable(attr, val)) set.add(val);
      }
      result.set(attr, set);
    }
    return result;
  }, [attributeNames, allAttributeValues, isValueAvailable]);

  if (!variants.length) {
    return (
      <p className="ty-body-sm text-secondary-500">
        {t("No variants available")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {attributeNames.map((attr) => {
        const values = allAttributeValues.get(attr) ?? [];
        const chosen = selection[attr];
        return (
          <div key={attr} className="space-y-1.5">
            <div className="ty-body-sm font-medium text-[#111827]">{attr}</div>
            <div className="flex gap-2 flex-wrap">
              {values.map((value) => {
                const isSelected = chosen === value;
                const isAvailable = availability.get(attr)?.has(value) ?? false;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggle(attr, value)}
                    disabled={!isAvailable}
                    className={cn(
                      "px-3 py-1 border rounded transition-colors ty-body-xs",
                      isSelected
                        ? "border-primary-700 bg-primary-700 text-white"
                        : "border-primary-200 text-[#1F2937] hover:bg-slate-50",
                      !isAvailable &&
                        "opacity-40 cursor-not-allowed hover:bg-transparent"
                    )}
                    aria-pressed={isSelected}
                    aria-disabled={!isAvailable}
                    title={!isAvailable ? "Not available" : value}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
