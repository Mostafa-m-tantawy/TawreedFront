import { Supplier } from "@/types/common-master-data";
import { GroupMember } from "@/types/group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const isSupplier = (m: GroupMember): m is Supplier => typeof m.id === "string";

const memberName = (m: GroupMember) => m.name;
const memberContactPerson = (m: GroupMember) => m.contact_person ?? "";
const memberPhone = (m: GroupMember) =>
  (isSupplier(m) ? m.phone : m.phone ?? "") || "";
const memberEmail = (m: GroupMember) =>
  (isSupplier(m) ? m.email : m.email ?? "") || "";
const memberLogo = (m: GroupMember) =>
  isSupplier(m) ? m.logo : m.logo ?? null;

const memberStatusKey = (m: GroupMember) => {
  const s = m.status;
  if (s === "Active") return "active";
  if (s === "in-active") return "inactive";
  return s;
};

export default function MembersTable({
  items,
  t,
}: {
  items: GroupMember[];
  t: any;
}) {
  const badge = (m: GroupMember) => {
    const key = memberStatusKey(m); // "active" | "inactive"
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    return key === "active" ? (
      <span className={`${base} bg-emerald-100 text-emerald-700`}>
        {t("Active")}
      </span>
    ) : (
      <span className={`${base} bg-rose-100 text-rose-700`}>
        {t("in-active")}
      </span>
    );
  };

  return (
    <div className="mt-2 overflow-x-auto">
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead className="min-w-[240px]">{t("Member")}</TableHead>
            <TableHead>{t("Contact Person")}</TableHead>
            <TableHead>{t("Phone Number")}</TableHead>
            <TableHead>{t("Email Address")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {items.map((m, idx) => (
            <TableRow
              key={`${isSupplier(m) ? "s" : "c"}-${m.id}`}
              className="border-0 hover:bg-opacity-80 text-start"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              <TableCell className="rounded-s-xl text-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={memberLogo(m) || undefined}
                      alt={memberName(m)}
                    />
                    <AvatarFallback>{memberName(m)?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>{memberName(m)}</div>
                </div>
              </TableCell>
              <TableCell>{memberContactPerson(m) || "-"}</TableCell>
              <TableCell>{memberPhone(m) || "-"}</TableCell>
              <TableCell>{memberEmail(m) || "-"}</TableCell>
              <TableCell className="rounded-e-xl">{badge(m)}</TableCell>
            </TableRow>
          ))}
          {!items.length && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t("noRecords")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
