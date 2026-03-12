"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Calculator,
  Swords,
  FileText,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/product-selector", label: "Products", icon: Package },
  { href: "/afx-sizer", label: "AFX Sizer", icon: Calculator },
  { href: "/competitive-intel", label: "Compete", icon: Swords },
  { href: "/proposal-generator", label: "Proposals", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-netapp-dark flex-col z-50">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold text-netapp-blue">NetApp</span>
            <span className="text-xl font-light text-netapp-accent">
              SalesPilot
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-all duration-150 ease-in-out border-l-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-netapp-blue focus-visible:ring-inset ${
                  isActive
                    ? "border-netapp-blue text-netapp-blue bg-white/5"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-xs text-gray-500">AFX SalesPilot v1.0</p>
          <p className="text-xs text-gray-600">NetApp Confidential</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-netapp-dark border-t border-white/10 z-50 flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-netapp-blue ${
                isActive
                  ? "text-netapp-blue"
                  : "text-gray-400"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
