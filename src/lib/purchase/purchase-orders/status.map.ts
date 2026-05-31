export const PO_STATUS_MAP = {
  Draft: {
    bg: "bg-[#D1CFEA]",
    text: "text-[#4D4A76]",
    label: "Draft",
  },
  Pending: {
    bg: "bg-[#EDE3B7]",
    text: "text-[#6B5E17]",
    label: "Pending",
  },
  Approved: {
    bg: "bg-[#BFEBD8]",
    text: "text-[#145E44]",
    label: "Approved",
  },
  Rejected: {
    bg: "bg-[#F7C4C4]",
    text: "text-[#7A1F1F]",
    label: "Rejected",
  },
  Invoiced: {
    bg: "bg-[#CFE0F7]",
    text: "text-[#1F3A7A]",
    label: "Invoiced",
  },
  "Partially Invoiced": {
    bg: "bg-[#CFE0F7]",
    text: "text-[#1F3A7A]",
    label: "Partially Invoiced",
  },
  Cancelled: {
    bg: "bg-[#E0E0E0]",
    text: "text-[#4A4A4A]",
    label: "Cancelled",
  },
} as const;
