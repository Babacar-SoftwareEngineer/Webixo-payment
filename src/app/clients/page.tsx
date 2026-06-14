"use client";

import { useState, useMemo } from "react";
import { Plus, Search, User, Mail, MapPin, X, RefreshCw } from "lucide-react";
import { useAppState, Client } from "@/hooks/useAppState";
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

export default function ClientsPage() {
  const { clients, factures, addClient, updateClient, isLoaded } = useAppState();
  
  // États de recherche et modale
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // États du formulaire
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [nomContact, setNomContact] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleCreateClick = () => {
    setEditingClient(null);
    setNomEntreprise("");
    setNomContact("");
    setEmail("");
    setAdresse("");
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setNomEntreprise(client.nom_entreprise);
    setNomContact(client.nom_contact);
    setEmail(client.email);
    setAdresse(client.adresse);
    setFormErrors({});
    setShowAddModal(true);
  };

  // Filtrage des clients en fonction de la recherche
  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.nom_entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nom_contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Calcul des statistiques des clients (DRY)
  const statsClients = useMemo(() => {
    const total = clients.length;
    
    // CA cumulé par client (factures terminées ou en attente)
    const mapCA = new Map<string, number>();
    factures.forEach((f) => {
      if (f.statut_paiement !== "En retard") {
        const current = mapCA.get(f.client_id) || 0;
        mapCA.set(f.client_id, current + f.montant);
      }
    });

    // Un client est actif s'il a au moins une facture émise
    const activeClientsCount = clients.filter((c) => 
      factures.some((f) => f.client_id === c.id)
    ).length;

    return {
      total,
      activeCount: activeClientsCount,
      mapCA
    };
  }, [clients, factures]);

  // Validation et soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!nomEntreprise.trim()) errors.nomEntreprise = "Le nom de l'entreprise est obligatoire.";
    if (!nomContact.trim()) errors.nomContact = "Le nom du contact est obligatoire.";
    if (!email.trim()) {
      errors.email = "L'adresse email est obligatoire.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "L'adresse email est invalide.";
    }
    if (!adresse.trim()) errors.adresse = "L'adresse de facturation est obligatoire.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Ajouter ou modifier le client
    if (editingClient) {
      updateClient(editingClient.id, {
        nom_entreprise: nomEntreprise,
        nom_contact: nomContact,
        email,
        adresse
      });
    } else {
      addClient({
        nom_entreprise: nomEntreprise,
        nom_contact: nomContact,
        email,
        adresse
      });
    }

    // Réinitialiser les états
    setNomEntreprise("");
    setNomContact("");
    setEmail("");
    setAdresse("");
    setFormErrors({});
    setEditingClient(null);
    setShowAddModal(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des clients</h1>
          <p className="text-sm text-slate-400 font-semibold">Répertoire et suivi de l&apos;activité commerciale</p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Plus size={16} />}
          onClick={handleCreateClick}
          className="self-start sm:self-center"
        >
          Nouveau Client
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Clients</span>
          <span className="text-2xl font-black text-slate-900">{statsClients.total}</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Clients Actifs</span>
          <span className="text-2xl font-black text-brand-primary">{statsClients.activeCount}</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Moyenne CA / Client</span>
          <span className="text-2xl font-black text-slate-900">
            {statsClients.total > 0 
              ? formatCFA(Array.from(statsClients.mapCA.values()).reduce((a, b) => a + b, 0) / statsClients.total)
              : "0 CFA"}
          </span>
        </Card>
      </div>

      {/* Barre de Recherche et Liste */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input 
            placeholder="Rechercher un client (Nom, Contact, Email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
            containerClassName="w-full sm:max-w-md"
          />
        </div>

        {/* Tableau */}
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell>Entreprise / Client</TableHeadCell>
                <TableHeadCell>Contact Principal</TableHeadCell>
                <TableHeadCell>Adresse</TableHeadCell>
                <TableHeadCell>Volume de Facturation</TableHeadCell>
                <TableHeadCell>Statut</TableHeadCell>
                <TableHeadCell className="text-right">Actions</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                    Aucun client trouvé pour cette recherche.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => {
                  const clientCA = statsClients.mapCA.get(client.id) || 0;
                  const hasFactures = factures.some((f) => f.client_id === client.id);
                  
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${client.avatarBg} flex items-center justify-center font-bold text-xs select-none`}>
                            {client.initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{client.nom_entreprise}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">{client.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.nom_contact}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{client.adresse}</TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {formatCFA(clientCA)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={hasFactures ? "success" : "neutral"}>
                          {hasFactures ? "Actif" : "Prospect"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditClick(client)}
                        >
                          Modifier
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* MODAL AJOUT CLIENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop avec flou */}
          <div 
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
          />
          
          {/* Contenu Modal */}
          <div className="bg-white border border-slate-100/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Bouton de Fermeture */}
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            <header className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {editingClient ? "Modifier le client" : "Ajouter un nouveau client"}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {editingClient ? "Modifiez ses coordonnées de facturation." : "Enregistrez ses coordonnées de facturation."}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nom de l'entreprise"
                placeholder="Ex. Webixo S.A.S"
                value={nomEntreprise}
                onChange={(e) => {
                  setNomEntreprise(e.target.value);
                  if (e.target.value) setFormErrors((prev) => ({ ...prev, nomEntreprise: "" }));
                }}
                error={formErrors.nomEntreprise}
                leftIcon={<User size={16} />}
              />

              <Input
                label="Nom du contact principal"
                placeholder="Ex. Fatou Sow"
                value={nomContact}
                onChange={(e) => {
                  setNomContact(e.target.value);
                  if (e.target.value) setFormErrors((prev) => ({ ...prev, nomContact: "" }));
                }}
                error={formErrors.nomContact}
                leftIcon={<User size={16} />}
              />

              <Input
                label="Adresse email"
                type="email"
                placeholder="Ex. fatou@webixo.sn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value) setFormErrors((prev) => ({ ...prev, email: "" }));
                }}
                error={formErrors.email}
                leftIcon={<Mail size={16} />}
              />

              <Input
                label="Adresse de facturation"
                placeholder="Ex. Almadies, Dakar, Sénégal"
                value={adresse}
                onChange={(e) => {
                  setAdresse(e.target.value);
                  if (e.target.value) setFormErrors((prev) => ({ ...prev, adresse: "" }));
                }}
                error={formErrors.adresse}
                leftIcon={<MapPin size={16} />}
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {editingClient ? "Mettre à jour" : "Enregistrer Client"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}