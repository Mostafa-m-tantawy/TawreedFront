import { useTranslations } from "next-intl";

const isActiveStatus = (raw: any) => {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (["1", "true", "active"].includes(s)) return true;
  if (["0", "false", "inactive", "in-active", "in active"].includes(s))
    return false;

  return s === "active";
};

const StatusBadge = ({ value }: { value: any }) => {
  const t = useTranslations("");
  const active = isActiveStatus(value);
  const base = "px-3 py-1 rounded-full text-xs font-medium";
  return active ? (
    <span className={`${base} bg-emerald-100 text-emerald-700`}>
      {t("active")}
    </span>
  ) : (
    <span className={`${base} bg-rose-100 text-rose-700`}>{t("inactive")}</span>
  );
};

export default StatusBadge;
