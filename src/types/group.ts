import { Customer, Supplier } from "./common-master-data";

export type GroupMember = Customer | Supplier;

export type Group = {
  id: number;
  group_id: string;
  name: string;
  type: string;
  member_count: number;
  members?: GroupMember[];
};
