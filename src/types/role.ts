export type Permission = {
  id: number;
  name: string;
  display_name: string;
};

export type ModuleResource = {
  id: number;
  name: string;
  permissions: Permission[];
};

export type Role = {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
};
