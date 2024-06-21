import { Card } from '@tremor/react';
import jsonData from "../data/data-ARS.json";

export function CardSimple_ARS() {
  // Encontrar el último objeto en el array jsonData
  const ultimoRegistro = jsonData[jsonData.length - 1];

  // Extraer la fecha abreviada y el precio del último registro
  const fechadehoy = ultimoRegistro.fecha_abreviada;
  const preciodehoy = ultimoRegistro.dolarBlue;

  return (
    <Card
      className="ml-auto w-32 h-16 p-2"
      decoration="bottom"
      decorationColor="cyan"
    >
      <div className="flex flex-col justify-center h-full">
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content  leading-tight">
          Dolar Blue {fechadehoy}
        </p>
        <p className="text-xl text-dark-tremor-brand-inverted dark:text-dark-tremor-content-strong font-semibold leading-tight">
          {preciodehoy}
        </p>
      </div></Card>
  );
}
