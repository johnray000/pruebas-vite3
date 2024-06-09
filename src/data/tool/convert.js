import { readFile, writeFile } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputFilePath = join(__dirname, 'datos_ars_excel.txt'); // Reemplaza 'datos_ars_excel.txt' con la ruta de tu archivo de datos
const outputFilePath = join(__dirname, 'data.json');

const results = [];

// Lee el archivo de datos
readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error leyendo el archivo:', err);
    return;
  }

  // Procesa cada línea del archivo
  const lines = data.trim().split('\n');
  lines.forEach(line => {
    const [fechaStr, precioVentaStr] = line.split('\t'); // Suponiendo que los datos están separados por tabulaciones
    const fecha = parseDate(fechaStr);

    if (!fecha) {
      return; // Si la fecha es inválida, omitimos este registro
    }

    const precioVenta = parseFloat(precioVentaStr);
    const semana = getWeekNumber(fecha);

    results.push({
      fecha: fecha.toISOString(), // Solo se ejecutará si fecha es válida
      dolarYadio: precioVenta,
      semana: semana,
      fecha_numerica: `${fecha.getDate()}/${fecha.getMonth() + 1}`,
      fecha_abreviada: `${fecha.getDate()} ${fecha.toLocaleString('default', { month: 'short' })}`
    });
  });

  // Invertir el orden de los resultados
  const reversedResults = results.reverse();

  // Escribe el archivo JSON
  writeFile(outputFilePath, JSON.stringify(reversedResults, null, 2), err => {
    if (err) {
      console.error('Error escribiendo el archivo JSON:', err);
    } else {
      console.log('Archivo JSON creado exitosamente');
    }
  });
});

// Función para obtener el número de semana
function getWeekNumber(date) {
  if (!date || isNaN(date.getTime())) {
    console.error('Fecha inválida:', date);
    return null;
  }

  const oneJan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
}

// Función para parsear fechas en formato MM/DD/YYYY o DD/MM/YYYY
function parseDate(dateStr) {
  const parts = dateStr.split('/');

  if (parts.length !== 3) {
    console.error(`Formato de fecha incorrecto: ${dateStr}`);
    return null;
  }

  let [day, month, year] = parts.map(part => parseInt(part)); // Convertimos las partes a números

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error(`Formato de fecha incorrecto: ${dateStr}`);
    return null;
  }

  if (year < 100) { // Si el año es menor que 100, suponemos que es un año abreviado y lo convertimos al formato completo
    year += 2000; // Suponemos que los años menores que 100 corresponden a años en el siglo 21
  }

  let date;

  if (year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    console.error(`Fecha inválida: ${dateStr}`);
    return null;
  }

  // Creamos la fecha usando el formato YYYY-MM-DD
  date = new Date(year, month - 1, day); // Restamos 1 al mes porque los meses en JavaScript van de 0 a 11

  if (isNaN(date.getTime())) {
    console.error(`Fecha inválida: ${dateStr}`);
    return null;
  }

  return date;
}