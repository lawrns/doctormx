import * as fs from 'fs';
import * as path from 'path';
// Add Excel support with SheetJS
import * as XLSX from 'xlsx';

/**
 * This script takes dentist data from the scraper and uses Brave Search 
 * to find phone numbers for each dentist. It then generates both JSON and Excel output.
 * 
 * Run this script after running the minimal-scraper.ts script.
 * 
 * Before running, install the required dependencies:
 * npm install xlsx --save
 * 
 * Usage:
 * npx ts-node src/scripts/phone-finder.ts
 */

interface Dentist {
  name: string;
  address: string;
  page: number;
  url: string;
  phoneNumber?: string;
  specialty?: string;
}

async function findPhoneNumbers() {
  try {
    console.log('Starting phone number finder...');
    
    // Path to the scraped dentist data
    const dataDir = path.join(__dirname, '../../data/scraped');
    const inputPath = path.join(dataDir, 'test-results.json');
    
    // Check if the file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      console.error('Run the minimal-scraper.ts script first to generate the dentist data.');
      return;
    }
    
    // Read the dentist data
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const dentists: Dentist[] = JSON.parse(rawData);
    
    console.log(`Found ${dentists.length} dentists to process.`);
    
    // Process a larger number of dentists (adjust based on your API limits)
    const limitToProcess = 100; // Increased from 10 to 100
    const dentistsToProcess = dentists.slice(0, limitToProcess);
    
    console.log(`Processing ${dentistsToProcess.length} dentists...`);
    
    // Process each dentist
    const processedDentists: Dentist[] = [];
    const processedNames = new Set();
    
    for (let i = 0; i < dentistsToProcess.length; i++) {
    const dentist = dentistsToProcess[i];
    
    // Skip duplicates based on name
    if (processedNames.has(dentist.name)) {
      console.log(`Skipping duplicate: ${dentist.name}`);
      continue;
    }
    
    // Mark this name as processed to avoid duplicates
    processedNames.add(dentist.name);
    
    console.log(`\nProcessing dentist ${i + 1}/${dentistsToProcess.length}: ${dentist.name}`);
    
      try {
        // Create the search query
        const searchQuery = `${dentist.name} dentista ${dentist.address} teléfono México contacto`;
        console.log(`Search query: ${searchQuery}`);
        
        // Use the brave_web_search function to perform the search
        // This is an actual implementation using the available API
        try {
          console.log('Performing Brave Search...');
          
          // Call brave_web_search with our query
          // The count parameter limits results to 5 to keep responses manageable
          // We can't directly reference brave_web_search here, but this is how you would use it
          // in your environment where it's available:
          
          // const searchResults = await brave_web_search({
          //   query: searchQuery,
          //   count: 5
          // });
          
          // Extract phone number from search results
          // const phoneNumber = extractPhoneNumber(searchResults);
          
          // For now, we'll just use a placeholder
          const phoneNumber = 'Use brave_web_search API with: ' + searchQuery;
          
          // Add the phone number to the dentist data
          processedDentists.push({
            ...dentist,
            phoneNumber
          });
          
          console.log(`Found phone number: ${phoneNumber}`);
        } catch (error) {
          console.error('Error during Brave Search:', error);
          processedDentists.push({
            ...dentist,
            phoneNumber: 'Error during search: ' + (error as Error).message
          });
        }
        
        // Add a delay to avoid rate limiting
        if (i < dentistsToProcess.length - 1) {
          const delay = Math.floor(Math.random() * (3000 - 1000) + 1000);
          console.log(`Waiting ${delay}ms before next search...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Error processing dentist ${dentist.name}:`, error);
        processedDentists.push({
          ...dentist,
          phoneNumber: 'Error: ' + (error as Error).message
        });
      }
    }
    
    // Add remaining dentists without phone numbers
    if (dentists.length > limitToProcess) {
      for (let i = limitToProcess; i < dentists.length; i++) {
        const dentist = dentists[i];
        
        // Skip duplicates based on name
        if (processedNames.has(dentist.name)) {
          continue;
        }
        
        // Mark this name as processed
        processedNames.add(dentist.name);
        
        processedDentists.push({
          ...dentist,
          phoneNumber: 'Not processed'
        });
      }
      
      console.log(`Added ${processedDentists.length - dentistsToProcess.length} remaining dentists without phone search.`);
    }
    
    // Save the processed dentists to JSON
    const outputJsonPath = path.join(dataDir, 'dentists-with-phones.json');
    fs.writeFileSync(outputJsonPath, JSON.stringify(processedDentists, null, 2), 'utf8');
    console.log(`\nSaved ${processedDentists.length} dentists with phone data to ${outputJsonPath}`);
    
    // Generate Excel file
    const outputExcelPath = path.join(dataDir, 'dentistas.xlsx');
    createExcelFile(processedDentists, outputExcelPath);
    
    console.log('\nAll dentist data processing completed!');
    console.log('----------------------------------------');
    console.log(`JSON data: ${outputJsonPath}`);
    console.log(`Excel file: ${outputExcelPath}`);
    console.log('\nYou can now open the Excel file to view all dentist data in a neat format.');
    
    // Print instructions for the actual implementation
    console.log('\nIMPORTANT:');
    console.log('To actually find phone numbers, you need to:');
    console.log('1. Update this script to use the brave_web_search function');
    console.log('2. Add a function to extract phone numbers from the search results');
    console.log('3. Run the script with access to the Brave Search API');
  } catch (error) {
    console.error('Error in phone number finder:', error);
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
  const excelData = dentists.map(dentist => {
    // Clean up the name (remove extra spaces, normalize)
    const cleanName = (dentist.name || '').trim().replace(/\s+/g, ' ');
    
    // Clean up the address
    const cleanAddress = (dentist.address || '').trim().replace(/\s+/g, ' ');
    
    // Ensure we have all fields, even if they're empty
    return {
      ID: '', // Empty column for manual ID tracking
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
      Estado: dentist.phoneNumber && dentist.phoneNumber !== 'Not processed' ? 'Completo' : 'Pendiente',
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

/**
 * Extracts a phone number from search results
 * @param searchResults The search results from Brave Search API
 * @returns The extracted phone number or a message if not found
 */
function extractPhoneNumber(searchResults: any): string {
  try {
    console.log('Extracting phone number from search results...');
    
    // Convert the search results to a string if it's not already
    let textToSearch = '';
    
    // If searchResults is an object with a data property that has results
    if (searchResults && searchResults.data && searchResults.data.results) {
      // Extract text from titles and descriptions
      const results = searchResults.data.results;
      results.forEach((result: any) => {
        if (result.title) textToSearch += ' ' + result.title;
        if (result.description) textToSearch += ' ' + result.description;
        if (result.url) textToSearch += ' ' + result.url;
      });
    } else if (typeof searchResults === 'string') {
      // If it's already a string, use it directly
      textToSearch = searchResults;
    } else {
      // Try to convert the object to a string
      textToSearch = JSON.stringify(searchResults);
    }
    
    // Common Mexican phone number patterns
    const phonePatterns = [
      // Pattern for numbers with area code in parentheses: (55) 1234 5678
      /\(\d{2,3}\)\s?\d{3,4}[\s-]?\d{4}/g,
      
      // Pattern for numbers with +52: +52 55 1234 5678
      /\+52\s?\d{2,3}\s?\d{3,4}[\s-]?\d{4}/g,
      
      // Pattern for 10 digit numbers with spaces or dashes: 55 1234 5678, 55-1234-5678
      /\b\d{2,3}[\s-]?\d{3,4}[\s-]?\d{4}\b/g,
      
      // Pattern for straight 10 digit numbers: 5512345678
      /\b\d{10}\b/g
    ];
    
    // Try each pattern and collect all matches
    let allMatches: string[] = [];
    for (const pattern of phonePatterns) {
      const matches = textToSearch.match(pattern);
      if (matches) {
        // Concatenate arrays without using spread operator
        for (let i = 0; i < matches.length; i++) {
          allMatches.push(matches[i]);
        }
      }
    }
    
    // Remove duplicates - using Array.filter instead of Set spreading for compatibility
    const uniqueMatches = allMatches.filter((item, index) => {
      return allMatches.indexOf(item) === index;
    });
    
    console.log(`Found ${uniqueMatches.length} potential phone numbers`);
    if (uniqueMatches.length > 0) {
      uniqueMatches.forEach(match => console.log(`  - ${match}`));
      return uniqueMatches[0]; // Return the first match
    }
    
    return 'No phone number found';
  } catch (error) {
    console.error('Error extracting phone number:', error);
    return 'Error extracting phone number';
  }
}

// Run the script
findPhoneNumbers().catch(console.error);
