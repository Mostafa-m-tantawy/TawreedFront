export type UserStatus = string;

export type UserRole = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role?: UserRole | null;
  role_id?: number | null;
  status: UserStatus;
};
