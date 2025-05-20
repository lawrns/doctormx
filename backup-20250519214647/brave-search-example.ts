/**
 * This script demonstrates how to use the Brave Search API to find phone numbers
 * for dentists. You can use this as a template for implementing the actual
 * phone number search in the phone-finder.ts script.
 * 
 * Usage:
 * npx ts-node src/scripts/brave-search-example.ts
 */

// Sample dentist data for testing
const sampleDentist = {
  name: "Dr. Joseph Naffah Kamel",
  address: "Bosques De Duraznos 65 - 709 Colonia Bosques de las Lomas",
  specialty: "Dentista - odontólogo"
};

// Function to demonstrate using the brave_web_search API
async function demonstrateBraveSearch() {
  try {
    console.log('Brave Search API Example');
    console.log('------------------------');
    console.log(`Searching for: ${sampleDentist.name} at ${sampleDentist.address}`);
    
    // Create the search query
    const searchQuery = `${sampleDentist.name} ${sampleDentist.address} teléfono dentista México`;
    
    console.log(`\nSearch query: ${searchQuery}`);
    console.log('\nPerforming search with brave_web_search...');
    
    // This is how you would call the brave_web_search function:
    // const searchResults = await brave_web_search({
    //   query: searchQuery,
    //   count: 5 // Limit to 5 results to keep the response size manageable
    // });
    
    // For demonstration, we'll simulate what the search results might look like
    const simulatedResults = {
      data: {
        results: [
          {
            title: "Dr. Joseph Naffah Kamel - Dentista en Ciudad de México",
            description: "Agenda una cita con Dr. Joseph Naffah Kamel. Contacto: (55) 1234 5678. Dirección: Bosques De Duraznos 65 - 709 Colonia Bosques de las Lomas.",
            url: "https://www.doctoralia.com.mx/joseph-naffah-kamel/dentista/ciudad-de-mexico"
          },
          {
            title: "Los mejores dentistas en Bosques de las Lomas - Zocdoc",
            description: "Encuentra los mejores dentistas en Bosques de las Lomas. Dr. Naffah atiende de lunes a viernes. Llame al 55 9876 5432 para agendar su cita.",
            url: "https://www.zocdoc.com/dentistas/ciudad-de-mexico/bosques-de-las-lomas"
          }
        ]
      }
    };
    
    console.log('\nSimulated search results:');
    console.log(JSON.stringify(simulatedResults, null, 2));
    
    // Now extract the phone number
    console.log('\nExtracting phone number...');
    const phoneNumber = extractPhoneNumber(simulatedResults);
    
    console.log(`\nExtracted phone number: ${phoneNumber}`);
    
    console.log('\nHow to implement this in phone-finder.ts:');
    console.log('1. Replace the commented out brave_web_search code with actual API calls');
    console.log('2. Use the extractPhoneNumber function to parse the results');
    console.log('3. Save the extracted phone numbers to the Excel file');
    
  } catch (error) {
    console.error('Error in Brave Search demonstration:', error);
  }
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

// Run the demonstration
demonstrateBraveSearch().catch(console.error);
