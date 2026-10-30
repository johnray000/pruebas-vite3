// Migración única: carga el histórico de los JSON viejos en Supabase.
// Se puede correr más de una vez sin duplicar (usa la restricción unique moneda+fecha).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

// data*.json y updates*.json se solapan casi por completo, pero cada uno
// tiene algunos registros que el otro no; se cargan ambos y se deduplica.
const ARCHIVOS = [
  { archivo: "src/data/data.json", moneda: "VES", fuente: "yadio", campo: "dolarYadio" },
  { archivo: "src/data/updates.json", moneda: "VES", fuente: "yadio", campo: "dolarYadio" },
  { archivo: "src/data/data-ARS.json", moneda: "ARS", fuente: "criptoya_ccb", campo: "dolarBlue" },
  { archivo: "src/data/updates-ARS.json", moneda: "ARS", fuente: "criptoya_ccb", campo: "dolarBlue" },
];

const porClave = new Map();
let descartados = 0;

for (const { archivo, moneda, fuente, campo } of ARCHIVOS) {
  const registros = JSON.parse(readFileSync(archivo, "utf8"));
  for (const r of registros) {
    const valor = Number(r[campo]);
    if (r.error || !r.fecha || !Number.isFinite(valor) || valor <= 0) {
      descartados++;
      continue;
    }
    porClave.set(`${moneda}|${r.fecha}`, { moneda, fuente, valor, fecha: r.fecha });
  }
}

const filas = [...porClave.values()];
console.log(`Filas a cargar: ${filas.length} (descartadas con error o vacías: ${descartados})`);

const LOTE = 500;
for (let i = 0; i < filas.length; i += LOTE) {
  const lote = filas.slice(i, i + LOTE);
  const { error } = await supabase
    .from("cotizaciones")
    .upsert(lote, { onConflict: "moneda,fecha", ignoreDuplicates: true });
  if (error) {
    console.error(`Error en el lote que empieza en ${i}:`, error.message);
    process.exit(1);
  }
  console.log(`  ${Math.min(i + LOTE, filas.length)}/${filas.length}`);
}
console.log("Migración terminada.");
