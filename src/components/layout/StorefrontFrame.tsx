"use client";

import { usePathname } from "@/i18n/routing";

/**
 * StorefrontFrame conditionally renders consumer-facing layout chrome
 * (AnnouncementBar, SiteHeader, SiteFooter, CartDrawer).
 * 
 * When viewing any /admin route, these are suppressed so the dedicated
 * Admin Console layout displays cleanly without stacked duplicate headers,
 * duplicate logos, or public shop navigation.
 */
export function StorefrontFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return <>{children}</>;
}
