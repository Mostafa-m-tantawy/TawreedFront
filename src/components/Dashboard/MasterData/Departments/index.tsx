"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api.client";
import { Department } from "@/types/department";
import DepartmentsList from "./DepartmentsList";

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const getDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/departments", {
        params: { page, search: search || undefined },
      });
      setDepartments(res.data?.data ?? []);
      setTotalPages(res.data?.meta?.last_page ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartments();
  }, [page, search]);

  return (
    <DepartmentsList
      title="Departments"
      departments={departments}
      loading={loading}
      totalPages={totalPages}
      page={page}
      search={search}
      handleSearchChange={setSearch}
      handlePageChange={setPage}
      getDepartments={getDepartments}
    />
  );
};

export default Departments;
