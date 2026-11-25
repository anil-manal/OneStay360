"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Allow login page to render without guard
  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  return <AuthGuard requiredPortal="tenant">{children}</AuthGuard>;
}
