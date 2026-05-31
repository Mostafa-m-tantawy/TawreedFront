export type ActivityLog = {
  id?: number | string;
  user?: {
    id: number;
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  changes?: {
    old?: Record<string, unknown>;
    new?: Record<string, unknown>;
  } | null;
  created_at?: string | null;
};
