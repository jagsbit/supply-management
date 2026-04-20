"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ClipboardList, Warehouse, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem { href: string; label: string; icon: React.ReactNode }

const adminNav: NavItem[] = [
  { href: "/admin/inventory", label: "Inventory", icon: <Warehouse className="h-4 w-4" /> },
  { href: "/admin/requests", label: "All Requests", icon: <ClipboardList className="h-4 w-4" /> },
];

const employeeNav: NavItem[] = [
  { href: "/employee/requests", label: "My Requests", icon: <ClipboardList className="h-4 w-4" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (session?.user as { role?: string })?.role;
  const navItems = role === "ADMIN" ? adminNav : employeeNav;

  return (
    <div className="flex h-screen bg-background">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2 px-6 py-4 border-b">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-semibold text-sm">Office Supplies</span>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-3 py-2 flex-1">
          <p className="text-xs text-muted-foreground px-3 py-2 uppercase tracking-wider">
            {role === "ADMIN" ? "Admin" : "Employee"}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}>
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-3 border-t">
          <div className="px-3 py-2 text-sm">
            <p className="font-medium truncate">{session?.user?.name}</p>
            <p className="text-muted-foreground text-xs truncate">{session?.user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-card">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Package className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Office Supplies</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
