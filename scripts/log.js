import { normalizarUrlSupabase } from "../src/lib/supabaseUrl.js";

// En GitHub Actions, "::error::" hace que el mensaje aparezca destacado
// en el resumen del workflow (sin tener que abrir el log).
export function error(...partes) {
  const msg = partes
    .map((p) => (p instanceof Error ? p.message : typeof p === "string" ? p : JSON.stringify(p)))
    .join(" ");
  if (process.env.GITHUB_ACTIONS) console.log(`::error::${msg}`);
  else console.error(msg);
}

// Revisa las variables sin mostrar sus valores.
export function revisarEntorno(nombres) {
  const faltan = nombres.filter((n) => !process.env[n]?.trim());
  if (faltan.length) {
    error(`Faltan (o están vacías): ${faltan.join(", ")}. Revisá Settings → Secrets and variables → Actions.`);
    process.exit(1);
  }
  for (const n of nombres.filter((n) => n.endsWith("_URL"))) {
    const original = process.env[n].trim();
    const normal = normalizarUrlSupabase(original);
    if (!normal) {
      error(
        `${n} no parece una URL de Supabase (largo ${original.length}, ` +
          `${original.includes("supabase") ? "contiene" : "NO contiene"} "supabase"). ` +
          `Debería ser https://xxxxx.supabase.co — la ves en Supabase → Project Settings → Data API.`
      );
      process.exit(1);
    }
    if (normal !== original) console.log(`${n}: se corrigió el formato automáticamente.`);
    process.env[n] = normal;
  }
}
