"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/product-selector": "Product Selector",
  "/afx-sizer": "AFX Sizer",
  "/competitive-intel": "Competitive Intel",
  "/proposal-generator": "Proposal Generator",
};

export default function TopBar() {
  const pathname = usePathname();
  const pageLabel = routeLabels[pathname] || "Dashboard";

  return (
    <header className="h-16 bg-netapp-white border-b border-netapp-border flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-netapp-muted">Home</span>
        {pathname !== "/" && (
          <>
            <ChevronRight size={14} className="text-netapp-muted" />
            <span className="text-netapp-dark font-medium">{pageLabel}</span>
          </>
        )}
      </div>

      {/* User Avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-netapp-dark">NetApp Employee</p>
          <p className="text-xs text-netapp-muted">Field Sales</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-netapp-blue flex items-center justify-center text-white text-sm font-semibold">
          NE
        </div>
      </div>
    </header>
  );
}
