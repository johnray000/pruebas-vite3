import { createClient } from "@supabase/supabase-js";
import { normalizarUrlSupabase } from "./supabaseUrl";

// Estas dos variables son PÚBLICAS a propósito: la clave publishable solo
// permite leer, porque la tabla tiene Row Level Security.
// Nunca pongas acá la clave secreta.
const url = normalizarUrlSupabase(import.meta.env.VITE_SUPABASE_URL);
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

if (!url || !key) {
  console.error("Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY.");
}

export const supabase = createClient(url ?? "https://invalido.supabase.co", key || "falta-clave", {
  auth: { persistSession: false },
});
