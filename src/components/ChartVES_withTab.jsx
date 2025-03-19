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
      const dailyData = jsonData.reduce((acc, entry) => {
        const date = entry.fecha.split("T")[0];
        acc[date] = entry; // siempre reemplaza con el último registro del día
        return acc;
      }, {});
      return Object.values(dailyData).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    } else if (option === "Semanas") {
      const groupedData = jsonData.reduce((acc, entry) => {
        const key = `${new Date(entry.fecha).getFullYear()}-W${entry.semana}`;
        acc[key] = entry; // siempre reemplaza con el último registro del grupo
        return acc;
      }, {});
      return Object.values(groupedData).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    } else if (option === "Meses") {
      const groupedData = jsonData.reduce((acc, entry) => {
        const fecha = new Date(entry.fecha);
        // Usar año y mes como clave para agrupar correctamente
        const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
        
        if (!acc[key] || new Date(entry.fecha) > new Date(acc[key].fecha)) {
          acc[key] = entry; // guardamos el último registro del mes
        }
        return acc;
      }, {});
      return Object.values(groupedData).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }
  };

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
        className="h-[calc(92%-1.8rem)]"
        data={chartData}
        index="fecha_abreviada"
        categories={["Dolar Vzla"]}
        colors={["red"]}
        valueFormatter={valueFormatter}
        curveType="natural"
        yAxisWidth={35}
        autoMinValue={true}
      />
    </div>
  );
};