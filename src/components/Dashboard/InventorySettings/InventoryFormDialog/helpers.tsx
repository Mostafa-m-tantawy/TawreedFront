// -- helpers -------------------------------------------------------------

function toOptionParts(option: any): { value: string; label: string } {
  if (option == null) return { value: "", label: "" };
  if (typeof option === "string" || typeof option === "number") {
    return { value: String(option), label: String(option) };
  }
  // try common shapes
  const value = String(
    option.value ?? option.id ?? option.key ?? option.code ?? ""
  );
  const label =
    String(
      option.label ??
        option.name ??
        option.title ??
        option.display ??
        option.text ??
        value
    ) || value;
  return { value, label };
}

function getAtPath(obj: any, path?: string) {
  if (!obj || !path) return undefined;
  return path
    .split(".")
    .reduce((acc: any, k: string) => (acc ? acc[k] : undefined), obj);
}

function idFromRelation(item: any, key: string) {
  if (!key.endsWith("_id")) return undefined;
  const base = key.slice(0, -3); // drop "_id"
  const rel = item?.[base];
  const id = rel?.id ?? rel?.value ?? rel?._id;
  return id === null || id === undefined ? undefined : id;
}

const isTextLike = (f: any) => f.type === "text" || f.type === "textarea";

function normalizeTranslatedField(
  field: any,
  item: any
): Record<string, string> {
  const locales = Object.keys(field.value ?? {}); // e.g. { en:"", ar:"" }
  const raw = item?.[field.key];
  const out: Record<string, string> = {};

  // If server already returns an object per locale
  if (raw && typeof raw === "object") {
    for (const loc of locales) out[loc] = String(raw?.[loc] ?? "");
    return out;
  }

  // Try suffix styles: key_en, key_ar
  for (const loc of locales) {
    const suffix1 = `${field.key}_${loc}`; // name_en
    const suffix2 = `${field.key}${loc.toUpperCase()}`; // nameEN (if your API uses this)
    const v = item?.[suffix1] ?? item?.[suffix2] ?? (raw != null ? raw : "");
    out[loc] = String(v ?? "");
  }

  return out;
}

const buildInitialValues = (formFields: any[], initial?: any) => {
  const values: Record<string, any> = {};
  for (const f of formFields) {
    if (isTextLike(f) && f.hasTranslation) {
      values[f.key] = { ...(f.value ?? {}) };
    } else {
      values[f.key] = f.value ?? "";
    }
    if (initial && initial[f.key] !== undefined) {
      values[f.key] = initial[f.key];
    }
    if (f.child && values[f.child.key] === undefined) {
      values[f.child.key] = f.child.value ?? "";
    }
  }
  return values;
};

const normalizeItemToFormValues = (formFields: any[], item: any) => {
  const out: Record<string, any> = {};

  for (const f of formFields) {
    const mapped = getAtPath(item, f.sourcePath);
    const serverVal = item?.[f.key];
    const fallbackRelId = idFromRelation(item, f.key);

    // TEXT/AREA with translations
    if (isTextLike(f) && f.hasTranslation) {
      const locales = Object.keys(f.value ?? {});
      const raw = mapped ?? serverVal;

      if (raw && typeof raw === "object") {
        out[f.key] = Object.fromEntries(
          locales.map((loc) => [loc, String(raw?.[loc] ?? "")])
        );
      } else {
        // server sent a flat string; copy into all locales
        out[f.key] = Object.fromEntries(
          locales.map((loc) => [loc, String(raw ?? "")])
        );
      }

      // child normalization (e.g. base_unit_id under a number field, rare for text-like)
      if (f.child) {
        const childPath = f.child.sourcePath;
        const childRaw =
          getAtPath(item, childPath) ??
          item?.[f.child.key] ??
          idFromRelation(item, f.child.key);
        out[f.child.key] =
          childRaw === null || childRaw === undefined ? "" : String(childRaw);
      }
      continue;
    }

    // NUMBERS (keep as string for input)
    if (f.type === "number") {
      const raw = mapped ?? serverVal ?? fallbackRelId;
      out[f.key] = raw == null ? "" : String(raw);

      if (f.child) {
        const childPath = f.child.sourcePath;
        const childRaw =
          getAtPath(item, childPath) ??
          item?.[f.child.key] ??
          idFromRelation(item, f.child.key);
        out[f.child.key] = childRaw == null ? "" : String(childRaw);
      }
      continue;
    }

    // SELECT / STATUS (Radix expects string)
    if (f.type === "select" || f.type === "status") {
      const raw = mapped ?? serverVal ?? fallbackRelId;
      out[f.key] = raw == null ? "" : String(raw);
      continue;
    }

    // PLAIN TEXT (non-i18n) / TEXTAREA (non-i18n)
    if (isTextLike(f)) {
      const raw = mapped ?? serverVal;
      out[f.key] = raw == null ? "" : String(raw);
      continue;
    }

    // default
    out[f.key] = serverVal ?? f.value ?? "";
  }

  return out;
};

// Normalize server error keys to our UI keys (e.g. "name.en")
function normalizeTranslationErrorKeys(
  fieldErrors: Record<string, string | string[]>,
  formFields: any[]
) {
  const out: Record<string, string> = {};

  // build sets for quick checks
  const transFields = new Set(
    (formFields ?? [])
      .filter(
        (f: any) =>
          (f.type === "text" || f.type === "textarea") && f.hasTranslation
      )
      .map((f: any) => f.key)
  );

  const localesByField: Record<string, Set<string>> = {};
  for (const f of formFields ?? []) {
    if ((f.type === "text" || f.type === "textarea") && f.hasTranslation) {
      const locs = Object.keys(f.value ?? {}); // e.g. {en:"", ar:""}
      localesByField[f.key] = new Set(locs);
    }
  }

  const coerceMsg = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);

  for (const rawKey in fieldErrors ?? {}) {
    const msg = coerceMsg(fieldErrors[rawKey]);

    if (rawKey.includes(".")) {
      const [k1, k2] = rawKey.split(".");
      if (transFields.has(k1) && localesByField[k1]?.has(k2)) {
        out[`${k1}.${k2}`] = msg;
        continue;
      }
    }

    const mBracket = rawKey.match(/^(.+)\[(\w+)\]$/);
    if (mBracket) {
      const [, base, loc] = mBracket;
      if (transFields.has(base) && localesByField[base]?.has(loc)) {
        out[`${base}.${loc}`] = msg;
        continue;
      }
    }

    const mSnake = rawKey.match(/^(.+?)_(\w+)$/);
    if (mSnake) {
      const [, base, loc] = mSnake;
      if (transFields.has(base) && localesByField[base]?.has(loc)) {
        out[`${base}.${loc}`] = msg;
        continue;
      }
    }

    // 4) Deep paths: find the first (field, locale) pair inside
    const parts = rawKey.split(/[.\[\]_]/).filter(Boolean); // split on ., [], _
    for (const base of Object.keys(localesByField)) {
      const locs = localesByField[base];
      if (parts.includes(base)) {
        const locHit = [...locs].find((loc) => parts.includes(loc));
        if (locHit) {
          out[`${base}.${locHit}`] = msg;
          break;
        }
      }
    }

    if (!out[rawKey]) out[rawKey] = msg;
  }

  return out;
}

const nfCurrency = (locale: string, n: number) =>
  new Intl.NumberFormat(locale || "en", {
    style: "currency",
    currency: "SAR",
    currencyDisplay: "symbol",
  }).format(n);

// Put above loadActivity (or outside the component)
function safeFormatDate(
  input: unknown,
  fmt: Intl.DateTimeFormat
): string | undefined {
  if (input == null) return undefined;

  const tryDate = (v: string | number): Date | undefined => {
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
  };

  // numbers: unix seconds or millis
  if (typeof input === "number") {
    const asMs = input > 1e12 ? input : input * 1000;
    const d = tryDate(asMs);
    return d ? fmt.format(d) : undefined;
  }

  if (typeof input === "string") {
    // 1) native parse
    let d = tryDate(input);
    // 2) common API format "YYYY-MM-DD HH:mm:ss"
    if (!d && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(input)) {
      d = tryDate(input.replace(" ", "T")); // make it ISO-like
      if (!d) d = tryDate(input.replace(" ", "T") + "Z"); // assume UTC
    }
    // 3) unix seconds string
    if (!d && /^\d{10}$/.test(input)) d = tryDate(Number(input) * 1000);
    // 4) unix millis string
    if (!d && /^\d{13}$/.test(input)) d = tryDate(Number(input));

    return d ? fmt.format(d) : input; // fallback: show raw string
  }

  return undefined;
}

export {
  getAtPath,
  normalizeTranslatedField,
  normalizeItemToFormValues,
  toOptionParts,
  buildInitialValues,
  normalizeTranslationErrorKeys,
  nfCurrency,
  safeFormatDate,
};
