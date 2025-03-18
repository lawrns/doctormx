import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

/**
 * This script creates an Excel file directly from the test-results.json file.
 * Use this if the phone finding step failed but you still want a clean Excel file.
 * 
 * Usage:
 * npx ts-node --project tsconfig.scraper.json src/scripts/create-excel-from-json.ts
 */

async function createExcelFromJson() {
  try {
    console.log('Creating Excel file directly from JSON data...');
    
    // Path to the data directory
    const dataDir = path.join(__dirname, '../../data/scraped');
    
    // Input file (JSON with all dentists)
    const inputJsonPath = path.join(dataDir, 'test-results.json');
    
    // Output Excel file
    const outputExcelPath = path.join(dataDir, 'dentistas-all.xlsx');
    
    // Check if input file exists
    if (!fs.existsSync(inputJsonPath)) {
      console.error(`Input file not found: ${inputJsonPath}`);
      console.error('Make sure you\'ve run the scraper first.');
      return;
    }
    
    console.log(`Reading JSON file: ${inputJsonPath}`);
    
    // Read the JSON data
    const rawData = fs.readFileSync(inputJsonPath, 'utf8');
    const dentists = JSON.parse(rawData);
    
    console.log(`Found ${dentists.length} dentists. Processing...`);
    
    // Use a Map to deduplicate based on dentist name
    const uniqueDentistsMap = new Map();
    
    dentists.forEach((dentist: any, index: number) => {
      // Use the dentist name as the key for deduplication
      if (!dentist.name) return;
      
      const dentistName = dentist.name.trim();
      
      // Only keep the first occurrence of each dentist
      if (!uniqueDentistsMap.has(dentistName)) {
        uniqueDentistsMap.set(dentistName, dentist);
      }
    });
    
    // Convert the Map back to an array
    const uniqueDentists = Array.from(uniqueDentistsMap.values());
    
    console.log(`Found ${uniqueDentists.length} unique dentists after deduplication.`);
    
    // Add phone placeholder since we don't have real phone numbers
    const dentistsWithPhones = uniqueDentists.map((dentist: any, index: number) => {
      return {
        ...dentist,
        phoneNumber: 'Requires Brave Search lookup'
      };
    });
    
    // Create Excel file
    createExcelFile(dentistsWithPhones, outputExcelPath);
    
    console.log(`\nExcel file created with ${uniqueDentists.length} unique dentists.`);
    console.log(`You can find it at: ${outputExcelPath}`);
    
  } catch (error) {
    console.error('Error creating Excel from JSON:', error);
  }
}

/**
 * Creates an Excel file from the dentist data
 * @param dentists The dentist data
 * @param outputPath The path to save the Excel file
 */
function createExcelFile(dentists: any[], outputPath: string): void {
  console.log('Creating Excel file...');
  
  // Format the data for better presentation
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // Transform the data to be properly formatted for Excel
  const excelData = dentists.map((dentist: any, index: number) => {
    // Clean up the name (remove extra spaces, normalize)
    const cleanName = (dentist.name || '').trim().replace(/\s+/g, ' ');
    
    // Clean up the address
    const cleanAddress = (dentist.address || '').trim().replace(/\s+/g, ' ');
    
    // Ensure we have all fields, even if they're empty
    return {
      ID: (index + 1).toString(),
      Nombre: cleanName,
      Direccion: cleanAddress,
      Telefono: dentist.phoneNumber || '',
      TipoConsultorio: dentist.consultationType || 
                     (dentist.address && dentist.address.includes('Consultorio privado') ? 'Consultorio privado' : ''),
      Especialidad: dentist.specialty || 'Dentista',
      Ciudad: dentist.city || (dentist.address && dentist.address.includes('México') ? 'Ciudad de México' : ''),
      Colonia: dentist.colonia || extractColonia(dentist.address),
      Calle: dentist.street || '',
      Pagina: dentist.page || '',
      FechaExtraccion: currentDate,
      Estado: 'Pendiente',
      URL: dentist.url || ''
    };
  });
  
  // Create a workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
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
  worksheet['!cols'] = columns;
  
  // Add auto filter to headers
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
  worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}1` };
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dentistas');
  
  // Write the workbook to file
  XLSX.writeFile(workbook, outputPath);
  
  console.log(`Excel file created successfully at ${outputPath}`);
}

/**
 * Extract colony/neighborhood information from an address
 * @param address The full address
 * @returns The extracted colony/neighborhood
 */
function extractColonia(address: string): string {
  if (!address) return '';
  
  // Try to extract colonia from common patterns
  if (address.includes('Colonia')) {
    const coloniaMatch = address.match(/Colonia\s+([^,]+)/);
    if (coloniaMatch && coloniaMatch[1]) return coloniaMatch[1].trim();
  }
  
  // Check for Bosques De las Lomas
  if (address.includes('Bosques de las Lomas')) return 'Bosques de las Lomas';
  
  // Extract from address parts
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    // Attempt to find the colony part - usually the part after the street address
    // and before the city
    for (let i = 1; i < parts.length - 1; i++) {
      // Skip parts that are likely cities or not colonies
      if (!parts[i].includes('Ciudad de México') && 
          !parts[i].includes('CDMX') &&
          !parts[i].includes('Consultorio')) {
        return parts[i];
      }
    }
  }
  
  return '';  // Return empty string if we couldn't extract the colony
}

// Run the script
createExcelFromJson().catch(console.error);
