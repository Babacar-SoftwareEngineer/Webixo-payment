"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Check, 
  Send,
  CheckCircle2, 
  RefreshCw,
  ArrowLeft,
  Download,
  Mail,
  Trash2,
  Info
} from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

const formatDateWithDots = (dateStr: string) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateStr;
  }
};

const formatNumberWithSpaces = (val: number): string => {
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const oklchToRgb = (l: string | number, c: string | number, h: string | number, alpha: string | number = 1): string => {
  const L = typeof l === "string" && l.endsWith("%") ? parseFloat(l) / 100 : parseFloat(l as string);
  const C = parseFloat(c as string);
  const H = parseFloat(h as string);
  const A = typeof alpha === "string" && alpha.endsWith("%") ? parseFloat(alpha) / 100 : parseFloat(alpha as string);

  if (isNaN(L) || isNaN(C) || isNaN(H)) return "rgb(100, 116, 139)";

  // Oklch to Oklab coordinates
  const hRad = (H * Math.PI) / 180;
  const oklab_a = C * Math.cos(hRad);
  const oklab_b = C * Math.sin(hRad);

  // Oklab to LMS
  const l_lms_root = L + 0.3963377774 * oklab_a + 0.2158037573 * oklab_b;
  const m_lms_root = L - 0.1055613458 * oklab_a - 0.0638541728 * oklab_b;
  const s_lms_root = L - 0.0894841775 * oklab_a - 1.2914855480 * oklab_b;

  const l_lms = l_lms_root * l_lms_root * l_lms_root;
  const m_lms = m_lms_root * m_lms_root * m_lms_root;
  const s_lms = s_lms_root * s_lms_root * s_lms_root;

  // LMS to linear sRGB
  const r_lin = +4.0767416621 * l_lms - 3.3077115913 * m_lms + 0.2309699292 * s_lms;
  const g_lin = -1.2684380046 * l_lms + 2.6097574011 * m_lms - 0.3413193965 * s_lms;
  const b_lin = -0.0041960863 * l_lms - 0.7034186147 * m_lms + 1.7076147010 * s_lms;

  // Linear to sRGB gamma
  const f = (x: number) => x > 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;

  const r = Math.max(0, Math.min(255, Math.round(f(r_lin) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(g_lin) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(b_lin) * 255)));

  return A === 1 || isNaN(A) ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${A})`;
};

const oklabToRgb = (l: string | number, aCoord: string | number, bCoord: string | number, alpha: string | number = 1): string => {
  const L = typeof l === "string" && l.endsWith("%") ? parseFloat(l) / 100 : parseFloat(l as string);
  const oklab_a = parseFloat(aCoord as string);
  const oklab_b = parseFloat(bCoord as string);
  const A = typeof alpha === "string" && alpha.endsWith("%") ? parseFloat(alpha) / 100 : parseFloat(alpha as string);

  if (isNaN(L) || isNaN(oklab_a) || isNaN(oklab_b)) return "rgb(243, 244, 246)";

  // Oklab to LMS
  const l_lms_root = L + 0.3963377774 * oklab_a + 0.2158037573 * oklab_b;
  const m_lms_root = L - 0.1055613458 * oklab_a - 0.0638541728 * oklab_b;
  const s_lms_root = L - 0.0894841775 * oklab_a - 1.2914855480 * oklab_b;

  const l_lms = l_lms_root * l_lms_root * l_lms_root;
  const m_lms = m_lms_root * m_lms_root * m_lms_root;
  const s_lms = s_lms_root * s_lms_root * s_lms_root;

  // LMS to linear sRGB
  const r_lin = +4.0767416621 * l_lms - 3.3077115913 * m_lms + 0.2309699292 * s_lms;
  const g_lin = -1.2684380046 * l_lms + 2.6097574011 * m_lms - 0.3413193965 * s_lms;
  const b_lin = -0.0041960863 * l_lms - 0.7034186147 * m_lms + 1.7076147010 * s_lms;

  // Linear to sRGB gamma
  const f = (x: number) => x > 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;

  const r = Math.max(0, Math.min(255, Math.round(f(r_lin) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(g_lin) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(b_lin) * 255)));

  return A === 1 || isNaN(A) ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${A})`;
};

const replaceOklchInCss = (cssText: string): string => {
  let result = "";
  let i = 0;
  while (i < cssText.length) {
    if (
      cssText.startsWith("oklch(", i) || 
      cssText.startsWith("oklab(", i) || 
      cssText.startsWith("lab(", i) || 
      cssText.startsWith("lch(", i)
    ) {
      const isOklch = cssText.startsWith("oklch(", i);
      const isOklab = cssText.startsWith("oklab(", i);
      const isLab = cssText.startsWith("lab(", i);
      const isLch = cssText.startsWith("lch(", i);
      
      if (isOklch || isOklab) i += 6;
      else i += 4;

      let parenCount = 1;
      const contentStart = i;
      while (i < cssText.length && parenCount > 0) {
        if (cssText[i] === "(") parenCount++;
        else if (cssText[i] === ")") parenCount--;
        i++;
      }
      const contentEnd = i - 1;
      const functionContent = cssText.substring(contentStart, contentEnd);

      const parts = functionContent.trim().split(/[\s/]+/);
      const l = parts[0];

      if (isOklch) {
        try {
          if (parts.length >= 3) {
            const c = parts[1];
            const h = parts[2];
            const a = parts[3] !== undefined ? parts[3] : "1";
            const rgbVal = oklchToRgb(l, c, h, a);
            result += rgbVal;
            continue;
          }
        } catch {
          // fallback
        }
      } else if (isOklab) {
        try {
          if (parts.length >= 3) {
            const aCoord = parts[1];
            const bCoord = parts[2];
            const a = parts[3] !== undefined ? parts[3] : "1";
            const rgbVal = oklabToRgb(l, aCoord, bCoord, a);
            result += rgbVal;
            continue;
          }
        } catch {
          // fallback
        }
      }

      // Lightness-based dynamic fallback
      try {
        let L = 0.5;
        if (l.endsWith("%")) {
          L = parseFloat(l) / 100;
        } else {
          const val = parseFloat(l);
          L = (isOklch || isOklab) ? val : val / 100;
        }
        if (isNaN(L)) L = 0.5;
        // Dark colors mapped to slate/dark gray, light colors to light gray
        const rgbVal = L < 0.55 ? "rgb(31, 41, 55)" : "rgb(243, 244, 246)";
        result += rgbVal;
      } catch {
        result += "rgb(243, 244, 246)";
      }
    } else {
      result += cssText[i];
      i++;
    }
  }
  return result;
};

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
  const [logoAgence, setLogoAgence] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("webixo_agency_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            if (parsed.nomAgence) setCompanyName(parsed.nomAgence);
            if (parsed.adresseAgence) setCompanyAddress(parsed.adresseAgence);
            if (parsed.emailAgence) setCompanyEmail(parsed.emailAgence);
            if (parsed.telAgence) setCompanyPhone(parsed.telAgence);
            if (parsed.websiteAgence) setCompanyWebsite(parsed.websiteAgence);
            if (parsed.logoAgence) setLogoAgence(parsed.logoAgence);
          }, 0);
        } catch (e) {
          console.error("Failed to load agency settings in invoice page:", e);
        }
      }
    }
  }, []);

  // 2. Détails Client
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  
  // Client résolu automatiquement depuis la base relationnelle
  // Synchronize client local state when selected client changes
  useEffect(() => {
    const client = clients.find((c) => c.id === selectedClientId);
    setTimeout(() => {
      if (client) {
        setClientName(client.nom_entreprise);
        setClientContact(client.nom_contact);
        setClientEmail(client.email);
        setClientAddress(client.adresse);
      } else {
        setClientName("");
        setClientContact("");
        setClientEmail("");
        setClientAddress("");
      }
    }, 0);
  }, [selectedClientId, clients]);

  // 3. Détails Facture (Projet et Dates)
  const [projectName, setProjectName] = useState("Développement Plateforme Web");
  const [invoiceNumber] = useState(() => `FC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issuedDate, setIssuedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return future.toISOString().split("T")[0];
  });
  
  // Articles / Services multiples
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "Conception UI/UX & Prototypes", units: 1, price: 250000 },
    { id: "2", description: "Développement Next.js / Tailwind CSS", units: 1, price: 350000 },
  ]);

  // Note: invoiceNumber, issuedDate, and dueDate are now initialized lazily in useState.

  // Erreurs de formulaire
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ==========================================
  // CALCULS FINANCIERS DE LA FACTURE DYNAMIQUE
  // ==========================================
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.price * item.units, 0);
  }, [lineItems]);

  const tvaRate = 0.0; // TVA désactivée sur la facture
  const tvaAmount = useMemo(() => {
    return Math.round(subtotal * tvaRate);
  }, [subtotal, tvaRate]);

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
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
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
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
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
            // Mock getComputedStyle on the cloned window to prevent html2canvas color parse errors
            const win = clonedDoc.defaultView;
            if (win) {
              const originalGetComputedStyle = win.getComputedStyle;
              win.getComputedStyle = function(element, pseudoElement) {
                const style = originalGetComputedStyle.call(win, element, pseudoElement);
                return new Proxy(style, {
                  get(target, prop) {
                    if (prop === "getPropertyValue") {
                      return function(propertyName: string) {
                        const val = target.getPropertyValue(propertyName);
                        if (
                          val && 
                          (val.includes("oklch") || 
                           val.includes("oklab") || 
                           val.includes("lab") || 
                           val.includes("lch"))
                        ) {
                          return replaceOklchInCss(val);
                        }
                        return val;
                      };
                    }
                    const value = Reflect.get(target, prop);
                    if (typeof value === "string") {
                      if (
                        value.includes("oklch") || 
                        value.includes("oklab") || 
                        value.includes("lab") || 
                        value.includes("lch")
                      ) {
                        return replaceOklchInCss(value);
                      }
                    }
                    if (typeof value === "function") {
                      return value.bind(target);
                    }
                    return value;
                  }
                });
              };
            }

            // Retrieve all styles synchronously from document.styleSheets
            const cssRulesList: string[] = [];
            try {
              for (let i = 0; i < document.styleSheets.length; i++) {
                const sheet = document.styleSheets[i];
                try {
                  const rules = sheet.cssRules || sheet.rules;
                  if (rules) {
                    for (let j = 0; j < rules.length; j++) {
                      try {
                        const rule = rules[j];
                        if (rule && typeof rule.cssText === "string") {
                          cssRulesList.push(rule.cssText);
                        }
                      } catch {
                        // ignore bad rules
                      }
                    }
                  }
                } catch {
                  // Ignore cross-origin issues for CDN scripts (dev server stylesheets are fine)
                }
              }
            } catch (e) {
              console.error("Error reading styleSheets:", e);
            }

            const cssText = cssRulesList.join("\n");
            const convertedCss = replaceOklchInCss(cssText);

            // Clean up old styles
            clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((el) => el.remove());

            // Inject the new single preprocessed style tag
            const styleTag = clonedDoc.createElement("style");
            styleTag.textContent = convertedCss;
            clonedDoc.head.appendChild(styleTag);
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
    if (!clientName || !clientEmail) {
      showToast("info", "Veuillez sélectionner un client pour définir l'adresse email.");
      return;
    }
    const subject = encodeURIComponent(`Facture ${invoiceNumber} - ${companyName}`);
    const body = encodeURIComponent(
      `Bonjour ${clientContact},\n\nVeuillez trouver ci-joint la facture ${invoiceNumber} concernant le projet "${projectName}" d'un montant de ${formatCFA(totalAmount)}.\n\nCordialement,\n${companyName}`
    );
    window.location.assign(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
    showToast("success", `Ouverture de votre messagerie pour ${clientEmail}`);
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
                  Remplissez les détails à gauche. La facture à droite s&apos;ajuste instantanément en temps réel !
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

                    <div className="space-y-4 border-t border-slate-200 pt-4 mt-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Détails du destinataire</span>
                      <Input
                        label="Nom de l'entreprise"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                      <Input
                        label="Nom du contact"
                        value={clientContact}
                        onChange={(e) => setClientContact(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Adresse email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                        />
                        <Input
                          label="Adresse postale"
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                        />
                      </div>
                    </div>
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

                      {lineItems.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-slate-200 bg-white rounded-xl text-slate-400 text-xs font-semibold">
                          Aucun service défini. Veuillez cliquer sur &quot;Ajouter un service&quot;.
                        </div>
                      )}
                      {lineItems.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 relative shadow-sm">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service / Prestation</span>
                            <button 
                              type="button"
                              onClick={() => removeLineItem(item.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl transition-all border border-red-100/50 hover:border-red-200 flex items-center justify-center cursor-pointer shadow-xs animate-in fade-in duration-205"
                              title="Supprimer ce service"
                            >
                              <Trash2 size={14} className="stroke-[2.5]" />
                            </button>
                          </div>
                          
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

              {/* Sections 4 et 5 supprimées */}

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
              <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
                <div className="printable-sheet min-w-[750px] lg:min-w-0 bg-white p-8 sm:p-10 space-y-8 text-black transition-all font-sans shadow-sm">
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {logoAgence ? (
                        <div className="w-28 h-28 flex items-center justify-center select-none shrink-0 bg-white p-2 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logoAgence} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-28 h-28 bg-[#1A1A1A] flex items-center justify-center p-3 select-none shrink-0 rounded-none">
                          <div className="flex items-center gap-2">
                            {/* Icon */}
                            <div className="w-8 h-8 shrink-0">
                              <svg className="w-full h-full text-white" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 30L20 10H25L17 30H12Z" fill="currentColor" />
                                <path d="M19 30L27 10H32L24 30H19Z" fill="currentColor" opacity="0.9" />
                                <path d="M26 30L30 20H35L31 30H26Z" fill="currentColor" opacity="0.8" />
                              </svg>
                            </div>
                            {/* Text */}
                            <div className="flex flex-col text-white">
                              <span className="font-extrabold text-sm tracking-wider leading-none">WEBIXO</span>
                              <span className="font-bold text-[8px] tracking-widest mt-1 opacity-70 leading-none">AGENCY</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold tracking-tight text-black font-sans">
                        FACTURE - {invoiceNumber.replace("FC-", "")}
                      </h2>
                      <div className="text-xs text-black mt-2 font-medium">Date de facturation: {formatDateWithDots(issuedDate)}</div>
                      <div className="text-xs text-black mt-1 font-medium">Échéance: {formatDateWithDots(dueDate)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-xs font-sans mt-8">
                    <div className="space-y-1">
                      <span className="font-bold text-black text-sm block">{companyName}</span>
                      <span className="text-black block leading-relaxed">{companyAddress}</span>
                      <span className="text-black font-semibold block">{companyWebsite}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-black uppercase tracking-wider block">{clientName || "CLIENT"}</span>
                      {clientAddress && <span className="text-black block leading-relaxed">{clientAddress}</span>}
                      {clientContact && <span className="text-black font-medium block">Contact : {clientContact}</span>}
                      {clientEmail && <span className="text-black font-medium block">{clientEmail}</span>}
                    </div>
                  </div>

                  <div className="text-xs text-black font-sans leading-relaxed mt-6">
                    Voici la facture du projet : <strong className="text-black font-bold">{projectName || "—"}</strong>
                  </div>

                  {/* Tableau des prestations */}
                  <div className="space-y-4">
                    <table className="w-full text-xs text-left font-sans mt-4 border-collapse border-b border-black">
                      <thead>
                        <tr className="bg-slate-100 text-black text-xs font-semibold border-b border-black">
                          <th className="py-2 px-3 font-semibold">Description</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Date</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Qté</th>
                          <th className="py-2.5 px-3 text-center font-semibold">Unité</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Prix unitaire</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="font-semibold text-black">
                        {lineItems.map((item) => (
                          <tr key={item.id} className="text-black">
                            <td className="py-2.5 px-3 font-medium">{item.description}</td>
                            <td className="py-2.5 px-3 text-center text-black font-medium">
                              {formatDateWithDots(issuedDate)}
                            </td>
                            <td className="py-2.5 px-3 text-center text-black font-medium">
                              {item.units.toFixed(2).replace(".", ",")}
                            </td>
                            <td className="py-2.5 px-3 text-center text-black font-medium">h</td>
                            <td className="py-2.5 px-3 text-right font-medium">{formatNumberWithSpaces(item.price)}<span className="ml-1">FCFA</span></td>
                            <td className="py-2.5 px-3 text-right font-bold text-black">{formatNumberWithSpaces(item.price * item.units)}<span className="ml-1">FCFA</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end pt-4 font-sans">
                      <div className="w-64 text-xs space-y-2 font-semibold">
                        <div className="flex justify-between text-black font-semibold pb-1.5">
                          <span>Total HT</span>
                          <span className="text-black font-bold">{formatNumberWithSpaces(subtotal)}<span className="ml-1">FCFA</span></span>
                        </div>
                        <div className="flex justify-between text-black pt-2 text-sm font-bold border-t border-black">
                          <span>Total TTC</span>
                          <span className="text-black text-sm font-extrabold">{formatNumberWithSpaces(totalAmount)}<span className="ml-1">FCFA</span></span>
                        </div>
                      </div>
                    </div>
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Chiffre d&apos;Affaires</span>
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
                    <TableHeadCell>Date d&apos;émission</TableHeadCell>
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