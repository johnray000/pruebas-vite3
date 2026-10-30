// Runner: consulta las APIs y guarda una fila por moneda en Supabase.
// Se ejecuta desde GitHub Actions (.github/workflows/update-data.yml).
// Ya no toca archivos, no hace commit ni build.
import { createClient } from "@supabase/supabase-js";
import { error, revisarEntorno } from "./log.js";

revisarEntorno(["SUPABASE_URL", "SUPABASE_SECRET_KEY"]);
const supabase = createClient(process.env.SUPABASE_URL.trim(), process.env.SUPABASE_SECRET_KEY.trim(), {
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

      // Control de saltos absurdos: si el valor nuevo es más del triple (o menos
      // de un tercio) del último guardado, es casi seguro una falla de la API.
      const { data: ultimo, error: errorUltimo } = await supabase
        .from("cotizaciones")
        .select("valor")
        .eq("moneda", moneda)
        .order("fecha", { ascending: false })
        .limit(1);
      if (errorUltimo) throw new Error(`${moneda}: no se pudo leer el último valor (${errorUltimo.message})`);
      const anterior = Number(ultimo?.[0]?.valor);
      if (anterior > 0 && (valor > anterior * 3 || valor < anterior / 3)) {
        throw new Error(
          `${moneda}: ${valor} parece un error de la API (el último guardado es ${anterior}). No se guardó.`
        );
      }

      return { moneda, fuente, valor, fecha };
    })
  );

  const filas = resultados.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const fallas = resultados.filter((r) => r.status === "rejected").map((r) => r.reason.message);

  // Solo se guardan valores buenos: los errores ya no ensucian el histórico.
  if (filas.length > 0) {
    const { error: errorInsert } = await supabase.from("cotizaciones").insert(filas);
    if (errorInsert) throw new Error(`Supabase: ${errorInsert.message}`);
    console.log("Guardado:", filas);
  }

  // Si alguna fuente falló, el job termina en rojo y GitHub te avisa por mail.
  if (fallas.length > 0) {
    error("Fuentes con error:", fallas.join(" | "));
    process.exit(1);
  }
}

main().catch((err) => {
  error(err);
  process.exit(1);
});
