"use client";

import { usePathname } from "next/navigation";

export default function StoreChrome({
  children,
  quiet,
}: {
  children: React.ReactNode;
  quiet?: boolean;
}) {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/admin")) return null;
  if (quiet && (pathname.startsWith("/checkout") || pathname.startsWith("/gracias"))) return null;
  return <>{children}</>;
}

