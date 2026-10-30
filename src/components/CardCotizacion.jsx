import { Card } from "@tremor/react";
import { useCotizaciones } from "../hooks/useCotizaciones";

/** Tarjeta con el último precio. Props: moneda, etiqueta ("Vzla Hoy"), color. */
export function CardCotizacion({ moneda, etiqueta, color }) {
  const { datos, cargando } = useCotizaciones(moneda);
  const ultimo = datos[datos.length - 1];

  const fecha = ultimo
    ? new Date(ultimo.fecha).toLocaleDateString("es-ES", { month: "short", day: "numeric" })
    : "";
  const precio = ultimo ? ultimo.valor : cargando ? "…" : "—";

  return (
    <Card className="ml-auto w-32 h-16 p-2" decoration="bottom" decorationColor={color}>
      <div className="flex flex-col justify-center h-full">
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content leading-tight">
          {etiqueta} {fecha}
        </p>
        <p className="text-xl text-dark-tremor-brand-inverted dark:text-dark-tremor-content-strong font-semibold leading-tight">
          {precio}
        </p>
      </div>
    </Card>
  );
}
