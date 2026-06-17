import { createBrowserClient } from "@supabase/ssr";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si nous sommes côté serveur (lors du build / pré-rendu Next.js) et que les clés sont absentes,
  // on utilise des valeurs de secours pour empêcher Next.js de faire échouer la compilation.
  if (typeof window === "undefined" && (!url || !anonKey)) {
    return createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    );
  }

  // Dans le navigateur, on s'assure d'avoir une instance unique (pattern Singleton)
  if (!clientInstance) {
    if (!url || !anonKey) {
      throw new Error(
        "Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont manquantes."
      );
    }
    clientInstance = createBrowserClient(url, anonKey);
  }

  return clientInstance;
}

