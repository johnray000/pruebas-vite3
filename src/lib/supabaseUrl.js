// Acepta la URL del proyecto en varias formas comunes y la deja como
// https://<ref>.supabase.co. Ejemplos aceptados:
//   https://abcd.supabase.co   https://abcd.supabase.co/rest/v1/
//   https://supabase.com/dashboard/project/abcd/settings/api   abcd
// Devuelve null si no reconoce el formato.
export function normalizarUrlSupabase(valor) {
  const v = String(valor ?? "").trim().replace(/^["']|["']$/g, "").toLowerCase();
  const m =
    v.match(/([a-z0-9]{15,40})\.supabase\.(co|in)/) ||
    v.match(/\/project\/([a-z0-9]{15,40})/) ||
    v.match(/^([a-z0-9]{15,40})$/);
  return m ? `https://${m[1]}.supabase.${m[2] === "in" ? "in" : "co"}` : null;
}
