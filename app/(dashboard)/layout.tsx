import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex h-14 items-center gap-3 bg-white border-b border-gray-200 px-3 md:hidden shadow-sm">
          <MobileSidebar />
          <div className="relative w-28 h-7">
            <Image
              src="/images/rebouw-logo.png"
              alt="Re-Bouw"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/80 via-white to-gray-100/50 p-3 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto max-w-7xl">
          {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
