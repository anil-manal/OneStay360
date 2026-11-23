"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function BusinessPropertiesRedirect({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const unwrapped = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/business/${unwrapped.businessId}`);
  }, [unwrapped.businessId, router]);

  return (
    <div className="fullscreenLoader" style={{ background: "#FFFFFF", color: "#0F172A" }}>
      <div className="spinner"></div>
      <p>Redirecting to Business Details & Portfolio...</p>
    </div>
  );
}
