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
    <div className="flex h-screen w-64 flex-col gradient-header text-white shadow-xl">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10 bg-black/20 px-4">
        <div className="relative w-48 h-12 bg-white rounded-lg px-3 py-2">
          <Image 
            src="/images/amsbouwers.logo.png" 
            alt="AMS Bouwers" 
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
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "text-gray-300 hover:bg-white/10 hover:text-white hover:scale-102"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4 bg-black/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Uitloggen
        </Button>
        <div className="mt-4 px-2">
          <p className="text-xs text-white/40 text-center">
            &copy; {new Date().getFullYear()} AMS Bouwers
          </p>
        </div>
      </div>
    </div>
  );
}
