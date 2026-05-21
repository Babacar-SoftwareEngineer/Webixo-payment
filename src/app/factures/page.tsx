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
  CreditCard,
  Trash2,
  Info
} from "lucide-react";
import { useAppState, Facture } from "@/hooks/useAppState";
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

export default function FacturesPage() {
  const { clients, factures, addFacture, updateFactureStatut, isLoaded } = useAppState();

  // Mode de création split-screen
  const [isCreating, setIsCreating] = useState(false);

  // États de filtrage & recherche (mode liste)
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

  // 1. Mes Détails (Émetteur)
  const [companyName, setCompanyName] = useState("Clorio Studio");
  const [companyAddress, setCompanyAddress] = useState("Almadies, Dakar, Sénégal");
  const [companyEmail, setCompanyEmail] = useState("billing@clorio.com");
  const [companyPhone, setCompanyPhone] = useState("+221 33 824 15 15");
  const [companyTaxId, setCompanyTaxId] = useState("ABN 987-654-321");
  const [companyWebsite, setCompanyWebsite] = useState("clorio.sn");

  // 2. Détails Client
  const [selectedClientId, setSelectedClientId] = useState("");
  
  // Client résolu automatiquement depuis la base relationnelle
  const resolvedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // 3. Détails Facture (Projet et Dates)
  const [projectName, setProjectName] = useState("Développement Plateforme Web");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  // Articles / Services multiples
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "Conception UI/UX & Prototypes", units: 1, price: 250000 },
    { id: "2", description: "Développement Next.js / Tailwind CSS", units: 1, price: 350000 },
  ]);

  // Générer un numéro de facture par défaut
  useEffect(() => {
    if (!invoiceNumber) {
      setInvoiceNumber(`FC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    if (!issuedDate) {
      const today = new Date().toISOString().split("T")[0];
      setIssuedDate(today);
    }
    if (!dueDate) {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      setDueDate(future.toISOString().split("T")[0]);
    }
  }, [invoiceNumber, issuedDate, dueDate]);

  // 4. Détails de Paiement
  const [paymentMethod, setPaymentMethod] = useState("Virement Bancaire (EFT)");
  const [bankAccountName, setBankAccountName] = useState("CLORIO STUDIO S.A.S.");
  const [bankCode, setBankCode] = useState("SN012 - BOA DAKAR");
  const [bankAccountNumber, setBankAccountNumber] = useState("991188343445123");

  // 5. Notes et Conditions
  const [invoiceNotes, setInvoiceNotes] = useState(
    "Pénalités de retard : 10% par an calculées à compter du jour suivant la date d'échéance."
  );

  // 6. Signature
  const [signatureText, setSignatureText] = useState("Washim Chowdhury");
  const [signatureNote, setSignatureNote] = useState("Co-fondateur & CTO Clorio");

  // Erreurs de formulaire
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ==========================================
  // CALCULS FINANCIERS DE LA FACTURE DYNAMIQUE
  // ==========================================
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.price * item.units, 0);
  }, [lineItems]);

  const tvaRate = 0.18; // TVA standard de 18% au Sénégal
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
      description: "Nouveau Service",
      units: 1,
      price: 50000
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    } else {
      showToast("info", "La facture doit comporter au moins un service.");
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

  // Soumission interactive
  const handleSaveInvoice = (status: "Terminé" | "En attente") => {
    const errors: { [key: string]: string } = {};

    if (!selectedClientId) errors.clientId = "Veuillez sélectionner un client.";
    if (!projectName.trim()) errors.projectName = "Veuillez indiquer le projet.";
    if (lineItems.some((item) => !item.description.trim())) {
      errors.lineItems = "Tous les libellés de services doivent être renseignés.";
    }
    if (lineItems.some((item) => item.price <= 0)) {
      errors.lineItems = "Les tarifs unitaires doivent être supérieurs à 0.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setExpandedSection(errors.clientId ? "clientDetails" : "invoiceDetails");
      showToast("info", "Veuillez corriger les erreurs de saisie à gauche.");
      return;
    }

    // Agréger la description pour la table globale
    const aggregatedService = lineItems.map((i) => i.description).join(", ");

    addFacture({
      client_id: selectedClientId,
      service: aggregatedService.length > 50 ? aggregatedService.substring(0, 47) + "..." : aggregatedService,
      montant: totalAmount,
      statut_paiement: status
    });

    // Reset et fermeture
    setIsCreating(false);
    setSelectedClientId("");
    setLineItems([
      { id: "1", description: "Conception UI/UX & Prototypes", units: 1, price: 250000 },
      { id: "2", description: "Développement Next.js / Tailwind CSS", units: 1, price: 350000 },
    ]);
    setFormErrors({});
    showToast("success", `La facture ${invoiceNumber} a été enregistrée avec le statut '${status}' !`);
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
        filename: `Facture-${invoiceNumber || "brouillon"}.pdf`,
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
      showToast("info", "Veuillez sélectionner un client pour définir l'adresse email.");
      return;
    }
    const subject = encodeURIComponent(`Facture ${invoiceNumber} - ${companyName}`);
    const body = encodeURIComponent(
      `Bonjour ${resolvedClient.nom_contact},\n\nVeuillez trouver ci-joint la facture ${invoiceNumber} concernant le projet "${projectName}" d'un montant de ${formatCFA(totalAmount)}.\n\nCordialement,\n${signatureText}\n${companyName}`
    );
    window.location.href = `mailto:${resolvedClient.email}?subject=${subject}&body=${body}`;
    showToast("success", `Ouverture de votre messagerie pour ${resolvedClient.email}`);
  };

  // ==========================================
  // CALCULS STATISTIQUES (MODE LISTE)
  // ==========================================
  const statsFactures = useMemo(() => {
    let total = 0;
    let encaisse = 0;
    let attente = 0;
    let retard = 0;

    factures.forEach((f) => {
      total += f.montant;
      if (f.statut_paiement === "Terminé") {
        encaisse += f.montant;
      } else if (f.statut_paiement === "En attente") {
        attente += f.montant;
      } else if (f.statut_paiement === "En retard") {
        retard += f.montant;
      }
    });

    return { total, encaisse, attente, retard };
  }, [factures]);

  // Filtrage des factures
  const filteredFactures = useMemo(() => {
    return factures.map((f) => {
      const client = clients.find((c) => c.id === f.client_id);
      return {
        ...f,
        clientName: client?.nom_entreprise || "Client Inconnu",
        clientInitials: client?.initials || "??",
        clientEmail: client?.email || "",
        clientAvatarBg: client?.avatarBg || "bg-slate-100 text-slate-500"
      };
    }).filter((f) => {
      const matchSearch = 
        f.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.service.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = selectedStatus === "Tous" || f.statut_paiement === selectedStatus;
      
      return matchSearch && matchStatus;
    });
  }, [factures, clients, searchTerm, selectedStatus]);

  const handlePayer = (id: string) => {
    updateFactureStatut(id, "Terminé");
    showToast("success", "Paiement encaissé ! Le statut est à présent 'Terminé'.");
  };

  const handleRelancer = (clientName: string, email: string) => {
    showToast("info", `Notification de relance SMS & Email envoyée à ${clientName} (${email}).`);
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

  // ==========================================
  // RENDU VISUEL DE L'APPLICATION
  // ==========================================
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          {notification.type === "success" ? (
            <CheckCircle2 className="text-[#10B981]" size={20} />
          ) : (
            <Send className="text-blue-400 animate-pulse" size={20} />
          )}
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
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block">Atelier de conception</span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Émettre une Facture</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* PANNEAU DE GAUCHE : FORMULAIRES ACCORDÉONS (5 Colonnes) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-brand-bg border border-brand-light/30 rounded-2xl p-4 flex gap-3 text-brand-dark">
                <Info size={18} className="shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  Remplissez les détails à gauche. La facture à droite s'ajuste instantanément en temps réel !
                </div>
              </div>

              {/* SECTION 1 : MES DÉTAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleSection("myDetails")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>1. Mes Informations (Émetteur)</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "myDetails" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "myDetails" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input 
                      label="Nom de l'entreprise"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <Input 
                      label="Adresse postale"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Adresse email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                      />
                      <Input 
                        label="Téléphone"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Numéro fiscal / ABN"
                        value={companyTaxId}
                        onChange={(e) => setCompanyTaxId(e.target.value)}
                      />
                      <Input 
                        label="Site internet"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2 : COMPTE CLIENT */}
              <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${formErrors.clientId ? "border-danger-primary" : "border-slate-200"}`}>
                <button 
                  onClick={() => toggleSection("clientDetails")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>2. Coordonnées du Client</span>
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
                            {c.nom_entreprise} ({c.nom_contact})
                          </option>
                        ))}
                      </select>
                      {formErrors.clientId && <span className="text-xs font-semibold text-danger-primary">{formErrors.clientId}</span>}
                    </div>

                    {resolvedClient && (
                      <div className="bg-brand-bg/50 border border-brand-light/20 rounded-2xl p-4 space-y-2 text-xs font-semibold">
                        <span className="text-[10px] font-bold text-brand-primary uppercase block">Fiche client synchronisée</span>
                        <div className="text-slate-800">🏢 {resolvedClient.nom_entreprise}</div>
                        <div className="text-slate-500">👤 Contact : {resolvedClient.nom_contact}</div>
                        <div className="text-slate-500">✉️ Email : {resolvedClient.email}</div>
                        <div className="text-slate-500">📍 Adresse : {resolvedClient.adresse}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 3 : DÉTAILS PRESTATION */}
              <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${formErrors.projectName || formErrors.lineItems ? "border-danger-primary" : "border-slate-200"}`}>
                <button 
                  onClick={() => toggleSection("invoiceDetails")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>3. Détails & Services Prestés</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "invoiceDetails" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "invoiceDetails" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input 
                      label="Nom du Projet"
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
                        label="Date d'échéance"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Services et Prix</span>
                        <Button variant="outline" size="sm" onClick={addLineItem} leftIcon={<Plus size={12} />}>
                          Ajouter un service
                        </Button>
                      </div>

                      {lineItems.map((item, idx) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 relative">
                          <button 
                            onClick={() => removeLineItem(item.id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-danger-primary transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <Input 
                            placeholder="Description du service"
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
                              label="Prix Unit. (CFA)"
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

              {/* SECTION 4 : MOYEN DE PAIEMENT */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleSection("paymentDetails")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>4. Détails du Virement</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "paymentDetails" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "paymentDetails" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input 
                      label="Méthode de Paiement"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <Input 
                      label="Titulaire du Compte"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Code Banque / Guichet"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                      />
                      <Input 
                        label="Numéro de Compte"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5 : NOTES & SIGNATURE */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleSection("notesSignature")}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <span>5. Notes & Conditions</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSection === "notesSignature" ? "rotate-180" : ""}`} />
                </button>
                {expandedSection === "notesSignature" && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conditions de facturation</label>
                      <textarea
                        value={invoiceNotes}
                        onChange={(e) => setInvoiceNotes(e.target.value)}
                        rows={3}
                        className="w-full py-2.5 px-4 rounded-2xl text-sm bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Signataire"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                      />
                      <Input 
                        label="Qualité / Fonction"
                        value={signatureNote}
                        onChange={(e) => setSignatureNote(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* PANNEAU DE DROITE : APERÇU FEUILLE PREMIUM (7 Colonnes) */}
            <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-4">
              
              {/* Barre d'outils de prévisualisation */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <span className="text-sm font-bold text-slate-800">Aperçu Réel</span>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Download size={13} />} onClick={handleDownloadPDF}>
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Mail size={13} />} onClick={handleSendEmail}>
                    Email
                  </Button>
                  
                  {/* Actions de sauvegarde */}
                  <div className="inline-flex gap-1.5 ml-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveInvoice("En attente")}
                      className="border-warning-primary/20 text-warning-text hover:bg-warning-bg"
                    >
                      Brouillon
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSaveInvoice("Terminé")}
                      className="bg-brand-primary hover:bg-brand-hover text-white font-bold"
                    >
                      Émettre Facture
                    </Button>
                  </div>
                </div>
              </div>

              {/* FEUILLE D'APERCU PREMIUM - EFFET PAPIER IMPRIMABLE */}
              <div className="printable-sheet bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-8 text-slate-800 transition-all font-sans">
                
                {/* En-tête : Numéro et Logo */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Facture</h2>
                    <span className="text-xs font-bold text-slate-400 block mt-0.5">{invoiceNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-brand-primary tracking-tighter">{companyName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{companyWebsite}</span>
                  </div>
                </div>

                {/* Métadonnées du Projet */}
                <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 text-xs font-bold">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Projet</span>
                    <span className="text-slate-800 block mt-1">{projectName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Émission</span>
                    <span className="text-slate-800 block mt-1">{issuedDate ? new Date(issuedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Échéance</span>
                    <span className="text-slate-800 block mt-1">{dueDate ? new Date(dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                </div>

                {/* De / Pour Coordonnées */}
                <div className="grid grid-cols-2 gap-8 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">De</span>
                    <span className="font-bold text-slate-800 block">{companyName}</span>
                    <span className="text-slate-500 block leading-relaxed">{companyAddress}</span>
                    <span className="text-slate-400 font-semibold block">{companyPhone}</span>
                    <span className="text-slate-400 font-semibold block">{companyEmail}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pour</span>
                    {resolvedClient ? (
                      <>
                        <span className="font-bold text-slate-800 block">{resolvedClient.nom_entreprise}</span>
                        <span className="text-slate-500 block leading-relaxed">{resolvedClient.adresse}</span>
                        <span className="text-slate-400 font-semibold block">Contact : {resolvedClient.nom_contact}</span>
                        <span className="text-slate-400 font-semibold block">{resolvedClient.email}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-semibold italic block">Aucun client sélectionné</span>
                    )}
                  </div>
                </div>

                {/* Tableau des prestations */}
                <div className="space-y-4">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                        <th className="py-2.5 font-bold">Service / Prestation</th>
                        <th className="py-2.5 text-center font-bold">Qté</th>
                        <th className="py-2.5 text-right font-bold">Prix Unit.</th>
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

                  {/* Totaux */}
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
                        <span>Montant Total</span>
                        <span className="text-brand-primary">{formatCFA(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloc d'informations Virement */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-[10px] space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Coordonnées bancaires pour le paiement</span>
                  <div className="text-slate-700 font-semibold">Moyen : {paymentMethod}</div>
                  <div className="text-slate-500">Titulaire : {bankAccountName}</div>
                  <div className="text-slate-500">Banque : {bankCode}</div>
                  <div className="text-slate-500">Compte : {bankAccountNumber}</div>
                </div>

                {/* Conditions / Notes */}
                {invoiceNotes && (
                  <div className="text-[10px] text-slate-400 font-semibold leading-relaxed border-l-2 border-slate-200 pl-3">
                    {invoiceNotes}
                  </div>
                )}

                {/* Bloc Signature */}
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
        /* RENDER MODE: STANDARD LIST VIEW (KPIs + Tableau des factures) */
        <div className="space-y-8">
          
          {/* En-tête */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Gestion des factures</h1>
              <p className="text-sm text-slate-400 font-semibold">Suivi des encaissements et processus de relance</p>
            </div>
            <Button 
              variant="primary" 
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreating(true)}
              className="self-start sm:self-center bg-brand-primary hover:bg-brand-hover text-white font-bold"
            >
              Nouvelle Facture
            </Button>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Chiffre d'Affaires</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-sans">{formatCFA(statsFactures.total)}</span>
            </Card>
            <Card>
              <span className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider block mb-1 font-sans">Total Encaissé</span>
              <span className="text-xl sm:text-2xl font-black text-brand-primary font-sans">{formatCFA(statsFactures.encaisse)}</span>
            </Card>
            <Card>
              <span className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider block mb-1 font-sans">En attente</span>
              <span className="text-xl sm:text-2xl font-black text-[#D97706] font-sans">{formatCFA(statsFactures.attente)}</span>
            </Card>
            <Card>
              <span className="text-[10px] font-bold text-[#991B1B] uppercase tracking-wider block mb-1 font-sans">En retard</span>
              <span className="text-xl sm:text-2xl font-black text-danger-primary font-sans">{formatCFA(statsFactures.retard)}</span>
            </Card>
          </div>

          {/* Filtres & Recherche */}
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
                  <span>Statut : {selectedStatus === "En attente" ? "Brouillon / En attente" : selectedStatus}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showStatusDropdown ? "rotate-180" : ""}`} />
                </button>

                {showStatusDropdown && (
                  <>
                    <div onClick={() => setShowStatusDropdown(false)} className="fixed inset-0 z-10" />
                    <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                      {["Tous", "Terminé", "En attente", "En retard"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedStatus(option);
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-all font-semibold"
                        >
                          <span>{option === "En attente" ? "Brouillon / En attente" : option}</span>
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
                    <TableHeadCell>Service</TableHeadCell>
                    <TableHeadCell>Date d'émission</TableHeadCell>
                    <TableHeadCell>Montant</TableHeadCell>
                    <TableHeadCell>Statut</TableHeadCell>
                    <TableHeadCell className="text-right">Actions</TableHeadCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFactures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                        Aucune facture enregistrée pour ce filtre.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFactures.map((facture) => {
                      return (
                        <TableRow key={facture.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${facture.clientAvatarBg} flex items-center justify-center font-bold text-xs select-none`}>
                                {facture.clientInitials}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{facture.clientName}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">{facture.clientEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{facture.service}</TableCell>
                          <TableCell>{facture.date_emission}</TableCell>
                          <TableCell className="font-bold text-slate-900">{formatCFA(facture.montant)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                facture.statut_paiement === "Terminé" 
                                  ? "success" 
                                  : facture.statut_paiement === "En attente" 
                                  ? "warning" 
                                  : "danger"
                              }
                            >
                              {facture.statut_paiement}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {(facture.statut_paiement === "En attente" || facture.statut_paiement === "En retard") && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  leftIcon={<CheckCircle2 size={13} className="text-brand-primary font-bold" />}
                                  onClick={() => handlePayer(facture.id)}
                                >
                                  Encaisser
                                </Button>
                              )}
                              {facture.statut_paiement === "En retard" && (
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  leftIcon={<Send size={13} />}
                                  onClick={() => handleRelancer(facture.clientName, facture.clientEmail)}
                                >
                                  Relancer
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