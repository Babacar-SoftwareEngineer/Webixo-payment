"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Bell, 
  CreditCard, 
  Save, 
  CheckCircle2, 
  Mail, 
  Phone,
  Lock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ParametresPage() {
  // Onglet actif
  const [activeTab, setActiveTab] = useState<"profil" | "notifications" | "paiements">("profil");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Profil Agence
  const [nomAgence, setNomAgence] = useState("Webixo Agency S.A.S");
  const [telAgence, setTelAgence] = useState("+221 33 800 00 00");
  const [emailAgence, setEmailAgence] = useState("contact@webixo.sn");
  const [adresseAgence, setAdresseAgence] = useState("Rue des Almadies, Dakar, Sénégal");
  const [websiteAgence, setWebsiteAgence] = useState("webixo-agency.com");
  const [logoAgence, setLogoAgence] = useState("");

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("webixo_agency_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            if (parsed.nomAgence) setNomAgence(parsed.nomAgence);
            if (parsed.telAgence) setTelAgence(parsed.telAgence);
            if (parsed.emailAgence) setEmailAgence(parsed.emailAgence);
            if (parsed.adresseAgence) setAdresseAgence(parsed.adresseAgence);
            if (parsed.websiteAgence) setWebsiteAgence(parsed.websiteAgence);
            if (parsed.logoAgence) setLogoAgence(parsed.logoAgence);
          }, 0);
        } catch (e) {
          console.error("Erreur lors de la lecture des paramètres :", e);
        }
      }
    }
  }, []);

  // Notifications
  const [smsRelance, setSmsRelance] = useState(true);
  const [gabaritSms, setGabaritSms] = useState("Bonjour [Client], nous vous informons que la facture [FactureID] de [Montant] CFA émise le [Date] est arrivée à échéance. Merci de régulariser.");
  const [emailRelance, setEmailRelance] = useState(true);
  const [gabaritEmail, setGabaritEmail] = useState("Objet: Relance Facture Impayée - Webixo Payment \n\nBonjour [Client],\n\nVotre facture [FactureID] pour la prestation [Service] d'un montant de [Montant] CFA présente un retard de paiement. Nous vous prions de bien vouloir procéder à son règlement.");

  // Passerelles
  const [stripeKey, setStripeKey] = useState("pk_test_51Nx...s56d");
  const [waveKey, setWaveKey] = useState("wv_live_92a...c01f");
  const [orangeMoneyKey, setOrangeMoneyKey] = useState("om_sec_72b...a92d");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const settings = {
      nomAgence,
      telAgence,
      emailAgence,
      adresseAgence,
      websiteAgence,
      logoAgence
    };

    localStorage.setItem("webixo_agency_settings", JSON.stringify(settings));

    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-[#10B981]" size={20} />
          <span className="text-sm font-semibold">Paramètres sauvegardés avec succès !</span>
        </div>
      )}

      {/* En-tête */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Paramètres de l&apos;agence</h1>
          <p className="text-sm text-slate-400 font-semibold">Configurez l&apos;identité et les services de facturation de votre agence</p>
        </div>
      </header>

      {/* Navigation Onglets */}
      <div className="flex border-b border-slate-100 overflow-x-auto gap-6 select-none">
        <button
          onClick={() => setActiveTab("profil")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "profil"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Building2 size={16} />
          <span>Profil Agence</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "notifications"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Bell size={16} />
          <span>Relances SMS / Email</span>
        </button>

        <button
          onClick={() => setActiveTab("paiements")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "paiements"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <CreditCard size={16} />
          <span>Passerelles de Paiement</span>
        </button>
      </div>

      {/* Formulaire Unique */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Contenu Profil */}
        {activeTab === "profil" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader title="Informations Générales" description="Ces détails s'afficheront sur l'en-tête de vos factures et devis." />
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Nom de l'Agence" 
                      value={nomAgence} 
                      onChange={(e) => setNomAgence(e.target.value)} 
                    />
                    <Input 
                      label="Téléphone Support" 
                      value={telAgence} 
                      onChange={(e) => setTelAgence(e.target.value)} 
                      leftIcon={<Phone size={14} />}
                    />
                  </div>

                  <Input 
                    label="Email Administratif" 
                    value={emailAgence} 
                    onChange={(e) => setEmailAgence(e.target.value)} 
                    leftIcon={<Mail size={14} />}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Adresse du Siège Social" 
                      value={adresseAgence} 
                      onChange={(e) => setAdresseAgence(e.target.value)} 
                    />
                    <Input 
                      label="Site Internet" 
                      value={websiteAgence} 
                      onChange={(e) => setWebsiteAgence(e.target.value)} 
                      leftIcon={<Globe size={14} />}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Logo & Identité" description="Visualiser votre logo de marque." />
                <CardBody className="flex flex-col items-center py-6">
                  <div className="w-24 h-24 rounded-3xl bg-brand-bg border border-brand-light/20 flex items-center justify-center text-brand-primary mb-4 shadow-sm select-none overflow-hidden relative group">
                    {logoAgence ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoAgence} alt="Logo Agence" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Building2 size={36} className="stroke-[2]" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all inline-block text-center shadow-sm hover:shadow">
                    Choisir un logo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLogoAgence(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                  {logoAgence && (
                    <button 
                      type="button"
                      onClick={() => setLogoAgence("")}
                      className="text-danger-primary text-[10px] font-bold mt-2 hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Supprimer le logo
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-semibold mt-3 text-center">Format recommandé : PNG, SVG (250x250px)</span>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Contenu Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
            <Card>
              <CardHeader title="Seuils d'Alertes et Relances SMS" description="twil-w-73-sn Twilio & Wave SMS Gateway" />
              <CardBody className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Relancer par SMS en cas de retard</span>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">Envoi automatique d&apos;un texto à échéance + 2 jours.</span>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setSmsRelance(!smsRelance)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      smsRelance ? "bg-brand-primary" : "bg-slate-200"
                    }`}
                  >
                    <div 
                      className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${
                        smsRelance ? "translate-x-5.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {smsRelance && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gabarit du SMS de Relance</label>
                    <textarea
                      value={gabaritSms}
                      onChange={(e) => setGabaritSms(e.target.value)}
                      rows={3}
                      className="w-full p-4 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Relances de Paiement par Email" description="Configuration SMTP et e-mails de courtoisie" />
              <CardBody className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Activer les rappels d&apos;échéance par Email</span>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">Envoyer un récapitulatif par courriel.</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setEmailRelance(!emailRelance)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      emailRelance ? "bg-brand-primary" : "bg-slate-200"
                    }`}
                  >
                    <div 
                      className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${
                        emailRelance ? "translate-x-5.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {emailRelance && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gabarit de l&apos;Email de Relance</label>
                    <textarea
                      value={gabaritEmail}
                      onChange={(e) => setGabaritEmail(e.target.value)}
                      rows={6}
                      className="w-full p-4 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none font-inter"
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Contenu Moyens de Paiement */}
        {activeTab === "paiements" && (
          <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
            <Card>
              <CardHeader title="Passerelles de Règlement en Ligne" description="Connectez vos comptes de réception de fonds en direct." />
              <CardBody className="space-y-5">
                <Input 
                  label="Wave API Secret Key" 
                  value={waveKey} 
                  onChange={(e) => setWaveKey(e.target.value)} 
                  leftIcon={<Lock size={14} />}
                  type="password"
                />

                <Input 
                  label="Orange Money API Client Secret" 
                  value={orangeMoneyKey} 
                  onChange={(e) => setOrangeMoneyKey(e.target.value)} 
                  leftIcon={<Lock size={14} />}
                  type="password"
                />

                <Input 
                  label="Stripe Publishable Key" 
                  value={stripeKey} 
                  onChange={(e) => setStripeKey(e.target.value)} 
                  leftIcon={<Lock size={14} />}
                  type="password"
                />
              </CardBody>
            </Card>
          </div>
        )}

        {/* Bouton de sauvegarde global */}
        <div className="flex justify-end gap-2 max-w-3xl">
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            leftIcon={<Save size={16} />}
          >
            Sauvegarder les paramètres
          </Button>
        </div>
      </form>
    </div>
  );
}
