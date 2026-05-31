export const PI_STATUS_MAP = {
  Draft: {
    bg: "bg-[#D1CFEA]",
    text: "text-[#4D4A76]",
    label: "Draft",
  },
  Pending: {
    bg: "bg-[#FFE4C2]",
    text: "text-[#7B4B00]",
    label: "Pending",
  },
  Approved: {
    bg: "bg-[#BFEBD8]",
    text: "text-[#145E44]",
    label: "Approved",
  },
  Paid: {
    bg: "bg-[#FFF2B2]",
    text: "text-[#6B5E17]",
    label: "Paid",
  },
  Rejected: {
    bg: "bg-[#F5C6CB]",
    text: "text-[#7A1C1C]",
    label: "Rejected",
  },
} as const;
