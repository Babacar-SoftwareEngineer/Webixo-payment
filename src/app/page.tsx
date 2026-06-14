"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  RefreshCw, 
  Bell, 
  Mail, 
  HelpCircle, 
  ChevronDown, 
  Filter,
  Check
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar 
} from "recharts";

import { useAppState } from "@/hooks/useAppState";

// ==========================================
// 1. UTILITAIRES ET COMPORTEMENT DE PÉRIODE
// ==========================================

// Helper pour parser les dates comme "17 Avr, 2026" ou "21 mai 2026"
const parseInvoiceDate = (dateStr: string) => {
  const cleaned = dateStr.toLowerCase().replace(",", "");
  const parts = cleaned.split(" ");
  
  let monthIdx = -1;
  const monthsShort = ["jan", "fév", "mar", "avr", "mai", "jui", "aoû", "sep", "oct", "nov", "déc"];
  const monthsLong = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
  
  const monthPart = parts[1] || "";
  
  for (let i = 0; i < 12; i++) {
    if (monthPart.startsWith(monthsShort[i]) || monthPart.startsWith(monthsLong[i])) {
      monthIdx = i;
      break;
    }
  }
  
  let year = 2026;
  const yearPart = parts[2];
  if (yearPart && !isNaN(Number(yearPart))) {
    year = Number(yearPart);
  }
  
  return { month: monthIdx, year };
};

// Helper pour construire les 12 derniers mois jusqu'à mai 2026
const getLast12Months = () => {
  const months = [];
  const date = new Date(2026, 4, 21); // Base: 21 mai 2026
  for (let i = 11; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const monthName = d.toLocaleString("fr-FR", { month: "short" }).replace(".", "");
    const yearShort = d.getFullYear().toString().slice(-2);
    months.push({
      mois: `${monthName} ${yearShort}`,
      encaissees: 0,
      enAttente: 0,
      month: d.getMonth(),
      year: d.getFullYear(),
    });
  }
  return months;
};

// ==========================================
// 3. COMPOSANT PRINCIPAL
// ==========================================

export default function Dashboard() {
  const { clients, factures, isLoaded } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Tous");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [periode, setPeriode] = useState("Ce Mois");

  // ==========================================
  // 4. CALCULS DYNAMIQUES (DRY - INTERROGATION BRUTE)
  // ==========================================

  // Factures ouvertes (Statut 'En attente' ou 'En retard')
  const statsFacturesOuvertes = useMemo(() => {
    let totalNonEchues = 0;
    let totalRetardMoins30 = 0;
    let totalRetardPlus30 = 0;

    let countNonEchues = 0;
    let countRetardMoins30 = 0;
    let countRetardPlus30 = 0;

    factures.forEach(f => {
      if (f.statut_paiement === "En attente") {
        totalNonEchues += f.montant;
        countNonEchues++;
      } else if (f.statut_paiement === "En retard") {
        if (f.jours_retard && f.jours_retard >= 30) {
          totalRetardPlus30 += f.montant;
          countRetardPlus30++;
        } else {
          totalRetardMoins30 += f.montant;
          countRetardMoins30++;
        }
      }
    });

    const totalGlobal = totalNonEchues + totalRetardMoins30 + totalRetardPlus30;
    const countGlobal = countNonEchues + countRetardMoins30 + countRetardPlus30;

    return {
      nonEchues: { montant: totalNonEchues, count: countNonEchues },
      retardMoins30: { montant: totalRetardMoins30, count: countRetardMoins30 },
      retardPlus30: { montant: totalRetardPlus30, count: countRetardPlus30 },
      totalGlobal,
      countGlobal
    };
  }, [factures]);

  // Clients principaux (Calculé à la volée sur la somme des factures)
  const clientsPrincipaux = useMemo(() => {
    const map = new Map<string, number>();
    factures.forEach(f => {
      const current = map.get(f.client_id) || 0;
      map.set(f.client_id, current + f.montant);
    });

    return Array.from(map.entries())
      .map(([id, montantTotal]) => {
        const client = clients.find(c => c.id === id);
        return {
          id,
          nom: client?.nom_entreprise || "Client Inconnu",
          montant: montantTotal
        };
      })
      .sort((a, b) => b.montant - a.montant)
      .slice(0, 5); // Top 5
  }, [factures, clients]);

  // Produits principaux (Services les plus facturés)
  const produitsPrincipaux = useMemo(() => {
    const map = new Map<string, number>();
    factures.forEach(f => {
      const current = map.get(f.service) || 0;
      map.set(f.service, current + f.montant);
    });

    return Array.from(map.entries())
      .map(([nom, montantTotal]) => ({
        nom,
        montant: montantTotal
      }))
      .sort((a, b) => b.montant - a.montant)
      .slice(0, 5); // Top 5
  }, [factures]);

  // Ventes Totales (12 derniers mois et ce mois)
  const statsVentes = useMemo(() => {
    // 12 derniers mois (somme des factures terminées ou toutes factures selon règle de gestion)
    const total12Mois = factures
      .filter(f => f.statut_paiement === "Terminé" || f.statut_paiement === "En attente")
      .reduce((sum, f) => sum + f.montant, 0);

    // Ce mois-ci (mai 2026)
    const totalCeMois = factures
      .filter(f => {
        if (f.statut_paiement !== "Terminé") return false;
        const { month, year } = parseInvoiceDate(f.date_emission);
        return month === 4 && year === 2026; // Mai 2026 is month index 4
      })
      .reduce((sum, f) => sum + f.montant, 0);

    return {
      total12Mois,
      totalCeMois
    };
  }, [factures]);

  // Dynamically group payments into month buckets for the chart
  const ventesMensuelles = useMemo(() => {
    const months = getLast12Months();
    factures.forEach(f => {
      const { month, year } = parseInvoiceDate(f.date_emission);
      if (month !== -1) {
        const bucket = months.find(b => b.month === month && b.year === year);
        if (bucket) {
          if (f.statut_paiement === "Terminé") {
            bucket.encaissees += f.montant;
          } else {
            bucket.enAttente += f.montant;
          }
        }
      }
    });
    return months;
  }, [factures]);

  // Dynamically scale chart y-axis ceiling to avoid clipped bars
  const maxYValue = useMemo(() => {
    let maxVal = 300000;
    ventesMensuelles.forEach(m => {
      if (m.encaissees > maxVal) maxVal = m.encaissees;
      if (m.enAttente > maxVal) maxVal = m.enAttente;
    });
    return Math.ceil(maxVal / 100000) * 100000;
  }, [ventesMensuelles]);

  const yTicks = useMemo(() => {
    const step = maxYValue / 3;
    return [0, step, step * 2, maxYValue];
  }, [maxYValue]);

  // Filtrage des activités récentes (Tableau de bord interactif)
  const filteredActivites = useMemo(() => {
    return factures.map(f => {
      const client = clients.find(c => c.id === f.client_id);
      return {
        ...f,
        clientName: client?.nom_entreprise || "Inconnu",
        initials: client?.initials || "??",
        avatarBg: client?.avatarBg || "bg-slate-100",
        avatarText: client?.avatarText || "text-slate-500"
      };
    }).filter(item => {
      // Filtre de recherche textuelle
      const matchSearch = 
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre de statut
      const matchStatus = selectedStatus === "Tous" || item.statut_paiement === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [factures, clients, searchTerm, selectedStatus]);

  // Réinitialiser les filtres
  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("Tous");
    setPeriode("Ce Mois");
  };

  // Données du Donut Chart
  const donutData = useMemo(() => [
    { name: "Non échues", value: statsFacturesOuvertes.nonEchues.montant, color: "#FEF08A" }, // jaune
    { name: "En retard (- de 30 jours)", value: statsFacturesOuvertes.retardMoins30.montant, color: "#FCA5A5" }, // rouge clair
    { name: "En retard (+ de 30 jours)", value: statsFacturesOuvertes.retardPlus30.montant, color: "#B91C1C" } // rouge foncé
  ].filter(d => d.value > 0), [statsFacturesOuvertes]);

  // Formateur monétaire
  const formatCFA = (val: number) => {
    return val.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " CFA";
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#046A4E]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ==========================================
          HEADER SECTION (APERÇU)
         ========================================== */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Aperçu</h1>
          <p className="text-sm text-slate-400 font-semibold">Voici le résumé des données globales</p>
        </div>
        
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto self-start sm:self-center">
          {/* Dropdown Période */}
          <div className="relative">
            <button 
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 bg-white border border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <span>{periode}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showPeriodDropdown ? "rotate-180" : ""}`} />
            </button>

            {showPeriodDropdown && (
              <>
                <div 
                  onClick={() => setShowPeriodDropdown(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                  {[
                    { label: "Ce Mois", value: "Ce Mois" },
                    { label: "12 derniers mois", value: "12 derniers mois" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPeriode(option.value);
                        setShowPeriodDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-all"
                    >
                      <span>{option.label}</span>
                      {periode === option.value && <Check size={14} className="text-[#046A4E] stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Reset Button */}
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 bg-white border border-slate-100 hover:bg-slate-50 text-slate-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <RefreshCw size={14} className="text-slate-500" />
            <span>Réinitialiser</span>
          </button>

          {/* Icon shortcuts & Profile */}
          <div className="flex items-center gap-2 ml-auto sm:ml-2 pl-3 sm:pl-4 border-l border-slate-200">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <Mail size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <HelpCircle size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-900 ml-2 shadow-inner border border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              U
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          GRID LAYOUT: UPPER SECTION
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: FACTURES OUVERTES */}
        <section className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all duration-300 lg:col-span-2 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Factures ouvertes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* List left side */}
            <div className="space-y-4">
              {/* Row 1: Non échues */}
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-sm">
                    {statsFacturesOuvertes.nonEchues.count}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">Non échues</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">{formatCFA(statsFacturesOuvertes.nonEchues.montant)}</span>
              </div>

              {/* Row 2: En retard (- 30 jours) */}
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center font-bold text-sm">
                    {statsFacturesOuvertes.retardMoins30.count}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">En retard (- de 30 jours)</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">{formatCFA(statsFacturesOuvertes.retardMoins30.montant)}</span>
              </div>

              {/* Row 3: En retard (+ de 30 jours) */}
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                    {statsFacturesOuvertes.retardPlus30.count}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">En retard (+ de 30 jours)</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">{formatCFA(statsFacturesOuvertes.retardPlus30.montant)}</span>
              </div>
            </div>

            {/* Donut chart right side */}
            <div className="relative flex justify-center items-center h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central text overlay */}
              <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                <span className="text-xs font-semibold text-slate-400">{statsFacturesOuvertes.countGlobal} Factures</span>
                <span className="text-lg font-extrabold text-[#B91C1C] mt-0.5 leading-none">
                  {statsFacturesOuvertes.totalGlobal.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] font-bold text-[#B91C1C] tracking-wide mt-1">CFA</span>
              </div>
            </div>
          </div>
        </section>

        {/* CARD 2: CLIENTS PRINCIPAUX */}
        <section className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Clients principaux</h3>
              <p className="text-xs text-slate-400 font-medium">12 derniers mois</p>
            </div>
            
            {/* List with custom horizontal bar graphs */}
            <div className="space-y-4">
              {clientsPrincipaux.map((item, idx) => {
                // Pourcentage par rapport au max pour dimensionner la barre
                const maxVal = Math.max(...clientsPrincipaux.map(c => c.montant));
                const percentage = maxVal > 0 ? (item.montant / maxVal) * 100 : 0;
                // Alterne les couleurs de barre selon le design
                const isEmerald = idx === 0 || idx === 3 || idx === 4;
                const barColor = isEmerald ? "bg-[#046A4E]" : "bg-blue-100";
                
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <span>{item.nom}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Axis at the bottom */}
          <div className="flex justify-between text-[9px] font-semibold text-slate-400 mt-6 pt-3 border-t border-slate-50">
            <span>0</span>
            <span>100,000</span>
            <span>200,000</span>
            <span>300,000</span>
            <span>400,000</span>
          </div>
        </section>
      </div>

      {/* ==========================================
          GRID LAYOUT: MIDDLE SECTION
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 3: VENTES CHART */}
        <section className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all duration-300 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ventes</h3>
            </div>
          </div>

          {/* Sub-header statistics (Responsive & Interactive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-0 sm:divide-x sm:divide-slate-100 mb-6 bg-slate-50/50 p-2 sm:p-0 rounded-2xl sm:rounded-none">
            <div className={`p-4 transition-all duration-300 rounded-2xl ${
              periode === "12 derniers mois" 
                ? "bg-[#046A4E]/5 border border-[#046A4E]/10 scale-[1.01]" 
                : "opacity-60"
            }`}>
              <span className="text-xs font-semibold text-slate-400 block mb-1">12 derniers mois</span>
              <span className={`text-lg sm:text-xl lg:text-2xl font-black transition-colors ${
                periode === "12 derniers mois" ? "text-[#046A4E]" : "text-slate-900"
              }`}>{formatCFA(statsVentes.total12Mois)}</span>
            </div>
            <div className={`p-4 sm:pl-6 transition-all duration-300 rounded-2xl ${
              periode === "Ce Mois" 
                ? "bg-[#046A4E]/5 border border-[#046A4E]/10 scale-[1.01]" 
                : "opacity-60"
            }`}>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Ce mois</span>
              <span className={`text-lg sm:text-xl lg:text-2xl font-black transition-colors ${
                periode === "Ce Mois" ? "text-[#046A4E]" : "text-slate-900"
              }`}>{formatCFA(statsVentes.totalCeMois)}</span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ventesMensuelles}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis 
                  dataKey="mois" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
                  domain={[0, maxYValue]}
                  ticks={yTicks}
                  tickFormatter={(v) => v === 0 ? "0" : `${v.toLocaleString("fr-FR")}`}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(0, 0, 0, 0.02)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-lg text-xs font-semibold space-y-1">
                          <p className="text-slate-900 uppercase font-bold">{payload[0].payload.mois}</p>
                          <p className="text-[#046A4E]">Encaissées : {formatCFA(Number(payload[0].value))}</p>
                          <p className="text-slate-400">En attente : {formatCFA(Number(payload[1].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="encaissees" 
                  fill="#046A4E" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={16}
                />
                <Bar 
                  dataKey="enAttente" 
                  fill="#A3D1C6" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-500 mt-4 border-t border-slate-50 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#046A4E]"></span>
              <span>Factures encaissées</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#A3D1C6]"></span>
              <span>Factures en attente</span>
            </div>
          </div>
        </section>

        {/* CARD 4: PRODUITS PRINCIPAUX */}
        <section className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Produits principaux</h3>
              <p className="text-xs text-slate-400 font-medium">12 derniers mois</p>
            </div>
            
            {/* List with custom horizontal bar graphs */}
            <div className="space-y-4">
              {produitsPrincipaux.map((item, idx) => {
                const maxVal = Math.max(...produitsPrincipaux.map(p => p.montant));
                const percentage = maxVal > 0 ? (item.montant / maxVal) * 100 : 0;
                
                // Palette similaire : vert émeraude pour 1er et 5ème, bleu clair pour les autres
                const isEmerald = idx === 0 || idx === 4;
                const barColor = isEmerald ? "bg-[#046A4E]" : "bg-blue-100";
                
                return (
                  <div key={item.nom} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 truncate max-w-full">
                      <span className="truncate block text-left" title={item.nom}>{item.nom}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Axis at the bottom */}
          <div className="flex justify-between text-[9px] font-semibold text-slate-400 mt-6 pt-3 border-t border-slate-50">
            <span>0</span>
            <span>200,000</span>
            <span>400,000</span>
            <span>600,000</span>
          </div>
        </section>
      </div>

      {/* ==========================================
          BOTTOM FULL-WIDTH SECTION: ACTIVITÉS RÉCENTES
         ========================================== */}
      <section className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm transition-all duration-300 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">Activités récentes</h3>
          
          {/* Controls right side (Full Mobile Responsive alignment) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#046A4E]/30 focus:border-[#046A4E] transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between sm:justify-start gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-inner"
              >
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <span>Filtrer : {selectedStatus}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Dropdown Box */}
              {showStatusDropdown && (
                <>
                  <div 
                    onClick={() => setShowStatusDropdown(false)}
                    className="fixed inset-0 z-10"
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                    {["Tous", "Terminé", "En attente", "En retard"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowStatusDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-all"
                      >
                        <span>{status}</span>
                        {selectedStatus === status && <Check size={14} className="text-[#046A4E]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100/80">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 sm:py-4 px-4 sm:px-6 w-12 text-center">
                  <input type="checkbox" className="rounded border-slate-200 text-[#046A4E] focus:ring-[#046A4E] w-4 h-4 cursor-pointer" />
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Client</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Service</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Date</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Heure</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Prix</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredActivites.length > 0 ? (
                filteredActivites.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-all">
                    {/* Checkbox column */}
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                      <input type="checkbox" className="rounded border-slate-200 text-[#046A4E] focus:ring-[#046A4E] w-4 h-4 cursor-pointer" />
                    </td>

                    {/* Client column */}
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${item.avatarBg} ${item.avatarText} shrink-0`}>
                          {item.initials}
                        </div>
                        <span className="text-slate-900 font-bold whitespace-nowrap">{item.clientName}</span>
                      </div>
                    </td>

                    {/* Service column */}
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-500 font-medium whitespace-nowrap">
                      {item.service}
                    </td>

                    {/* Date column */}
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-500 font-medium whitespace-nowrap">
                      {item.date_emission}
                    </td>

                    {/* Heure column */}
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-400 font-medium whitespace-nowrap">
                      {item.heure_emission}
                    </td>

                    {/* Prix column */}
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-900 font-bold whitespace-nowrap">
                      {item.montant.toLocaleString("fr-FR")} CFA
                    </td>

                    {/* Statut Badge column */}
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      {item.statut_paiement === "Terminé" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Terminé</span>
                        </span>
                      )}
                      {item.statut_paiement === "En attente" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-500 rounded-full text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>En attente</span>
                        </span>
                      )}
                      {item.statut_paiement === "En retard" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span>En retard</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Aucune activité ne correspond à vos critères de filtrage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
