"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api.client";
import { User } from "@/types/user";
import UsersList from "./UsersList";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { page, search: search || undefined },
      });
      const filteredUsers =
        res.data?.data?.filter((u: User) => u.name !== "Admin") ?? [];
      setUsers(filteredUsers);
      setTotalPages(res.data?.meta?.last_page ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [page, search]);

  return (
    <UsersList
      users={users}
      loading={loading}
      totalPages={totalPages}
      page={page}
      search={search}
      handleSearchChange={setSearch}
      handlePageChange={setPage}
      refetch={refetch}
    />
  );
};

export default Users;
