import { Card } from '@tremor/react';
import jsonData from "../data/data.json";

export function CardSimple() {
  // Encontrar el último objeto en el array jsonData
  const ultimoRegistro = jsonData[jsonData.length - 1];

  // Extraer la fecha abreviada y el precio del último registro
  const fechadehoy = ultimoRegistro.fecha_abreviada;
  const preciodehoy = ultimoRegistro.dolarYadio;

  return (
    <Card
      className="ml-auto w-32 h-12 p-2"
      decoration="bottom"
      decorationColor="red"
    >
      <div className="flex flex-col justify-center h-full">
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content  leading-tight">
          Vzla Hoy {fechadehoy}
        </p>
        <p className="text-xl text-dark-tremor-brand-inverted dark:text-dark-tremor-content-strong font-semibold leading-tight">
          {preciodehoy}
        </p>
      </div></Card>
  );
}
