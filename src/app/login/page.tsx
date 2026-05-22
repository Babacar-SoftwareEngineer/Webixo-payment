"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Mode Inscription (Sign Up)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.user && data.session === null) {
          setSuccessMsg("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
        } else {
          setSuccessMsg("Inscription réussie ! Connexion en cours...");
          router.push("/");
          router.refresh();
        }
      } else {
        // Mode Connexion (Sign In)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg("Connexion réussie ! Redirection...");
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 font-sans relative overflow-hidden">
      {/* Decorative premium gradient circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#046A4E]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#A3D1C6]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative z-10 transition-all duration-300">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#046A4E]/10 text-[#046A4E] font-black text-xl mb-4 shadow-sm">
            W
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Webixo Payment
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            {isSignUp ? "Créez votre compte d'agence web" : "Accédez à votre tableau de bord financier"}
          </p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-600 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Adresse Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="nom@agence.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#046A4E]/20 focus:border-[#046A4E] transition-all placeholder:text-slate-400 disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#046A4E]/20 focus:border-[#046A4E] transition-all placeholder:text-slate-400 disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#046A4E] hover:bg-[#03553e] text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-[0_4px_20px_rgba(4,106,78,0.15)] hover:shadow-[0_4px_25px_rgba(4,106,78,0.25)] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <>
                <span>{isSignUp ? "Créer un compte" : "Se connecter"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6 pt-6 border-t border-slate-50">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            disabled={loading}
            className="text-xs font-bold text-[#046A4E] hover:text-[#03553e] transition-colors focus:outline-none cursor-pointer"
          >
            {isSignUp
              ? "Vous avez déjà un compte ? Connectez-vous"
              : "Nouveau sur Webixo ? Créez un compte d'agence"}
          </button>
        </div>
      </div>
    </div>
  );
}
