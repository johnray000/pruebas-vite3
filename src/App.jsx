import { useState } from "react";
import bexoLogo from "./assets/bexo-logo.png";
import { Grafico_ARS_withCustomTooltip } from "./components/GraficoARSwithCustomTooltip";
import ChartVES_withTab from "./components/ChartVES_withTab";
import { AreaChartExample } from "./components/ChartAreaPrueba";
import { CardSimple } from "./components/CardSimple";
import RedesMenuIcon from "./components/Redes-Menu-Icons";

//import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      className="min-h-[660px] h-screen min-w-80 grid grid-rows-12  text-center  text-gray-400
    md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <img
          src={bexoLogo}
          className="h-[12vh] min-h-20 -m-3 mx-auto"
          alt="Vite logo"
        />
      </div>
      <div className="md:col-span-2">        
        <RedesMenuIcon/>
      </div>
      <div className="grid row-span-4 md:row-span-9">
        <ChartVES_withTab />
      </div>
      <div className="md:col-start-1">
        <CardSimple/>
      </div>
      <div className="md:col-start-2 md:row-start-3 md:row-span-9 row-span-4">
        <AreaChartExample />
      </div>
      <p className="">Precios 2</p>
    </div>
  );
}

export default App;
