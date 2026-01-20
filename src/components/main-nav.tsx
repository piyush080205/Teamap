"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Megaphone, FilePlus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Live Map",
      href: "/dashboard",
      icon: <Map className="h-4 w-4" />,
    },
    {
      title: "Nearby Alerts",
      href: "/alerts",
      icon: <Megaphone className="h-4 w-4" />,
    },
    {
      title: "Report Incident",
      href: "/report",
      icon: <FilePlus className="h-4 w-4" />,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            (pathname === item.href || (item.href === '/dashboard' && pathname === '/')) && "bg-muted text-primary"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
