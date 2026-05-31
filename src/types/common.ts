export type NameValueType<TName extends string = string> = {
  value: string;
  name: TName;
};

export type DeleteState<Item = any> = {
  open: boolean;
  loading: boolean;
  item: Item | null;
};

export type Status = "all" | "active" | "inactive";

export type PageResult<T> = {
  items: T[];
  page: number;
  lastPage: number;
  total: number;
};
