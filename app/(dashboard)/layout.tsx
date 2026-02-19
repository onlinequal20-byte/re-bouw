import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
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
        <div className="flex h-16 items-center gap-4 bg-white/80 backdrop-blur-2xl border-b border-gray-200/60 px-4 md:hidden shadow-sm">
          <MobileSidebar />
          <div className="relative w-32 h-8 rounded px-2 py-1">
            <Image
              src="/images/amsbouwers.logo.png"
              alt="AMS Bouwers"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/80 via-white to-gray-100/50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
          {children}
          </div>
        </main>
      </div>
    </div>
  );
}
