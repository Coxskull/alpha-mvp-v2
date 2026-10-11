"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");
  const allowedRolesKey = allowedRoles
    .map((role) => role.toLowerCase())
    .join("|");

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("alpha_token");

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const response = await api.get("/api/Auth/me");
        const responseRoles: unknown = response.data.roles;
        const roles = Array.isArray(responseRoles)
          ? responseRoles.filter((role): role is string => typeof role === "string")
          : [];
        const primaryRole = response.data.role;

        // Only use the primary-role fallback when the roles field is absent in an older response.
        if (!Array.isArray(responseRoles) && typeof primaryRole === "string") {
          roles.push(primaryRole);
        }

        const normalizedRoles = roles.map((role) => role.toLowerCase());
        const normalizedAllowedRoles = allowedRolesKey.split("|");
        const isAllowed = normalizedRoles.some((role) =>
          normalizedAllowedRoles.includes(role)
        );

        if (!isAllowed) {
          if (active) setStatus("blocked");
          router.replace("/unauthorized");
          return;
        }

        if (active) setStatus("allowed");
      } catch {
        localStorage.removeItem("alpha_token");
        localStorage.removeItem("alpha_user");
        router.replace("/");
      }
    };

    void checkAuth();

    return () => {
      active = false;
    };
  }, [router, allowedRolesKey]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Checking access...
      </main>
    );
  }

  if (status === "blocked") {
    return null;
  }

  return <>{children}</>;
}
