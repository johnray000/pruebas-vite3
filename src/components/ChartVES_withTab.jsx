import { Card, Title, LineChart, Tab, TabGroup, TabList } from "@tremor/react";
import React, { useEffect, useState } from "react";
import jsonData from "../data/data.json";
import vzlaFlag from "../assets/vzla-flag.png";

const valueFormatter = (number) =>
  `${new Intl.NumberFormat("us").format(number).toString()}`;

export default () => {
  const [chartData, setChartData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dateOptions = ["Días", "Semanas", "Meses"];

  useEffect(() => {
    const filteredData = filterDataByOption(dateOptions[selectedIndex]);
    const mappedData = mapDataKeys(filteredData);
    setChartData(mappedData);
  }, [selectedIndex]);

  const filterDataByOption = (option) => {
    if (option === "Días") {
      const sampledData = jsonData.filter((entry, index) => index % 3 === 0);
      return sampledData;
    } else if (option === "Semanas" || option === "Meses") {
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

  // const mapDataKeys = (data) => { //cambiar el value dolarYadio a dolarParalelo
  //   return data.map(entry => ({
  //     ...entry,
  //     "Dolar Vzla": entry.dolarYadio
  //   }));
  // };

  const mapDataKeys = (data) => {
    return data.map(entry => {
      const fecha = new Date(entry.fecha);
      const fechaAbreviadaConAno = `${fecha.getDate()} ${fecha.toLocaleString('default', { month: 'short' })} ${fecha.getFullYear()}`;
      return {
        ...entry,
        "Dolar Vzla": entry.dolarYadio,
        fecha_abreviada: fechaAbreviadaConAno // Actualizamos la fecha abreviada para incluir el año
      };
    });
  };

  const handleDateOptionChange = (index) => {
    setSelectedIndex(index);
    const filteredData = filterDataByOption(dateOptions[index]);
    const mappedData = mapDataKeys(filteredData);
    setChartData(mappedData);
  };

  return (
    <div className="max-h-[99%] md:min-h-full p-1">
      <div className="flex justify-between items-center">
        <div className="flex">
          <Title className="text-base px-2">
            Historico Dolar Venezuela
          </Title>
          {/* <img src={vzlaFlag} className="h-8 -mt-1" /> */}
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
        className="h-[calc(90%-2rem)]"
        data={chartData}
        index="fecha_abreviada"
        categories={["Dolar Vzla"]}
        colors={["red"]}
        valueFormatter={valueFormatter}
        curveType="natural"
        yAxisWidth={35}
        autoMinValue={true}        
        style={{}}
      />
    </div>
  );
};
