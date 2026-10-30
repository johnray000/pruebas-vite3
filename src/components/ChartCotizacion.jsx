import { useMemo, useState } from "react";
import { Title, LineChart, Tab, TabGroup, TabList } from "@tremor/react";
import { useCotizaciones } from "../hooks/useCotizaciones";

const OPCIONES = ["Días", "Semanas", "Meses"];

const valueFormatter = (n) => new Intl.NumberFormat("us").format(n);

function semanaDelAnio(fecha) {
  const inicio = Date.UTC(fecha.getUTCFullYear(), 0, 1);
  return Math.floor((fecha - inicio) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

// Los datos ya vienen ordenados y con un registro por día (vista cotizaciones_diarias),
// así que agrupar es quedarse con el último de cada semana o mes.
function agrupar(datos, opcion) {
  if (opcion === "Días") {
    const haceUnAnio = new Date();
    haceUnAnio.setFullYear(haceUnAnio.getFullYear() - 1);
    return datos.filter((d) => new Date(d.fecha) >= haceUnAnio);
  }
  const grupos = new Map();
  for (const d of datos) {
    const f = new Date(d.fecha);
    const clave =
      opcion === "Semanas"
        ? `${f.getUTCFullYear()}-W${semanaDelAnio(f)}`
        : `${f.getUTCFullYear()}-${f.getUTCMonth() + 1}`;
    grupos.set(clave, d);
  }
  return [...grupos.values()];
}

/**
 * Gráfico histórico de una moneda.
 * Props: moneda ("VES" | "ARS"), titulo, serie (nombre en la leyenda), color (de Tremor).
 */
export default function ChartCotizacion({ moneda, titulo, serie, color }) {
  const { datos, cargando, error } = useCotizaciones(moneda);
  const [indice, setIndice] = useState(0);

  const chartData = useMemo(
    () =>
      agrupar(datos, OPCIONES[indice]).map((d) => {
        const f = new Date(d.fecha);
        return {
          fecha_abreviada: `${f.getDate()} ${f.toLocaleString("default", { month: "short" })} ${f.getFullYear()}`,
          [serie]: d.valor,
        };
      }),
    [datos, indice, serie]
  );

  return (
    <div className="max-h-[99%] md:min-h-full p-1">
      <div className="flex justify-between items-center">
        <Title className="text-base px-2">{titulo}</Title>
        <TabGroup index={indice} onIndexChange={setIndice} className="max-w-fit">
          <TabList color="gray" variant="solid">
            {OPCIONES.map((op) => (
              <Tab key={op}>{op}</Tab>
            ))}
          </TabList>
        </TabGroup>
      </div>

      {error ? (
        <p className="p-4 text-sm">No se pudieron cargar los datos. Probá recargar la página.</p>
      ) : (
        <LineChart
          className="h-[calc(92%-1.8rem)]"
          data={chartData}
          index="fecha_abreviada"
          categories={[serie]}
          colors={[color]}
          valueFormatter={valueFormatter}
          curveType="natural"
          yAxisWidth={35}
          autoMinValue={true}
          noDataText={cargando ? "Cargando…" : "Sin datos"}
        />
      )}
    </div>
  );
}
