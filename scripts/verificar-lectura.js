// Verifica que la web pueda leer la BD con la clave PÚBLICA (como lo hará el navegador)
// y que la clave pública NO pueda escribir.
import { createClient } from "@supabase/supabase-js";

const { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key } = process.env;
if (!url || !key) {
  console.error("Faltan las Variables VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

let ok = true;
for (const moneda of ["VES", "ARS"]) {
  const { count, error } = await supabase
    .from("cotizaciones_diarias")
    .select("*", { count: "exact", head: true })
    .eq("moneda", moneda);
  const { data: ultimo } = await supabase
    .from("cotizaciones")
    .select("valor, fecha")
    .eq("moneda", moneda)
    .order("fecha", { ascending: false })
    .limit(1);
  if (error || !count) {
    ok = false;
    console.error(`${moneda}: no se pudo leer (${error?.message ?? "0 filas"})`);
  } else {
    console.log(`${moneda}: ${count} días. Último: ${ultimo?.[0]?.valor} (${ultimo?.[0]?.fecha})`);
  }
}

const { error: errorEscritura } = await supabase
  .from("cotizaciones")
  .insert({ moneda: "VES", fuente: "prueba", valor: 1 });
if (errorEscritura) {
  console.log("Seguridad OK: la clave pública no puede escribir.");
} else {
  ok = false;
  console.error("ATENCIÓN: la clave pública pudo escribir. Revisá que corriste schema.sql (RLS).");
}

process.exit(ok ? 0 : 1);
