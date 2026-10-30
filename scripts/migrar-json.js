// Migración única: carga el histórico de los JSON viejos en Supabase.
// Se puede correr más de una vez sin duplicar (usa la restricción unique moneda+fecha).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { error, revisarEntorno } from "./log.js";

revisarEntorno(["SUPABASE_URL", "SUPABASE_SECRET_KEY"]);
const supabase = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SECRET_KEY.trim(),
  { auth: { persistSession: false } }
);

// data*.json y updates*.json se solapan casi por completo, pero cada uno
// tiene algunos registros que el otro no; se cargan ambos y se deduplica.
// DATA_DIR permite leer los JSON desde otra carpeta (el workflow usa los de main).
const DIR = process.env.DATA_DIR || "src/data";
const ARCHIVOS = [
  { archivo: `${DIR}/data.json`, moneda: "VES", fuente: "yadio", campo: "dolarYadio" },
  { archivo: `${DIR}/updates.json`, moneda: "VES", fuente: "yadio", campo: "dolarYadio" },
  { archivo: `${DIR}/data-ARS.json`, moneda: "ARS", fuente: "criptoya_ccb", campo: "dolarBlue" },
  { archivo: `${DIR}/updates-ARS.json`, moneda: "ARS", fuente: "criptoya_ccb", campo: "dolarBlue" },
];

async function main() {
  // Primero, una consulta mínima para detectar clave o tabla mal configuradas.
  const prueba = await supabase.from("cotizaciones").select("id", { head: true, count: "exact" });
  if (prueba.error) {
    throw new Error(
      `No se pudo acceder a la tabla cotizaciones: ${prueba.error.message}` +
        (prueba.error.code ? ` [${prueba.error.code}]` : "") +
        ". ¿Corriste schema.sql en el SQL Editor y la SUPABASE_SECRET_KEY es la sb_secret_ completa?"
    );
  }
  console.log(`Filas que ya había en la tabla: ${prueba.count}`);

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
    const { error: e } = await supabase
      .from("cotizaciones")
      .upsert(lote, { onConflict: "moneda,fecha", ignoreDuplicates: true });
    if (e) throw new Error(`Error en el lote que empieza en ${i}: ${e.message}`);
    console.log(`  ${Math.min(i + LOTE, filas.length)}/${filas.length}`);
  }
  console.log("Migración terminada.");
}

main().catch((e) => {
  error(e);
  process.exit(1);
});
