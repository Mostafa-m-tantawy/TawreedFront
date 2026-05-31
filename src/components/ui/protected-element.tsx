"use client";

import { useAuthStore } from "@/store/authStore";

const ProtectedElement = ({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: string | string[];
}) => {
  const { hasPermission } = useAuthStore();
  const isAuthorized = hasPermission(permissions);

  return isAuthorized ? <>{children}</> : null;
};

export default ProtectedElement;
