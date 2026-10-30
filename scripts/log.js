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
    const v = process.env[n].trim();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(v)) {
      error(`${n} no tiene la forma https://xxxxx.supabase.co (sin nada después de .co). Revisala.`);
      process.exit(1);
    }
  }
}
