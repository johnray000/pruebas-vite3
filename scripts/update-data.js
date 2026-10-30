// Runner: consulta las APIs y guarda una fila por moneda en Supabase.
// Se ejecuta desde GitHub Actions (.github/workflows/update-data.yml).
// Ya no toca archivos, no hace commit ni build.
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en las variables de entorno.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

async function getJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
  return res.json();
}

// Para agregar otra moneda o fuente, se suma un objeto acá.
const FUENTES = [
  {
    moneda: "VES",
    fuente: "yadio",
    decimales: 2,
    obtener: async () => {
      const data = await getJSON("https://api.yadio.io/exrates/VES");
      return 1 / data.VES.USD;
    },
  },
  {
    moneda: "ARS",
    fuente: "criptoya_ccb",
    decimales: 0,
    obtener: async () => {
      const data = await getJSON("https://criptoya.com/api/dolar");
      return data.cripto.ccb.bid;
    },
  },
];

async function main() {
  const fecha = new Date().toISOString();

  const resultados = await Promise.allSettled(
    FUENTES.map(async ({ moneda, fuente, decimales, obtener }) => {
      const crudo = await obtener();
      const valor = Number(Number(crudo).toFixed(decimales));
      if (!Number.isFinite(valor) || valor <= 0) {
        throw new Error(`${moneda}: valor inválido (${crudo})`);
      }
      return { moneda, fuente, valor, fecha };
    })
  );

  const filas = resultados.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const fallas = resultados.filter((r) => r.status === "rejected").map((r) => r.reason.message);

  // Solo se guardan valores buenos: los errores ya no ensucian el histórico.
  if (filas.length > 0) {
    const { error } = await supabase.from("cotizaciones").insert(filas);
    if (error) throw new Error(`Supabase: ${error.message}`);
    console.log("Guardado:", filas);
  }

  // Si alguna fuente falló, el job termina en rojo y GitHub te avisa por mail.
  if (fallas.length > 0) {
    console.error("Fuentes con error:", fallas);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
