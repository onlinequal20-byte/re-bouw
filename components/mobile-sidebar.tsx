"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
  Mail,
  Camera,
  FolderOpen,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Klanten", href: "/klanten", icon: Users },
  { name: "Offertes", href: "/offertes", icon: FileText },
  { name: "Facturen", href: "/facturen", icon: Receipt },
  { name: "Projecten", href: "/projecten", icon: FolderOpen },
  { name: "Planning", href: "/planning", icon: Calendar },
  { name: "Kosten", href: "/kosten", icon: Camera },
  { name: "Prijzen", href: "/prijzen", icon: DollarSign },

  { name: "Financieel", href: "/financieel", icon: TrendingUp },
  { name: "Email", href: "/email", icon: Mail },
  { name: "Instellingen", href: "/instellingen", icon: Settings },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-gray-900 -ml-1"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-[#1a1f2e] text-gray-300 transition-transform duration-300 ease-in-out md:hidden shadow-xl",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
          <div className="relative w-40 h-10 bg-white rounded-lg px-2 py-1">
            <Image
              src="/images/rebouw-logo.png"
              alt="Re-Bouw"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-500/20 text-white border-l-2 border-blue-400"
                    : "text-gray-400 hover:bg-white/8 hover:text-gray-200"
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4 pb-20">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:bg-white/8 hover:text-gray-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Uitloggen
          </Button>
        </div>
      </div>
    </>
  );
}
