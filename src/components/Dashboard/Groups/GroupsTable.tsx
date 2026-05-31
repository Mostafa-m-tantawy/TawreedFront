import { useTranslations } from "next-intl";
import { Edit2, Trash, Eye } from "iconsax-reactjs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Group } from "@/types/group";
import ProtectedElement from "@/components/ui/protected-element";

function RowActions({
  permissions,
  onEdit,
  onView,
  onDelete,
  t,
}: {
  permissions: {
    edit: string;
    delete: string;
    view: string;
    create: string;
  };
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  t: any;
}) {
  return (
    <div className="flex-center gap-2">
      <button type="button" onClick={onView}>
        <Eye size={20} />
      </button>

      <ProtectedElement permissions={permissions.edit}>
        <button type="button" onClick={onEdit}>
          <Edit2 size={20} />
        </button>
      </ProtectedElement>

      <ProtectedElement permissions={permissions.delete}>
        <button type="button" onClick={onDelete}>
          <Trash size={20} />
        </button>
      </ProtectedElement>
    </div>
  );
}

const GroupsTable = ({
  permissions,
  type,
  groups,
  onEdit,
  onView,
  onDelete,
}: {
  permissions: {
    edit: string;
    delete: string;
    view: string;
    create: string;
  };
  type: string;
  groups: Group[];
  onEdit: (g: Group) => void;
  onView: (g: Group) => void;
  onDelete: (g: Group) => void;
}) => {
  const t = useTranslations("");

  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead>{t("ID")}</TableHead>
            <TableHead>{t("Group Name")}</TableHead>
            <TableHead>{t("member_count")}</TableHead>
            <TableHead className="w-10">{t("Actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {groups.map((g, idx) => (
            <TableRow
              key={g.id}
              className="border-0 hover:bg-opacity-80 text-start"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              <TableCell className="rounded-s-xl text-start">
                {g?.group_id || g.id || "-"}
              </TableCell>

              <TableCell>{g.name}</TableCell>
              <TableCell>{g.member_count}</TableCell>

              <TableCell className="rounded-e-xl">
                <RowActions
                  t={t}
                  onView={() => onView(g)}
                  onEdit={() => onEdit(g)}
                  onDelete={() => onDelete(g)}
                  permissions={permissions}
                />
              </TableCell>
            </TableRow>
          ))}

          {!groups.length && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {t("noGroups")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GroupsTable;
