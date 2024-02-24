// update-data.js
import axios from "axios";
import fs from "fs";

// Función para obtener la semana del año en formato UTC
function getUTCWeek(date) {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;

  return Math.floor((date - startOfYear) / millisecondsInWeek) + 1;
}

async function fetchData() {
  try {
    const response = await axios.get("https://api.yadio.io/exrates/VES");
    const data = response.data;
    const dolarYadio = parseFloat((1 / data.VES.USD).toFixed(2));

    // Obtener la semana del año
    const currentDate = new Date();
    const weekNumber = getUTCWeek(currentDate);

    // Obtener la fecha en formato dd/mm
    const formattedDate = currentDate
      .toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
      .replace(/\//g, "/");

    // Obtener la fecha abreviada en formato "mes día"
    const formattedAbbreviatedDate = currentDate.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });

    // Devolvemos los nuevos datos
    return {
      fecha: currentDate.toISOString(),
      dolarYadio: dolarYadio,
      semana: weekNumber,
      fecha_numerica: formattedDate,
      fecha_abreviada: formattedAbbreviatedDate,
    };
  } catch (error) {
    console.error("Error al obtener datos:", error.message);
    return {
      fecha: new Date().toISOString(),
      error: error.message,
    };
  }
}

async function updateData() {
  let jsonData = [];
  try {
    // Obtener datos nuevos
    const newData = await fetchData();

    // Leer el JSON original
    jsonData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));
    jsonData.push(newData);

    // Guardar los datos actualizados en el archivo original
    fs.writeFileSync("./src/data/data.json", JSON.stringify(jsonData));

    // Leer el archivo de actualizaciones (si existe)
    let updateData = [];
    try {
      updateData = JSON.parse(
        fs.readFileSync("./src/data/updates.json", "utf8")
      );
    } catch (error) {
      // No hay archivo de actualizaciones (podría no existir en la primera ejecución)
    }

    // Agregar los nuevos datos al archivo de actualizaciones
    updateData.push(newData);

    // Guardar los datos actualizados en el archivo de actualizaciones
    fs.writeFileSync("./src/data/updates.json", JSON.stringify(updateData));

    console.log("Datos actualizados correctamente.", newData);
  } catch (error) {
    console.error("Error al actualizar datos:", error.message);
  }
}

// Llamar a la función para realizar la actualización
updateData();
