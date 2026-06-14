"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Search,
  Wallet,
  X,
  FileSpreadsheet
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Factures", href: "/factures", icon: FileText, badge: 2 },
    { name: "Devis", href: "/devis", icon: FileSpreadsheet },
    { name: "Rapports", href: "/rapports", icon: BarChart3 },
    { name: "Paramètres", href: "/parametres", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 text-slate-700">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#046A4E]/10 flex items-center justify-center text-[#046A4E]">
            <Wallet size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-none">Webixo Payment</h2>
            <span className="text-xs text-slate-400 font-medium">Opérateur Financier</span>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-all"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-1 focus:ring-[#046A4E]/30 focus:border-[#046A4E] transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu Principal
        </div>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-[#046A4E] text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-[#046A4E]/10 text-[#046A4E]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link 
          href="/aide" 
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <HelpCircle size={18} className="text-slate-400" />
          <span>Centre d&apos;aide</span>
        </Link>
        <button 
          onClick={() => {
            console.log("Déconnexion...");
            if (onClose) onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-left"
        >
          <LogOut size={18} className="text-red-400" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}