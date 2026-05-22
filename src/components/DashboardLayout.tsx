"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 overflow-hidden relative">
      {/* Desktop Sidebar (lg and above) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile/Tablet Sidebar Drawer (below lg) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform lg:hidden transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar onClose={() => setIsOpen(false)} />
      </div>

      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
            <span className="text-base font-extrabold text-[#046A4E] tracking-tight">Webixo Payment</span>
          </div>
          
          {/* Small top shortcuts */}
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
