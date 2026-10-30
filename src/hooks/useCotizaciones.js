import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Supabase devuelve como máximo 1000 filas por pedido, así que se pide por páginas.
const PAGINA = 1000;

async function traerHistorico(moneda) {
  let filas = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await supabase
      .from("cotizaciones_diarias")
      .select("valor, fecha")
      .eq("moneda", moneda)
      .order("fecha", { ascending: true })
      .range(desde, desde + PAGINA - 1);
    if (error) throw error;
    filas = filas.concat(data.map((f) => ({ valor: Number(f.valor), fecha: f.fecha })));
    if (data.length < PAGINA) return filas;
  }
}

// Caché por moneda: la tarjeta y el gráfico de la misma moneda comparten un solo pedido.
const cache = new Map();

/** Devuelve { datos, cargando, error } con un registro por día, ordenado por fecha. */
export function useCotizaciones(moneda) {
  const [estado, setEstado] = useState({ datos: [], cargando: true, error: null });

  useEffect(() => {
    let activo = true;
    if (!cache.has(moneda)) {
      cache.set(
        moneda,
        traerHistorico(moneda).catch((e) => {
          cache.delete(moneda); // permitir reintento en el próximo montaje
          throw e;
        })
      );
    }
    cache
      .get(moneda)
      .then((datos) => activo && setEstado({ datos, cargando: false, error: null }))
      .catch((error) => activo && setEstado({ datos: [], cargando: false, error }));
    return () => {
      activo = false;
    };
  }, [moneda]);

  return estado;
}
