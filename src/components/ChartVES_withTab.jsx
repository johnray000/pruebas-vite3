import { Card, Title, LineChart, Tab, TabGroup, TabList } from "@tremor/react";
import React, { useEffect, useState } from "react";
import jsonData from "../data/data.json";

const valueFormatter = (number) =>
  `${new Intl.NumberFormat("us").format(number).toString()}`;

export default () => {
  const [chartData, setChartData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dateOptions = ["Días", "Semanas", "Meses"]; 

  useEffect(() => {
    setChartData(jsonData);
  }, []);
  

  const filterDataByOption = (option) => {
    if (option === "Días") {      
      const sampledData = jsonData.filter((entry, index) => index % 3 === 0); // Muestrear solo para la opción "Días"
      return sampledData;
      //return jsonData;
    } else if (option === "Semanas" || option === "Meses") {
      // Agrupar por Semana o Mes y seleccionar el último valor
      const groupedData = jsonData.reduce((acc, entry) => {
        const key =
          option === "Semanas"
            ? `${new Date(entry.fecha).getFullYear()}-W${entry.semana}`
            : entry.fecha_abreviada.substr(
                entry.fecha_abreviada.indexOf(" ") + 1
              );
        acc[key] = entry;
        return acc;
      }, {});
      return Object.values(groupedData);
    }
  };

  const handleDateOptionChange = (index) => {
    setSelectedIndex(index);
    // Lógica para actualizar los datos según la opción de fecha seleccionada (días, semanas, meses)
    const filteredData = filterDataByOption(dateOptions[index]);
    setChartData(filteredData);
  };

  return (
    <Card className="max-h-72 md:min-h-full border border-yellow-600 p-1">
      <div className="flex justify-between items-center">
        <Title className="text-xs">Precio del Dolar VZLA ☢️</Title>
        <TabGroup
          index={selectedIndex}
          onIndexChange={handleDateOptionChange}
          className="max-w-fit"
        >
          <TabList color="gray" variant="solid">
            {dateOptions.map((option, index) => (
              <Tab key={index}>{option}</Tab>
            ))}
          </TabList>
        </TabGroup>
      </div>
      <LineChart
        className="h-[calc(100%-2.3rem)]"
        data={chartData}
        index="fecha_abreviada"
        categories={["dolarYadio"]}
        colors={["blue"]}
        valueFormatter={valueFormatter}
        yAxisWidth={35}
        autoMinValue={true}
        style={
          {
            //marginLeft: "-1rem", // Ajusta la distancia a la izquierda
            //border: "0.2px solid yellow"
          }
        }
      />
    </Card>
  );
};
