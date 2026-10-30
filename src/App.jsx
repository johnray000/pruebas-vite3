import bexoLogo from "./assets/bexo-logo.png";
import ChartCotizacion from "./components/ChartCotizacion";
import { CardCotizacion } from "./components/CardCotizacion";
import RedesMenuIcon from "./components/Redes-Menu-Icons";

import "./App.css";

function App() {
  return (
    <div
      className="min-h-[660px] h-screen min-w-80 grid grid-rows-12  text-center  text-gray-400
    md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <img
          src={bexoLogo}
          className="h-[12vh] min-h-20 -m-3 mx-auto"
          alt="Logo"
        />
      </div>
      <div className="md:col-span-2 pt-2">
        <RedesMenuIcon />
      </div>
      <div className="grid row-span-4 md:row-span-9">
        <ChartCotizacion moneda="VES" titulo="Historico Dolar Venezuela" serie="Dolar Vzla" color="red" />
      </div>
      <div className="md:col-start-1">
        <CardCotizacion moneda="VES" etiqueta="Vzla Hoy" color="red" />
      </div>
      <div className="grid md:col-start-2 md:row-start-3 md:row-span-9 row-span-4">
        <ChartCotizacion moneda="ARS" titulo="Historico Dolar Argentina" serie="Dolar Blue" color="cyan" />
      </div>
      <div className="grid md:col-start-2">
        <CardCotizacion moneda="ARS" etiqueta="Dolar Blue" color="cyan" />
      </div>
    </div>
  );
}

export default App;
