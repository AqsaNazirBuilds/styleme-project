"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Shirt,
  Layers,
  Sparkles,
  MessageCircle,
  Calendar,
  Luggage,
  BarChart3,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Layers },
  { href: "/style-me", label: "Style Me", icon: Sparkles },
  { href: "/ai-stylist", label: "AI Stylist", icon: MessageCircle },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/packing", label: "Packing", icon: Luggage },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-card px-3 py-6">
      <Link href="/dashboard" className="mb-8 px-3 text-xl font-heading">
        StyleMe
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}

        {session?.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              pathname.startsWith("/admin")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            <ShieldCheck className="size-4" />
            Admin
          </Link>
        )}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            pathname === "/profile"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent"
          )}
        >
          <User className="size-4" />
          Profile
        </Link>

        {confirmLogout ? (
          <div className="flex flex-col gap-1.5 px-3 py-2">
            <p className="text-xs text-muted-foreground">Sign out of StyleMe?</p>
            <div className="flex gap-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md bg-destructive/10 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/20"
              >
                Yes, sign out
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}