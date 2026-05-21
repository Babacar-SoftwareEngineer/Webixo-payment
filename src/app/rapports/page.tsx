"use client";

import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Briefcase,
  RefreshCw 
} from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function RapportsPage() {
  const { clients, factures, devis, isLoaded } = useAppState();

  // 1. Statistiques Globales (DRY)
  const statsGlobales = useMemo(() => {
    const totalFactures = factures.reduce((sum, f) => sum + f.montant, 0);
    const encaissees = factures
      .filter((f) => f.statut_paiement === "Terminé")
      .reduce((sum, f) => sum + f.montant, 0);
    
    // Taux de recouvrement : Pourcentage de trésorerie réellement encaissée
    const tauxRecouvrement = totalFactures > 0 ? Math.round((encaissees / totalFactures) * 100) : 0;

    // Taux de conversion de devis acceptés
    const devisAcceptes = devis.filter((d) => d.statut === "Accepté").length;
    const totalDevis = devis.length;
    const tauxConversionDevis = totalDevis > 0 ? Math.round((devisAcceptes / totalDevis) * 100) : 0;

    return {
      totalFactures,
      encaissees,
      tauxRecouvrement,
      tauxConversionDevis
    };
  }, [factures, devis]);

  // 2. Top Clients (Classement contributeurs CA)
  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    factures.forEach((f) => {
      const current = map.get(f.client_id) || 0;
      map.set(f.client_id, current + f.montant);
    });

    return Array.from(map.entries())
      .map(([id, montantTotal]) => {
        const client = clients.find((c) => c.id === id);
        return {
          nom: client?.nom_entreprise || "Client Inconnu",
          avatarBg: client?.avatarBg || "bg-slate-50",
          initials: client?.initials || "??",
          montant: montantTotal
        };
      })
      .sort((a, b) => b.montant - a.montant)
      .slice(0, 4);
  }, [factures, clients]);

  // 3. Ventilation du Chiffre d'Affaires par Services (Pour Donut Chart)
  const statsServices = useMemo(() => {
    const map = new Map<string, number>();
    factures.forEach((f) => {
      // Regrouper par type de prestation générique
      let key = "Autres prestations";
      if (f.service.toLowerCase().includes("site")) key = "Création Web";
      else if (f.service.toLowerCase().includes("cloud")) key = "Infrastructure Cloud";
      else if (f.service.toLowerCase().includes("sécurité") || f.service.toLowerCase().includes("audit")) key = "Audit & Sécurité";
      else if (f.service.toLowerCase().includes("maintenance")) key = "Maintenance";
      else if (f.service.toLowerCase().includes("seo") || f.service.toLowerCase().includes("conseil")) key = "SEO & Conseil";

      const current = map.get(key) || 0;
      map.set(key, current + f.montant);
    });

    const colors = ["#046A4E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

    return Array.from(map.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    })).filter(item => item.value > 0);
  }, [factures]);

  // 4. Évolution Mensuelle des Gains (Pour Bar Chart)
  const evolutionMensuelle = useMemo(() => {
    // Dans une vraie application, on grouperait par mois de date_emission. 
    // Ici, nous simulons une agrégation d'évolution à partir des 6 derniers mois.
    return [
      { mois: "Nov 25", encaisse: 120000, enAttente: 340000 },
      { mois: "Déc 25", encaisse: 240000, enAttente: 150000 },
      { mois: "Janv 26", encaisse: 120000, enAttente: 290000 },
      { mois: "Févr 26", encaisse: 400000, enAttente: 350000 },
      { mois: "Mars 26", encaisse: 550000, enAttente: 100000 },
      { mois: "Avr 26", encaisse: statsGlobales.encaissees, enAttente: statsGlobales.totalFactures - statsGlobales.encaissees }
    ];
  }, [statsGlobales]);

  const formatCFA = (val: number) => {
    return val.toLocaleString("fr-FR") + " CFA";
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Rapports Financiers</h1>
        <p className="text-sm text-slate-400 font-semibold">Analyses détaillées de la performance de l'agence</p>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volume Facturé</span>
            <div className="w-7 h-7 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
              <Briefcase size={14} />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{formatCFA(statsGlobales.totalFactures)}</span>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider block">Trésorerie Perçue</span>
            <div className="w-7 h-7 rounded-xl bg-brand-bg text-brand-primary flex items-center justify-center">
              <DollarSign size={14} />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-brand-primary">{formatCFA(statsGlobales.encaissees)}</span>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider block">Recouvrement</span>
            <div className="w-7 h-7 rounded-xl bg-warning-bg text-warning-text flex items-center justify-center">
              <Percent size={14} />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#D97706]">{statsGlobales.tauxRecouvrement} %</span>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider block">Conversion Devis</span>
            <div className="w-7 h-7 rounded-xl bg-brand-bg text-brand-primary flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{statsGlobales.tauxConversionDevis} %</span>
        </Card>
      </div>

      {/* Graphiques Principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique 1: Évolution gains (2/3 de la grille) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader title="Évolution des Encaissements" description="Comparatif mensuel de la trésorerie collectée (émeraude) et en attente (bleu clair)" />
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolutionMensuelle} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="mois" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }} />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toLocaleString("fr-FR")}k`}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(0, 0, 0, 0.01)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-lg text-xs font-semibold space-y-1">
                          <p className="text-slate-900 uppercase font-bold">{payload[0].payload.mois}</p>
                          <p className="text-[#046A4E]">Encaissé : {formatCFA(Number(payload[0].value))}</p>
                          <p className="text-slate-400">En attente : {formatCFA(Number(payload[1].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="encaisse" fill="#046A4E" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="enAttente" fill="#A3D1C6" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-xs font-bold text-slate-500 mt-4 border-t border-slate-50 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#046A4E]"></span>
              <span>Encaissé</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A3D1C6]"></span>
              <span>En attente / Retard</span>
            </div>
          </div>
        </Card>

        {/* Graphique 2: Donut Chart Services */}
        <Card className="flex flex-col justify-between">
          <CardHeader title="Ventilation par Services" description="Répartition sémantique du chiffre d'affaires" />
          
          {statsServices.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold text-xs py-8">
              Aucune donnée à analyser.
            </div>
          ) : (
            <>
              <div className="relative flex justify-center items-center h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsServices}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statsServices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Prestations</span>
                  <span className="text-sm font-black text-slate-800 mt-0.5">Webixo</span>
                </div>
              </div>

              {/* Légende du Donut */}
              <div className="space-y-2 mt-4 border-t border-slate-50 pt-4">
                {statsServices.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-500 font-semibold truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{formatCFA(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Grille Basse: Top Clients & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card>
          <CardHeader title="Classement Clients principaux" description="Top contributeurs sur le chiffre d'affaires global de l'agence" />
          <CardBody className="space-y-4">
            {topClients.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-semibold text-xs">
                Aucune facture enregistrée pour le moment.
              </div>
            ) : (
              topClients.map((c, idx) => {
                const maxCA = Math.max(...topClients.map((item) => item.montant));
                const percent = maxCA > 0 ? (c.montant / maxCA) * 100 : 0;
                
                return (
                  <div key={c.nom} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                        <span>{c.nom}</span>
                      </div>
                      <span>{formatCFA(c.montant)}</span>
                    </div>
                    
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Prévisions de Gains & Recouvrements */}
        <Card className="flex flex-col justify-between">
          <CardHeader title="Projections et Relances" description="Indicateurs de pilotage de trésorerie de l'agence" />
          <CardBody className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Trésorerie Bloquée (Retard)</span>
                <span className="text-lg font-extrabold text-danger-primary block mt-0.5">
                  {formatCFA(factures.filter(f => f.statut_paiement === "En retard").reduce((sum, f) => sum + f.montant, 0))}
                </span>
              </div>
              <Badge variant="danger">À relancer</Badge>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Entrées attendues (Acceptés)</span>
                <span className="text-lg font-extrabold text-brand-primary block mt-0.5">
                  {formatCFA(devis.filter(d => d.statut === "Accepté" && !factures.some(f => f.service === d.service)).reduce((sum, d) => sum + d.montant, 0))}
                </span>
              </div>
              <Badge variant="brand">À facturer</Badge>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
