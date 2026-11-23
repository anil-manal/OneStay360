"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function NestedPropertyRedirect({
  params,
}: {
  params: Promise<{ businessId: string; propertyId: string }>;
}) {
  const unwrapped = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/property/${unwrapped.propertyId}`);
  }, [unwrapped.propertyId, router]);

  return (
    <div className="fullscreenLoader" style={{ background: "#FFFFFF", color: "#0F172A" }}>
      <div className="spinner"></div>
      <p>Redirecting to Property Dossier...</p>
    </div>
  );
}
