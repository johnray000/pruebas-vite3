import { createClient } from "@supabase/supabase-js";

// Estas dos variables son PÚBLICAS a propósito: la clave publishable (o "anon")
// solo permite leer, porque la tabla tiene Row Level Security.
// Nunca pongas acá la clave secreta.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } }
);
