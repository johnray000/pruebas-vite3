import fs from "fs";

async function processFile(inputFilePath, outputFilePath) {
  try {
    // Leer el archivo existente
    const jsonData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    
    // Procesar los registros
    const processedData = jsonData.map(record => {
      const currentDate = new Date(record.fecha);

      // Obtener la fecha en formato dd/mm
      const formattedDate = currentDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }).replace(/\//g, '/');

      // Obtener la fecha abreviada en formato "mes día"
      const formattedAbbreviatedDate = currentDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

      return {
        ...record,
        fecha_numerica: formattedDate,
        fecha_abreviada: formattedAbbreviatedDate
      };
    });

    // Escribir los nuevos registros en un nuevo archivo
    fs.writeFileSync(outputFilePath, JSON.stringify(processedData, null, 2));
    
    console.log('Datos procesados y escritos correctamente en el archivo:', outputFilePath);
  } catch (error) {
    console.error('Error al procesar el archivo:', error.message);
  }
}

// Llamar a la función para procesar el archivo
processFile('./data.json', './datosVES_format_completo.json');
