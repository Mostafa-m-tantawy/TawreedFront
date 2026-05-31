import { Group } from "./group";

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  contact_person: string | null;
  status: "Active" | "in-active";
  logo?: string;
  groups?: Group[];
};

export type Customer = {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  tax_number: string | null;
  notes: string | null;
  status: "active" | "inactive";
  logo?: string | null;
  groups?: Group[];
};
