// Verifica que la web pueda leer la BD con la clave PÚBLICA (como lo hará el navegador)
// y que la clave pública NO pueda escribir.
import { createClient } from "@supabase/supabase-js";
import { error, revisarEntorno } from "./log.js";

revisarEntorno(["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"]);
const url = process.env.VITE_SUPABASE_URL.trim();
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY.trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

let ok = true;
for (const moneda of ["VES", "ARS"]) {
  const { count, error: errorLectura } = await supabase
    .from("cotizaciones_diarias")
    .select("*", { count: "exact", head: true })
    .eq("moneda", moneda);
  const { data: ultimo } = await supabase
    .from("cotizaciones")
    .select("valor, fecha")
    .eq("moneda", moneda)
    .order("fecha", { ascending: false })
    .limit(1);
  if (errorLectura || !count) {
    ok = false;
    error(`${moneda}: no se pudo leer (${errorLectura?.message ?? "0 filas"})`);
  } else {
    console.log(`${moneda}: ${count} días. Último: ${ultimo?.[0]?.valor} (${ultimo?.[0]?.fecha})`);
  }
}

const { error: errorEscritura } = await supabase
  .from("cotizaciones")
  .insert({ moneda: "VES", fuente: "prueba", valor: 1 });
if (errorEscritura?.code === "42501") {
  console.log("Seguridad OK: la clave pública no puede escribir.");
} else if (errorEscritura) {
  ok = false;
  error(`No se pudo probar la escritura: ${errorEscritura.message}`);
} else {
  ok = false;
  error("ATENCIÓN: la clave pública pudo escribir. Revisá que corriste schema.sql (RLS).");
}

process.exit(ok ? 0 : 1);
