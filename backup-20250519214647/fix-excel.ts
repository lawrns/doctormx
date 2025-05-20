import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

/**
 * This script reads an existing Excel file and fixes its format.
 * It can be used to improve the structure of an already generated Excel file.
 * 
 * Usage:
 * npx ts-node --project tsconfig.scraper.json src/scripts/fix-excel.ts
 */

async function fixExcelFile() {
  try {
    console.log('Starting Excel fixer...');
    
    // Path to the data directory
    const dataDir = path.join(__dirname, '../../data/scraped');
    
    // Input file (existing Excel)
    const inputPath = path.join(dataDir, 'dentistas.xlsx');
    
    // Output file (new fixed Excel)
    const outputPath = path.join(dataDir, 'dentistas-fixed.xlsx');
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      console.error('Make sure the Excel file exists before running this script.');
      return;
    }
    
    console.log(`Reading Excel file: ${inputPath}`);
    
    // Read the workbook
    const workbook = XLSX.readFile(inputPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} records. Fixing format...`);
    
    // Clean and normalize the data
    const cleanedData = data.map((row: any, index) => {
      // Convert all fields to strings if not already
      Object.keys(row).forEach(key => {
        if (row[key] === undefined || row[key] === null) {
          row[key] = '';
        } else if (typeof row[key] !== 'string') {
          row[key] = String(row[key]);
        }
        
        // Clean up the string (trim, normalize spaces)
        if (typeof row[key] === 'string') {
          row[key] = row[key].trim().replace(/\s+/g, ' ');
        }
      });
      
      // Ensure all required fields exist
      return {
        ID: (index + 1).toString(),
        Nombre: row.Nombre || row.nombre || '',
        Direccion: row.Direccion || row.direccion || '',
        Telefono: row.Telefono || row.telefono || '',
        TipoConsultorio: row.TipoConsultorio || row.tipoConsultorio || '',
        Especialidad: row.Especialidad || row.especialidad || 'Dentista',
        Ciudad: row.Ciudad || row.ciudad || 'Ciudad de México',
        Colonia: row.Colonia || row.colonia || '',
        Calle: row.Calle || row.calle || '',
        Pagina: row.Pagina || row.pagina || '',
        FechaExtraccion: row.FechaExtraccion || row.fechaExtraccion || new Date().toISOString().split('T')[0],
        Estado: row.Estado || row.estado || 'Pendiente',
        URL: row.URL || row.url || ''
      };
    });
    
    // Create a new workbook
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(cleanedData);
    
    // Set column widths
    const columns = [
      { wch: 5 },  // ID
      { wch: 30 }, // Nombre
      { wch: 40 }, // Direccion
      { wch: 20 }, // Telefono
      { wch: 20 }, // TipoConsultorio
      { wch: 15 }, // Especialidad
      { wch: 15 }, // Ciudad
      { wch: 20 }, // Colonia
      { wch: 30 }, // Calle
      { wch: 10 }, // Pagina
      { wch: 15 }, // FechaExtraccion
      { wch: 12 }, // Estado
      { wch: 50 }  // URL
    ];
    newWorksheet['!cols'] = columns;
    
    // Add auto filter to headers
    const range = XLSX.utils.decode_range(newWorksheet['!ref'] || 'A1:Z1');
    newWorksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}1` };
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Dentistas');
    
    // Write the workbook to file
    XLSX.writeFile(newWorkbook, outputPath);
    
    console.log(`Fixed Excel file created at: ${outputPath}`);
    console.log('Done!');
    
  } catch (error) {
    console.error('Error fixing Excel file:', error);
  }
}

// Run the script
fixExcelFile().catch(console.error);
