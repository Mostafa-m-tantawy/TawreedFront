export type Department = {
  id: number;
  name: string | Record<string, string>;
  status: "active" | "inactive";
};
