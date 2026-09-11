import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// A leitura pública precisa continuar funcionando em ambientes como a Vercel
// mesmo quando somente a chave anon foi configurada. Operações administrativas
// continuam usando a service role quando ela está disponível.
const supabaseServerKey = ENV.supabaseServiceRoleKey || ENV.supabaseAnonKey;

export const supabaseAdmin = createClient(ENV.supabaseUrl, supabaseServerKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
