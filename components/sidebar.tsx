"use client";

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
  LogOut,
  Wallet,
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
  { name: "Kosten", href: "/kosten", icon: Wallet },
  { name: "Prijzen", href: "/prijzen", icon: DollarSign },

  { name: "Financieel", href: "/financieel", icon: TrendingUp },
  { name: "Instellingen", href: "/instellingen", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-[#1a1f2e] text-gray-300">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
        <div className="relative w-48 h-12 bg-white rounded-lg px-3 py-2">
          <Image
            src="/images/rebouw-logo.png"
            alt="Re-Bouw"
            fill
            className="object-contain p-1"
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
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-500/20 text-white border-l-2 border-blue-400"
                  : "text-gray-400 hover:bg-white/8 hover:text-gray-200"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Uitloggen
        </Button>
        <div className="mt-4 px-2">
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Re-Bouw
          </p>
        </div>
      </div>
    </div>
  );
}
