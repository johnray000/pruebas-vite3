import { useState } from "react";
import bexoLogo from "./assets/bexo-logo.png";
import CardPrueba from "./components/CardPrueba";

//import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      className="min-h-[660px] h-screen min-w-80 grid grid-rows-12  text-center  text-gray-400
    md:grid-cols-2"
    >
      <div className="md:col-span-2 border border-yellow-400">
        <img
          src={bexoLogo}
          className="h-[12vh] min-h-20 -m-3 mx-auto"
          alt="Vite logo"
        />{" "}
      </div>
      <h4 className="md:col-span-2 border border-yellow-400">Menu</h4>
      <div className="card row-span-4 md:row-span-9 border  border-yellow-400">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="md:col-start-1">
        Click on the Vite and React logos to learn more
      </p>
      <div className="md:col-start-2 md:row-start-3 md:row-span-9 row-span-4 border border-yellow-400">
        <CardPrueba />
      </div>
      <p className="">Precios 2</p>
    </div>
  );
}

export default App;
