import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const noopStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

function createStubClient() {
  const emptySession = { session: null, user: null };
  const stubSubscription = {
    subscription: {
      unsubscribe: () => {},
    },
  };

  return {
    auth: {
      getSession: () => Promise.resolve({ data: emptySession, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: emptySession, error: new Error("Modo offline: variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes no .env") }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (_callback: unknown) => stubSubscription,
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error("Modo offline: Supabase Storage não configurado.") }),
        createSignedUrl: () => Promise.resolve({ data: null, error: new Error("Modo offline: Storage não configurado.") }),
        list: () => Promise.resolve({ data: null, error: new Error("Modo offline: Storage não configurado.") }),
        remove: () => Promise.resolve({ data: null, error: new Error("Modo offline: Storage não configurado.") }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error("Modo offline: Supabase não configurado.") }),
      insert: () => Promise.resolve({ data: null, error: new Error("Modo offline: Supabase não configurado.") }),
      update: () => Promise.resolve({ data: null, error: new Error("Modo offline: Supabase não configurado.") }),
      delete: () => Promise.resolve({ data: null, error: new Error("Modo offline: Supabase não configurado.") }),
    }),
    _noop: true,
  } as unknown as ReturnType<typeof createClient> & { _noop?: boolean };
}

function createRealClient() {
  try {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : (noopStorage as any),
      },
    });
  } catch (e) {
    console.warn("[supabase] Falha ao criar cliente Supabase, usando stub (modo offline):", e);
    return createStubClient();
  }
}

export const supabase = supabaseUrl && supabaseAnonKey ? createRealClient() : createStubClient();
