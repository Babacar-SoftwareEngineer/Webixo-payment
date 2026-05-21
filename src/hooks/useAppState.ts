"use client";

import { useState, useEffect } from "react";

// ==========================================
// 1. INTERFACES DU MODÈLE RELATIONNEL DRY
// ==========================================

export interface Client {
  id: string;
  nom_entreprise: string;
  nom_contact: string;
  email: string;
  adresse: string;
  avatarBg: string;
  avatarText: string;
  initials: string;
}

export interface Facture {
  id: string;
  client_id: string;
  service: string;
  montant: number;
  statut_paiement: "Terminé" | "En attente" | "En retard";
  date_emission: string;
  heure_emission: string;
  jours_retard?: number;
}

export interface Devis {
  id: string;
  client_id: string;
  service: string;
  montant: number;
  statut: "Brouillon" | "Envoyé" | "Accepté" | "Refusé";
  date_emission: string;
  date_validite: string;
}

// ==========================================
// 2. DONNÉES PAR DÉFAUT (INITIALES)
// ==========================================

const INITIAL_CLIENTS: Client[] = [
  { id: "c1", nom_entreprise: "Abdoulaye Diallo", nom_contact: "Abdoulaye Diallo", email: "abdoulaye@diallo.com", adresse: "Dakar, Sénégal", avatarBg: "bg-red-50 text-red-500", avatarText: "text-red-600", initials: "Ad" },
  { id: "c2", nom_entreprise: "Volatiana Rakoto", nom_contact: "Volatiana Rakoto", email: "volatiana@rakoto.com", adresse: "Antananarivo, Madagascar", avatarBg: "bg-blue-50 text-blue-500", avatarText: "text-blue-600", initials: "Vo" },
  { id: "c3", nom_entreprise: "Coumba Sarr", nom_contact: "Coumba Sarr", email: "coumba@sarr.com", adresse: "Thies, Sénégal", avatarBg: "bg-purple-50 text-purple-500", avatarText: "text-purple-600", initials: "Co" },
  { id: "c4", nom_entreprise: "CLASS SHOES", nom_contact: "Directeur Class Shoes", email: "contact@classshoes.com", adresse: "Dakar, Plateau", avatarBg: "bg-emerald-50 text-emerald-500", avatarText: "text-emerald-600", initials: "CS" },
  { id: "c5", nom_entreprise: "NDIEYENNE SERVICES", nom_contact: "Ndieyenne Services", email: "info@ndieyenne.sn", adresse: "Saint-Louis, Sénégal", avatarBg: "bg-amber-50 text-amber-500", avatarText: "text-amber-600", initials: "NS" },
];

const INITIAL_FACTURES: Facture[] = [
  { id: "f1", client_id: "c1", service: "Abonnement Cloud", montant: 25500, statut_paiement: "Terminé", date_emission: "17 Avr, 2026", heure_emission: "15:45" },
  { id: "f2", client_id: "c2", service: "Conseil SEO", montant: 1200, statut_paiement: "En attente", date_emission: "16 Avr, 2026", heure_emission: "11:20" },
  { id: "f3", client_id: "c3", service: "Maintenance Site", montant: 4500, statut_paiement: "En retard", date_emission: "15 Avr, 2026", heure_emission: "09:00", jours_retard: 12 },
  { id: "f4", client_id: "c4", service: "Création de Site Web", montant: 400000, statut_paiement: "Terminé", date_emission: "10 Avr, 2026", heure_emission: "14:30" },
  { id: "f5", client_id: "c5", service: "Création de site e-commerce", montant: 350000, statut_paiement: "En attente", date_emission: "08 Avr, 2026", heure_emission: "10:15" },
  { id: "f6", client_id: "c1", service: "Audit Sécurité Web", montant: 100000, statut_paiement: "En retard", date_emission: "15 Mar, 2026", heure_emission: "10:00", jours_retard: 18 },
  { id: "f7", client_id: "c4", service: "Développement Application Mobile", montant: 780000, statut_paiement: "En retard", date_emission: "10 Jan, 2026", heure_emission: "14:00", jours_retard: 78 }
];

const INITIAL_DEVIS: Devis[] = [
  { id: "d1", client_id: "c1", service: "Refonte d'Application Web", montant: 600000, statut: "Accepté", date_emission: "12 Avr, 2026", date_validite: "12 Mai, 2026" },
  { id: "d2", client_id: "c2", service: "Optimisation de Performance Cloud", montant: 350000, statut: "Envoyé", date_emission: "18 Avr, 2026", date_validite: "18 Mai, 2026" },
  { id: "d3", client_id: "c3", service: "Audit de Sécurité Système", montant: 150000, statut: "Brouillon", date_emission: "20 Avr, 2026", date_validite: "20 Mai, 2026" },
  { id: "d4", client_id: "c4", service: "Création Campagne Google Ads", montant: 250000, statut: "Refusé", date_emission: "05 Avr, 2026", date_validite: "05 Mai, 2026" }
];

// ==========================================
// 3. HOOK D'ÉTAT DE L'APPLICATION
// ==========================================

export function useAppState() {
  const [clients, setClients] = useState<Client[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données depuis le localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedClients = localStorage.getItem("webixo_clients");
      const storedFactures = localStorage.getItem("webixo_factures");
      const storedDevis = localStorage.getItem("webixo_devis");

      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(INITIAL_CLIENTS);
        localStorage.setItem("webixo_clients", JSON.stringify(INITIAL_CLIENTS));
      }

      if (storedFactures) {
        setFactures(JSON.parse(storedFactures));
      } else {
        setFactures(INITIAL_FACTURES);
        localStorage.setItem("webixo_factures", JSON.stringify(INITIAL_FACTURES));
      }

      if (storedDevis) {
        setDevis(JSON.parse(storedDevis));
      } else {
        setDevis(INITIAL_DEVIS);
        localStorage.setItem("webixo_devis", JSON.stringify(INITIAL_DEVIS));
      }

      setIsLoaded(true);
    }
  }, []);

  // Fonctions d'écriture persistantes
  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem("webixo_clients", JSON.stringify(newClients));
  };

  const saveFactures = (newFactures: Facture[]) => {
    setFactures(newFactures);
    localStorage.setItem("webixo_factures", JSON.stringify(newFactures));
  };

  const saveDevis = (newDevis: Devis[]) => {
    setDevis(newDevis);
    localStorage.setItem("webixo_devis", JSON.stringify(newDevis));
  };

  // Actions Clients
  const addClient = (client: Omit<Client, "id" | "avatarBg" | "avatarText" | "initials">) => {
    const randomColors = [
      { bg: "bg-red-50 text-red-500", text: "text-red-600" },
      { bg: "bg-blue-50 text-blue-500", text: "text-blue-600" },
      { bg: "bg-purple-50 text-purple-500", text: "text-purple-600" },
      { bg: "bg-emerald-50 text-emerald-500", text: "text-emerald-600" },
      { bg: "bg-amber-50 text-amber-500", text: "text-amber-600" },
      { bg: "bg-indigo-50 text-indigo-500", text: "text-indigo-600" },
    ];
    const color = randomColors[Math.floor(Math.random() * randomColors.length)];
    const initials = client.nom_entreprise
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const newClient: Client = {
      ...client,
      id: `c_${Date.now()}`,
      avatarBg: color.bg,
      avatarText: color.text,
      initials: initials || "??"
    };

    saveClients([...clients, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updatedFields: Partial<Omit<Client, "id" | "avatarBg" | "avatarText" | "initials">>) => {
    const updated = clients.map((c) => {
      if (c.id === id) {
        let initials = c.initials;
        if (updatedFields.nom_entreprise) {
          initials = updatedFields.nom_entreprise
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "??";
        }
        return {
          ...c,
          ...updatedFields,
          initials
        };
      }
      return c;
    });
    saveClients(updated);
  };

  // Actions Factures
  const addFacture = (facture: Omit<Facture, "id" | "date_emission" | "heure_emission">) => {
    const now = new Date();
    const formatterDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    const formattedDate = formatterDate.format(now);
    const formattedTime = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    const newFacture: Facture = {
      ...facture,
      id: `f_${Date.now()}`,
      date_emission: formattedDate,
      heure_emission: formattedTime
    };

    saveFactures([...factures, newFacture]);
    return newFacture;
  };

  const updateFactureStatut = (id: string, statut: "Terminé" | "En attente" | "En retard") => {
    const updated = factures.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          statut_paiement: statut,
          jours_retard: statut === "En retard" ? 1 : undefined
        };
      }
      return f;
    });
    saveFactures(updated);
  };

  // Actions Devis
  const addDevis = (dev: Omit<Devis, "id" | "date_emission">) => {
    const now = new Date();
    const formatterDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    const formattedDate = formatterDate.format(now);

    const newDevis: Devis = {
      ...dev,
      id: `d_${Date.now()}`,
      date_emission: formattedDate
    };

    saveDevis([...devis, newDevis]);
    return newDevis;
  };

  const updateDevisStatut = (id: string, statut: "Brouillon" | "Envoyé" | "Accepté" | "Refusé") => {
    const updated = devis.map((d) => {
      if (d.id === id) {
        return { ...d, statut };
      }
      return d;
    });
    saveDevis(updated);
  };

  // Convertir un Devis en Facture
  const convertDevisToFacture = (devisId: string) => {
    const dev = devis.find((d) => d.id === devisId);
    if (!dev) return null;

    // Ajouter la facture
    const fact = addFacture({
      client_id: dev.client_id,
      service: dev.service,
      montant: dev.montant,
      statut_paiement: "En attente"
    });

    // Mettre à jour le statut du devis
    updateDevisStatut(devisId, "Accepté");

    return fact;
  };

  return {
    clients,
    factures,
    devis,
    isLoaded,
    addClient,
    updateClient,
    addFacture,
    updateFactureStatut,
    addDevis,
    updateDevisStatut,
    convertDevisToFacture
  };
}
