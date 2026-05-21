"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Check, 
  X, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Download,
  Mail,
  FileText,
  Trash2,
  Info,
  TrendingUp
} from "lucide-react";
import { useAppState, Devis } from "@/hooks/useAppState";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  TableContainer, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHeadCell 
} from "@/components/ui/Table";

interface LineItem {
  id: string;
  description: string;
  units: number;
  price: number;
}

export default function DevisPage() {
  const { clients, factures, devis, addDevis, updateDevisStatut, convertDevisToFacture, isLoaded } = useAppState();

  // Mode de création split-screen
  const [isCreating, setIsCreating] = useState(false);

  // Filtrage des devis en mode liste
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Notifications Toast
  const [notification, setNotification] = useState<{ type: "success" | "info"; msg: string } | null>(null);

  const showToast = (type: "success" | "info", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  // ==========================================
  // ÉTATS DE L'ESPACE INTERACTIF (LEFT PANEL)
  // ==========================================
  const [expandedSection, setExpandedSection] = useState<string | null>("myDetails");

  // 1. Mes Informations
  const [companyName, setCompanyName] = useState("Clorio Studio");
  const [companyAddress, setCompanyAddress] = useState("Almadies, Dakar, Sénégal");
  const [companyEmail, setCompanyEmail] = useState("billing@clorio.com");
  const [companyPhone, setCompanyPhone] = useState("+221 33 824 15 15");
  const [companyWebsite, setCompanyWebsite] = useState("clorio.sn");

  // 2. Client Destinataire
  const [selectedClientId, setSelectedClientId] = useState("");

  const resolvedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // 3. Détails Devis & Services
  const [projectName, setProjectName] = useState("Refonte de Plateforme E-Commerce");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [validityDate, setValidityDate] = useState("");

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "Audit UX & Analyse Concurrentielle", units: 1, price: 150000 },
    { id: "2", description: "Design System & Maquettes Haute-Fidélité (Figma)", units: 1, price: 250000 },
    { id: "3", description: "Développement Frontend & Intégration API Shopify", units: 1, price: 500000 },
  ]);

  // Générer des métadonnées par défaut
  useEffect(() => {
    if (!quoteNumber) {
      setQuoteNumber(`DV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    if (!issuedDate) {
      const today = new Date().toISOString().split("T")[0];
      setIssuedDate(today);
    }
    if (!validityDate) {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      setValidityDate(future.toISOString().split("T")[0]);
    }
  }, [quoteNumber, issuedDate, validityDate]);

  // 4. Notes & Validité
  const [quoteNotes, setQuoteNotes] = useState(
    "Durée de validité : 30 jours à compter de la date d'émission. Conditions : Acompte de 30% exigé à la signature, solde à la livraison."
  );

  // 5. Signature
  const [signatureText, setSignatureText] = useState("Washim Chowdhury");
  const [signatureNote, setSignatureNote] = useState("Co-fondateur & CTO Clorio");

  // Erreurs de formulaire
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ==========================================
  // CALCULS FINANCIERS DU DEVIS
  // ==========================================
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.price * item.units, 0);
  }, [lineItems]);

  const tvaRate = 0.18;
  const tvaAmount = useMemo(() => {
    return Math.round(subtotal * tvaRate);
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return subtotal + tvaAmount;
  }, [subtotal, tvaAmount]);

  // ==========================================
  // ACTIONS DE L'ATELIER INTERACTIF
  // ==========================================
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "Nouveau Service Estimé",
      units: 1,
      price: 100000
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    } else {
      showToast("info", "Le devis doit comporter au moins une prestation.");
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSaveQuote = (status: "Brouillon" | "Envoyé") => {
    const errors: { [key: string]: string } = {};

    if (!selectedClientId) errors.clientId = "Veuillez sélectionner un client.";
    if (!projectName.trim()) errors.projectName = "Veuillez indiquer la prestation.";
    if (lineItems.some((item) => !item.description.trim())) {
      errors.lineItems = "Tous les libellés de services doivent être renseignés.";
    }
    if (lineItems.some((item) => item.price <= 0)) {
      errors.lineItems = "Les prix unitaires doivent être supérieurs à 0.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setExpandedSection(errors.clientId ? "clientDetails" : "quoteDetails");
      showToast("info", "Veuillez corriger les erreurs de saisie à gauche.");
      return;
    }

    // Agréger la description pour la table globale
    const aggregatedService = lineItems.map((i) => i.description).join(", ");

    // Convertir date au format standard textuel
    const rawDate = new Date(validityDate);
    const formatterDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    const formattedDateVal = formatterDate.format(rawDate);

    addDevis({
      client_id: selectedClientId,
      service: aggregatedService.length > 50 ? aggregatedService.substring(0, 47) + "..." : aggregatedService,
      montant: totalAmount,
      statut: status,
      date_validite: formattedDateVal
    });

    setIsCreating(false);
    setSelectedClientId("");
    setLineItems([
      { id: "1", description: "Audit UX & Analyse Concurrentielle", units: 1, price: 150000 },
      { id: "2", description: "Design System & Maquettes Haute-Fidélité (Figma)", units: 1, price: 250000 },
      { id: "3", description: "Développement Frontend & Intégration API Shopify", units: 1, price: 500000 },
    ]);
    setFormErrors({});
    showToast("success", `La proposition commerciale ${quoteNumber} a été enregistrée avec succès !`);
  };

  const handleDownloadPDF = async () => {
    showToast("info", "Génération du PDF...");
    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.querySelector(".printable-sheet");
      if (!element) {
        showToast("info", "Erreur : Document introuvable.");
        return;
      }

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `Devis-${quoteNumber || "brouillon"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          onclone: (clonedDoc: Document) => {
            // Liste exhaustive des propriétés à copier pour un rendu exact
            const propertiesToCopy = [
              "display", "position", "top", "right", "bottom", "left", "float", "clear",
              "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
              "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
              "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
              "border", "borderWidth", "borderStyle", "borderColor",
              "borderTop", "borderTopWidth", "borderTopStyle", "borderTopColor",
              "borderRight", "borderRightWidth", "borderRightStyle", "borderRightColor",
              "borderBottom", "borderBottomWidth", "borderBottomStyle", "borderBottomColor",
              "borderLeft", "borderLeftWidth", "borderLeftStyle", "borderLeftColor",
              "borderRadius", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
              "borderCollapse", "borderSpacing",
              "boxSizing",
              "flex", "flexDirection", "flexWrap", "justifyContent", "alignItems", "alignContent", "alignSelf", "order", "flexGrow", "flexShrink", "flexBasis",
              "grid", "gridTemplateColumns", "gridTemplateRows", "gridColumn", "gridRow", "gap", "columnGap", "rowGap",
              "font", "fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "textAlign", "textTransform", "textDecoration",
              "color", "background", "backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat",
              "opacity", "visibility", "zIndex", "overflow",
              "boxShadow", "textShadow", "verticalAlign", "whiteSpace", "wordBreak", "wordWrap",
              "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin", "transform", "tableLayout"
            ];

            const copyComputedStyles = (src: Element, dest: Element) => {
              const srcStyles = window.getComputedStyle(src);
              const destHtml = dest as HTMLElement;
              for (const prop of propertiesToCopy) {
                const val = srcStyles.getPropertyValue(prop);
                if (val) {
                  destHtml.style.setProperty(prop, val);
                }
              }
            };

            const originalElement = document.querySelector(".printable-sheet");
            if (originalElement) {
              const clonedElement = clonedDoc.querySelector(".printable-sheet");
              if (clonedElement) {
                const copyRecursive = (src: Element, dest: Element) => {
                  copyComputedStyles(src, dest);
                  const srcChildren = Array.from(src.children);
                  const destChildren = Array.from(dest.children);
                  for (let i = 0; i < srcChildren.length; i++) {
                    if (srcChildren[i] && destChildren[i]) {
                      copyRecursive(srcChildren[i], destChildren[i]);
                    }
                  }
                };
                copyRecursive(originalElement, clonedElement);
              }
            }

            // Supprimer toutes les feuilles de style de Tailwind ou de l'application qui pourraient planter à cause d'oklch
            // Tout en conservant celles qui définissent les @font-face pour Outfit et Georgia
            const styleTags = clonedDoc.querySelectorAll("style, link[rel='stylesheet']");
            styleTags.forEach((el) => {
              try {
                const htmlEl = el as HTMLElement;
                const textContent = htmlEl.textContent || "";
                if (
                  textContent.includes("@font-face") || 
                  textContent.includes("font-display") || 
                  textContent.includes("--font-outfit") || 
                  textContent.includes("--font-inter")
                ) {
                  // Nettoyer les oklch potentiels dans ces balises de police pour être 100% sûr d'éviter un crash
                  htmlEl.textContent = textContent
                    .replace(/oklch\([^)]+\)/g, "rgb(0,0,0)")
                    .replace(/lab\([^)]+\)/g, "rgb(0,0,0)")
                    .replace(/oklab\([^)]+\)/g, "rgb(0,0,0)");
                } else {
                  el.remove();
                }
              } catch (e) {
                el.remove();
              }
            });
          }
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      };

      await html2pdf().set(opt).from(element).save();
      showToast("success", "Téléchargement du PDF lancé !");
    } catch (err) {
      console.error("Erreur PDF:", err);
      showToast("info", "Échec de la génération du PDF.");
    }
  };

  const handleSendEmail = () => {
    if (!resolvedClient) {
      showToast("info", "Veuillez associer un client pour envoyer l'email.");
      return;
    }
    const subject = encodeURIComponent(`Proposition Commerciale ${quoteNumber} - ${companyName}`);
    const body = encodeURIComponent(
      `Bonjour ${resolvedClient.nom_contact},\n\nVeuillez trouver ci-joint notre proposition commerciale ${quoteNumber} concernant le projet "${projectName}" d'un montant de ${formatCFA(totalAmount)}.\n\nCordialement,\n${signatureText}\n${companyName}`
    );
    window.location.href = `mailto:${resolvedClient.email}?subject=${subject}&body=${body}`;
    showToast("success", `Ouverture de votre messagerie pour ${resolvedClient.email}`);
  };

  // ==========================================
  // CALCULS STATISTIQUES (MODE LISTE)
  // ==========================================
  const statsDevis = useMemo(() => {
    const totalCount = devis.length;
    const acceptes = devis.filter((d) => d.statut === "Accepté").length;
    const tauxConversion = totalCount > 0 ? Math.round((acceptes / totalCount) * 100) : 0;
    const volumeNegocie = devis.reduce((sum, d) => sum + d.montant, 0);

    return { totalCount, tauxConversion, volumeNegocie };
  }, [devis]);

  const filteredDevis = useMemo(() => {
    return devis.map((d) => {
      const client = clients.find((c) => c.id === d.client_id);
      return {
        ...d,
        clientName: client?.nom_entreprise || "Client Inconnu",
        clientInitials: client?.initials || "??",
        clientEmail: client?.email || "",
        clientAvatarBg: client?.avatarBg || "bg-slate-100 text-slate-500"
      };
    }).filter((d) => {
      const matchSearch = 
        d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.service.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === "Tous" || d.statut === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [devis, clients, searchTerm, selectedStatus]);

  const handleStatutChange = (id: string, statut: "Accepté" | "Refusé" | "Brouillon" | "Envoyé") => {
    updateDevisStatut(id, statut);
    showToast("success", `Le statut du devis a été changé en '${statut}'.`);
  };

  const handleConvertir = (id: string) => {
    const fact = convertDevisToFacture(id);
    if (fact) {
      showToast("success", "Excellent ! Devis accepté converti en Facture active avec succès !");
    }
  };

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-[#10B981]" size={20} />
          <span className="text-sm font-semibold">{notification.msg}</span>
        </div>
      )}

      {/* RENDER MODE: SPLIT SCREEN INTERACTIF */}
      {isCreating ? (
        <div className="space-y-6">
          {/* Header avec retour */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreating(false)}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block">Atelier de contractualisation</span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Rédiger un Devis</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* PANNEAU DE GAUCHE : FORMULAIRES ACCORDÉONS */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-brand-bg border border-brand-light/30 rounded-2xl p-4 flex gap-3 text-brand-dark">
                <Info size={18} className="shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed font-sans">
                  Ajustez les lots de travaux, tarifs et conditions à gauche. L'estimation commerciale à droite se met à jour en direct !
                </div>
              </div>

              {/* ACCORDÉON 1 : ÉMETTEUR */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleSection("myDetails")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>1. Informations de l'Agence</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "myDetails" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "myDetails" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input 
                      label="Nom de l'agence"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <Input 
                      label="Adresse"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                      />
                      <Input 
                        label="Téléphone"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDÉON 2 : CLIENT */}
              <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${formErrors.clientId ? "border-danger-primary" : "border-slate-200"}`}>
                <button 
                  onClick={() => toggleSection("clientDetails")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>2. Client Destinataire</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "clientDetails" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "clientDetails" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sélectionner un Client global</label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => {
                          setSelectedClientId(e.target.value);
                          if (e.target.value) setFormErrors((prev) => ({ ...prev, clientId: "" }));
                        }}
                        className={`w-full py-2.5 px-4 rounded-2xl text-sm bg-white border transition-all text-slate-800 focus:outline-none focus:ring-2 ${
                          formErrors.clientId ? "border-danger-primary focus:ring-danger-primary/25" : "border-slate-200 focus:ring-brand-primary/25"
                        }`}
                      >
                        <option value="">-- Choisir un client --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom_entreprise}
                          </option>
                        ))}
                      </select>
                      {formErrors.clientId && <span className="text-xs font-semibold text-danger-primary">{formErrors.clientId}</span>}
                    </div>

                    {resolvedClient && (
                      <div className="bg-brand-bg/50 border border-brand-light/20 rounded-2xl p-4 space-y-1.5 text-xs font-semibold text-slate-800">
                        <span className="text-[10px] font-bold text-brand-primary uppercase block">Prospect résolu</span>
                        <div>🏢 {resolvedClient.nom_entreprise}</div>
                        <div className="text-slate-500">👤 Interlocuteur : {resolvedClient.nom_contact}</div>
                        <div className="text-slate-500">✉️ Email : {resolvedClient.email}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACCORDÉON 3 : LOTS DE TRAVAUX */}
              <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${formErrors.projectName || formErrors.lineItems ? "border-danger-primary" : "border-slate-200"}`}>
                <button 
                  onClick={() => toggleSection("quoteDetails")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>3. Lots de Travaux & Estimations</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "quoteDetails" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "quoteDetails" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input 
                      label="Prestation Globale / Projet"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                        if (e.target.value) setFormErrors((prev) => ({ ...prev, projectName: "" }));
                      }}
                      error={formErrors.projectName}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Date d'émission"
                        type="date"
                        value={issuedDate}
                        onChange={(e) => setIssuedDate(e.target.value)}
                      />
                      <Input 
                        label="Validité de l'offre"
                        type="date"
                        value={validityDate}
                        onChange={(e) => setValidityDate(e.target.value)}
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lots de travaux</span>
                        <Button variant="outline" size="sm" onClick={addLineItem} leftIcon={<Plus size={12} />}>
                          Ajouter un lot
                        </Button>
                      </div>

                      {lineItems.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 relative">
                          <button 
                            onClick={() => removeLineItem(item.id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-danger-primary transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <Input 
                            placeholder="Description du lot ou de la charge de service"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                            className="text-xs py-1.5"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              type="number"
                              label="Qté"
                              value={item.units}
                              onChange={(e) => updateLineItem(item.id, "units", parseInt(e.target.value) || 1)}
                              className="text-xs py-1.5"
                            />
                            <Input 
                              type="number"
                              label="Montant du lot (CFA)"
                              value={item.price}
                              onChange={(e) => updateLineItem(item.id, "price", parseFloat(e.target.value) || 0)}
                              className="text-xs py-1.5"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDÉON 4 : CONDITIONS */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleSection("notesSignature")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>4. Conditions & Validité Commerciale</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "notesSignature" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "notesSignature" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clauses particulières</label>
                      <textarea
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                        rows={3}
                        className="w-full py-2.5 px-4 rounded-2xl text-sm bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Signataire commercial"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                      />
                      <Input 
                        label="Qualité"
                        value={signatureNote}
                        onChange={(e) => setSignatureNote(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* PANNEAU DE DROITE : APERÇU DE LA PROPOSITION COMMERCIALE */}
            <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-4">
              
              {/* Barre d'outils */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <span className="text-sm font-bold text-slate-800">Aperçu Proposition</span>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Download size={13} />} onClick={handleDownloadPDF}>
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Mail size={13} />} onClick={handleSendEmail}>
                    Email
                  </Button>
                  
                  <div className="inline-flex gap-1.5 ml-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveQuote("Brouillon")}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Brouillon
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSaveQuote("Envoyé")}
                      className="bg-brand-primary hover:bg-brand-hover text-white font-bold"
                    >
                      Envoyer Proposition
                    </Button>
                  </div>
                </div>
              </div>

              {/* SHEET APERCU */}
              <div className="printable-sheet bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-8 text-slate-800 transition-all font-sans">
                
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Proposition Commerciale</h2>
                    <span className="text-xs font-bold text-slate-400 block mt-0.5">Devis n° {quoteNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-brand-primary tracking-tighter">{companyName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{companyWebsite}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 text-xs font-bold">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prestation</span>
                    <span className="text-slate-800 block mt-1">{projectName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date de l'offre</span>
                    <span className="text-slate-800 block mt-1">{issuedDate ? new Date(issuedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Limite de validité</span>
                    <span className="text-slate-800 block mt-1">{validityDate ? new Date(validityDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Préparé par</span>
                    <span className="font-bold text-slate-800 block">{companyName}</span>
                    <span className="text-slate-500 block leading-relaxed">{companyAddress}</span>
                    <span className="text-slate-400 font-semibold block">{companyPhone}</span>
                    <span className="text-slate-400 font-semibold block">{companyEmail}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destiné à</span>
                    {resolvedClient ? (
                      <>
                        <span className="font-bold text-slate-800 block">{resolvedClient.nom_entreprise}</span>
                        <span className="text-slate-500 block leading-relaxed">{resolvedClient.adresse}</span>
                        <span className="text-slate-400 font-semibold block">À l'attention de : {resolvedClient.nom_contact}</span>
                        <span className="text-slate-400 font-semibold block">{resolvedClient.email}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-semibold italic block">Aucun destinataire sélectionné</span>
                    )}
                  </div>
                </div>

                {/* Lots de travaux */}
                <div className="space-y-4">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                        <th className="py-2.5 font-bold">Nature du Lot / Prestation</th>
                        <th className="py-2.5 text-center font-bold">Qté</th>
                        <th className="py-2.5 text-right font-bold">Tarif unitaire</th>
                        <th className="py-2.5 text-right font-bold">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 text-slate-800 font-semibold">
                          <td className="py-3 font-semibold">{item.description}</td>
                          <td className="py-3 text-center">{item.units}</td>
                          <td className="py-3 text-right">{formatCFA(item.price)}</td>
                          <td className="py-3 text-right font-bold text-slate-900">{formatCFA(item.price * item.units)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-2 text-xs">
                    <div className="w-64 space-y-2.5 font-bold">
                      <div className="flex justify-between text-slate-500 font-semibold">
                        <span>Sous-total</span>
                        <span>{formatCFA(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-semibold">
                        <span>TVA (18%)</span>
                        <span>{formatCFA(tvaAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 text-sm font-black">
                        <span>Estimation Globale</span>
                        <span className="text-brand-primary">{formatCFA(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {quoteNotes && (
                  <div className="text-[10px] text-slate-400 font-semibold leading-relaxed border-l-2 border-slate-200 pl-3">
                    {quoteNotes}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <div className="text-center w-48 space-y-1">
                    <span className="text-[20px] font-cursive font-medium text-brand-primary select-none block tracking-tighter" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                      {signatureText}
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 block border-t border-slate-200 pt-1">{signatureText}</span>
                    <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block">{signatureNote}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      ) : (
        /* RENDER MODE: LIST VIEW */
        <div className="space-y-8">
          
          {/* En-tête */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Gestion des devis</h1>
              <p className="text-sm text-slate-400 font-semibold">Propositions commerciales et contractualisation</p>
            </div>
            <Button 
              variant="primary" 
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreating(true)}
              className="self-start sm:self-center bg-brand-primary hover:bg-brand-hover text-white font-bold"
            >
              Créer un Devis
            </Button>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nombre de Devis</span>
              <span className="text-2xl font-black text-slate-900">{statsDevis.totalCount}</span>
            </Card>
            <Card>
              <span className="text-xs font-bold text-[#065F46] uppercase tracking-wider block mb-1">Taux d'acceptation</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-brand-primary">{statsDevis.tauxConversion} %</span>
                <TrendingUp size={18} className="text-brand-primary" />
              </div>
            </Card>
            <Card>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Volume en négociation</span>
              <span className="text-2xl font-black text-slate-900">{formatCFA(statsDevis.volumeNegocie)}</span>
            </Card>
          </div>

          {/* Liste & Filtres */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <Input 
                placeholder="Rechercher par client ou service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={16} />}
                containerClassName="w-full sm:max-w-md"
              />

              {/* Dropdown de Statut */}
              <div className="relative w-full sm:w-auto self-start sm:self-center">
                <button 
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full sm:w-48 flex items-center justify-between gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
                >
                  <span>Statut : {selectedStatus}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showStatusDropdown ? "rotate-180" : ""}`} />
                </button>

                {showStatusDropdown && (
                  <>
                    <div onClick={() => setShowStatusDropdown(false)} className="fixed inset-0 z-10" />
                    <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                      {["Tous", "Brouillon", "Envoyé", "Accepté", "Refusé"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedStatus(option);
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-all font-semibold"
                        >
                          <span>{option}</span>
                          {selectedStatus === option && <Check size={14} className="text-brand-primary stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tableau */}
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeadCell>Client</TableHeadCell>
                    <TableHeadCell>Prestation / Service</TableHeadCell>
                    <TableHeadCell>Date d'émission</TableHeadCell>
                    <TableHeadCell>Validité</TableHeadCell>
                    <TableHeadCell>Montant estimé</TableHeadCell>
                    <TableHeadCell>Statut</TableHeadCell>
                    <TableHeadCell className="text-right">Actions</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                        Aucun devis enregistré pour cette recherche.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevis.map((dev) => {
                      return (
                        <TableRow key={dev.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${dev.clientAvatarBg} flex items-center justify-center font-bold text-xs select-none`}>
                                {dev.clientInitials}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{dev.clientName}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">{dev.clientEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{dev.service}</TableCell>
                          <TableCell>{dev.date_emission}</TableCell>
                          <TableCell>{dev.date_validite}</TableCell>
                          <TableCell className="font-bold text-slate-900">{formatCFA(dev.montant)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                dev.statut === "Accepté" 
                                  ? "success" 
                                  : dev.statut === "Envoyé" 
                                  ? "info" 
                                  : dev.statut === "Refusé" 
                                  ? "danger" 
                                  : "neutral"
                              }
                            >
                              {dev.statut}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {dev.statut === "Envoyé" && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-brand-primary border-brand-primary/10 hover:bg-brand-bg font-semibold"
                                    onClick={() => handleStatutChange(dev.id, "Accepté")}
                                  >
                                    Accepter
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500 hover:bg-red-50 font-semibold"
                                    onClick={() => handleStatutChange(dev.id, "Refusé")}
                                  >
                                    Refuser
                                  </Button>
                                </>
                              )}
                              {dev.statut === "Accepté" && (
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  leftIcon={<FileText size={13} />}
                                  onClick={() => handleConvertir(dev.id)}
                                >
                                  Facturer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

        </div>
      )}
    </div>
  );
}