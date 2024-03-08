import { Card, Title, LineChart, Tab, TabGroup, TabList } from "@tremor/react";
import React, { useEffect, useState } from "react";
import jsonData from "../data/data.json";

const valueFormatter = (number) =>
  `${new Intl.NumberFormat("us").format(number).toString()}`;

export default () => {
  const [chartData, setChartData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dateOptions = ["Días", "Semanas", "Meses"];

  // useEffect(() => {
  //   setChartData(jsonData); //aqui esta cargado del archivo en el primer render
  // }, []);

  useEffect(() => {//aqui obligo a usar la data primero pasada por filterDataByOption
    const filteredData = filterDataByOption(dateOptions[selectedIndex]);
    setChartData(filteredData);
  }, [selectedIndex]);

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
    <div className="max-h-72 md:min-h-full p-1 ">
      <div className="flex justify-between items-center">
        <div className="flex">
          <Title className="text-base px-2">
            Historico Dolar
          </Title>
          <img src="./src/assets/vzla-flag.png" className="h-8 -mt-1" />
        </div>
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
        className="h-[calc(100%-2rem)]"
        data={chartData}
        index="fecha_abreviada"
        categories={["dolarYadio"]}
        colors={["cyan"]}
        valueFormatter={valueFormatter}
        curveType="natural"
        yAxisWidth={35}
        autoMinValue={true}        
        style={
          {
            //marginLeft: "-1rem", // Ajusta la distancia a la izquierda
           
          }
        }
      />
    </div>
  );
};
