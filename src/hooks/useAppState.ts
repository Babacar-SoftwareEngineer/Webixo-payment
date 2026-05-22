"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
// 2. HELPERS DE CONVERSION DE DATE
// ==========================================

const formatToFrenchDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return `${day} ${months[month]}, ${year}`;
  }
  return dateStr;
};

const parseFrenchDateToISO = (dateStr: string) => {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  if (dateStr.includes("-")) {
    return dateStr;
  }
  const cleaned = dateStr.toLowerCase().replace(",", "");
  const parts = cleaned.split(" ");
  if (parts.length < 3) return new Date().toISOString().split("T")[0];
  
  const day = parts[0].padStart(2, "0");
  const monthStr = parts[1];
  const year = parts[2];
  
  const months = ["jan", "fév", "mar", "avr", "mai", "jui", "aoû", "sep", "oct", "nov", "déc"];
  const monthsLong = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
  
  let monthIdx = 0;
  for (let i = 0; i < 12; i++) {
    if (monthStr.startsWith(months[i]) || monthStr.startsWith(monthsLong[i])) {
      monthIdx = i;
      break;
    }
  }
  
  const month = (monthIdx + 1).toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ==========================================
// 3. HOOK D'ÉTAT DE L'APPLICATION
// ==========================================

export function useAppState() {
  const supabase = createClient();

  const [clients, setClients] = useState<Client[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données depuis Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoaded(true);
          return;
        }

        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("Client")
          .select("*");
        if (clientsError) throw clientsError;

        // Fetch factures
        const { data: facturesData, error: facturesError } = await supabase
          .from("Facture")
          .select("*");
        if (facturesError) throw facturesError;

        // Fetch devis
        const { data: devisData, error: devisError } = await supabase
          .from("Devis")
          .select("*");
        if (devisError) throw devisError;

        // Map database records to camelCase and format dates
        setClients(
          (clientsData || []).map((c: any) => ({
            id: c.id,
            nom_entreprise: c.nom_entreprise,
            nom_contact: c.nom_contact || "",
            email: c.email,
            adresse: c.adresse || "",
            avatarBg: c.avatar_bg || "bg-slate-100 text-slate-500",
            avatarText: c.avatar_text || "text-slate-500",
            initials: c.initials,
          }))
        );

        setFactures(
          (facturesData || []).map((f: any) => ({
            id: f.id,
            client_id: f.client_id,
            service: f.service,
            montant: Number(f.montant),
            statut_paiement: f.statut_paiement as any,
            date_emission: formatToFrenchDate(f.date_emission),
            heure_emission: f.heure_emission.substring(0, 5),
            jours_retard: f.jours_retard || undefined,
          }))
        );

        setDevis(
          (devisData || []).map((d: any) => ({
            id: d.id,
            client_id: d.client_id,
            service: d.service,
            montant: Number(d.montant),
            statut: d.statut as any,
            date_emission: formatToFrenchDate(d.date_emission),
            date_validite: formatToFrenchDate(d.date_validite),
          }))
        );
      } catch (error) {
        console.error("Error loading Supabase data:", error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // Actions Clients
  const addClient = async (client: Omit<Client, "id" | "avatarBg" | "avatarText" | "initials">) => {
    try {
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
        .toUpperCase() || "??";

      const { data, error } = await supabase
        .from("Client")
        .insert({
          nom_entreprise: client.nom_entreprise,
          nom_contact: client.nom_contact,
          email: client.email,
          adresse: client.adresse,
          avatar_bg: color.bg,
          avatar_text: color.text,
          initials: initials,
        })
        .select()
        .single();

      if (error) throw error;

      const newClient: Client = {
        id: data.id,
        nom_entreprise: data.nom_entreprise,
        nom_contact: data.nom_contact || "",
        email: data.email,
        adresse: data.adresse || "",
        avatarBg: data.avatar_bg || "bg-slate-100 text-slate-500",
        avatarText: data.avatar_text || "text-slate-500",
        initials: data.initials,
      };

      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  };

  const updateClient = async (
    id: string,
    updatedFields: Partial<Omit<Client, "id" | "avatarBg" | "avatarText" | "initials">>
  ) => {
    try {
      let initials: string | undefined;
      if (updatedFields.nom_entreprise) {
        initials = updatedFields.nom_entreprise
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase() || "??";
      }

      const updatePayload: any = {
        nom_entreprise: updatedFields.nom_entreprise,
        nom_contact: updatedFields.nom_contact,
        email: updatedFields.email,
        adresse: updatedFields.adresse,
      };
      if (initials) {
        updatePayload.initials = initials;
      }

      const { data, error } = await supabase
        .from("Client")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                nom_entreprise: data.nom_entreprise,
                nom_contact: data.nom_contact || "",
                email: data.email,
                adresse: data.adresse || "",
                initials: data.initials,
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  };

  // Actions Factures
  const addFacture = async (facture: Omit<Facture, "id" | "date_emission" | "heure_emission">) => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(" ")[0]; // HH:MM:SS

      const { data, error } = await supabase
        .from("Facture")
        .insert({
          client_id: facture.client_id,
          service: facture.service,
          montant: facture.montant,
          statut_paiement: facture.statut_paiement,
          date_emission: dateStr,
          heure_emission: timeStr,
        })
        .select()
        .single();

      if (error) throw error;

      const newFacture: Facture = {
        id: data.id,
        client_id: data.client_id,
        service: data.service,
        montant: Number(data.montant),
        statut_paiement: data.statut_paiement as any,
        date_emission: formatToFrenchDate(data.date_emission),
        heure_emission: data.heure_emission.substring(0, 5),
        jours_retard: data.jours_retard || undefined,
      };

      setFactures((prev) => [...prev, newFacture]);
      return newFacture;
    } catch (error) {
      console.error("Error adding facture:", error);
      throw error;
    }
  };

  const updateFactureStatut = async (id: string, statut: "Terminé" | "En attente" | "En retard") => {
    try {
      const { data, error } = await supabase
        .from("Facture")
        .update({
          statut_paiement: statut,
          jours_retard: statut === "En retard" ? 1 : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setFactures((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                statut_paiement: data.statut_paiement as any,
                jours_retard: data.jours_retard || undefined,
              }
            : f
        )
      );
    } catch (error) {
      console.error("Error updating facture status:", error);
      throw error;
    }
  };

  // Actions Devis
  const addDevis = async (dev: Omit<Devis, "id" | "date_emission">) => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const validityIso = parseFrenchDateToISO(dev.date_validite);

      const { data, error } = await supabase
        .from("Devis")
        .insert({
          client_id: dev.client_id,
          service: dev.service,
          montant: dev.montant,
          statut: dev.statut,
          date_emission: dateStr,
          date_validite: validityIso,
        })
        .select()
        .single();

      if (error) throw error;

      const newDevis: Devis = {
        id: data.id,
        client_id: data.client_id,
        service: data.service,
        montant: Number(data.montant),
        statut: data.statut as any,
        date_emission: formatToFrenchDate(data.date_emission),
        date_validite: formatToFrenchDate(data.date_validite),
      };

      setDevis((prev) => [...prev, newDevis]);
      return newDevis;
    } catch (error) {
      console.error("Error adding devis:", error);
      throw error;
    }
  };

  const updateDevisStatut = async (id: string, statut: "Brouillon" | "Envoyé" | "Accepté" | "Refusé") => {
    try {
      const { data, error } = await supabase
        .from("Devis")
        .update({ statut })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setDevis((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                statut: data.statut as any,
              }
            : d
        )
      );
    } catch (error) {
      console.error("Error updating devis status:", error);
      throw error;
    }
  };

  // Convertir un Devis en Facture
  const convertDevisToFacture = async (devisId: string) => {
    try {
      const dev = devis.find((d) => d.id === devisId);
      if (!dev) return null;

      // Ajouter la facture correspondante
      const fact = await addFacture({
        client_id: dev.client_id,
        service: dev.service,
        montant: dev.montant,
        statut_paiement: "En attente",
      });

      // Mettre à jour le statut du devis en "Accepté"
      await updateDevisStatut(devisId, "Accepté");

      return fact;
    } catch (error) {
      console.error("Error converting devis to facture:", error);
      throw error;
    }
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
    convertDevisToFacture,
  };
}
