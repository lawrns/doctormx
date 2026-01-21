# Doctoralia.com.mx Scraper

This scraper systematically extracts all doctor profiles from doctoralia.com.mx and organizes them into a structured directory hierarchy by specialty and location.

## Features

- Discovers all medical specialties and cities available on the platform
- Scrapes doctor profiles with comprehensive information
- Downloads and converts profile images to WebP format
- Organizes data into logical directory structure: `specialty/city/`
- Rate limiting and error handling to avoid overloading the server
- Saves both structured JSON data and images for each doctor

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

```bash
npm install
```

This will install:
- `playwright` - Browser automation
- `sharp` - Image processing and WebP conversion
- `p-limit` - Concurrent request limiting

## Usage

### Step 1: Discovery

First, discover all available specialties and cities:

```bash
npm run discover
```

This will create `discovered_data.json` with all specialties and cities found on the site.

### Step 2: Scrape All Doctors

Run the main scraper to extract all doctor profiles:

```bash
npm run scrape
```

This process will:
1. Visit each specialty+city combination
2. Paginate through all listing pages
3. Extract all doctor profile URLs
4. Visit each profile and extract detailed information
5. Download and convert profile photos to WebP
6. Save everything in organized directories

## Output Structure

```
doctors_data/
├── ginecologo/                    # Specialty (gynecologist)
│   ├── ciudad-de-mexico/          # City
│   │   ├── dr_maria_garcia.json   # Doctor data
│   │   ├── dr_maria_garcia.webp   # Profile photo
│   │   ├── dr_juan_lopez.json
│   │   └── dr_juan_lopez.webp
│   └── guadalajara/
│       └── ...
├── cardiologo/                    # Another specialty
│   └── ...
└── summary.json                   # Overall scraping summary
```

### Doctor JSON Structure

Each doctor's JSON file contains:

```json
{
  "name": "Dr. María García",
  "specialty": "Ginecólogo",
  "rating": 4.8,
  "reviewCount": 125,
  "addresses": [
    {
      "name": "Consultorio Médico XYZ",
      "street": "Av. Reforma 123",
      "city": "Ciudad de México",
      "state": "CDMX",
      "postalCode": "06600",
      "phone": "+52 55 1234 5678"
    }
  ],
  "photoUrl": "https://...",
  "localPhotoPath": "./doctors_data/ginecologo/ciudad-de-mexico/dr_maria_garcia.webp",
  "about": "Specialist in...",
  "services": [
    {
      "name": "Consulta general",
      "price": "$800"
    }
  ],
  "insurance": ["Seguros Monterrey", "GNP"],
  "education": ["UNAM - Medicine", "Specialty in..."],
  "languages": ["Español", "English"],
  "profileUrl": "https://www.doctoralia.com.mx/...",
  "scrapedAt": "2026-01-19T..."
}
```

## Configuration

You can adjust these settings in `scrape.js`:

- `DELAY_BETWEEN_PAGES` - Delay between page requests (default: 2000ms)
- `limit` - Concurrent request limit (default: 3)
- `OUTPUT_DIR` - Output directory path (default: `./doctors_data`)

## Rate Limiting

The scraper includes built-in rate limiting to be respectful to the server:
- 2-second delay between page requests
- Maximum 3 concurrent requests
- Automatic retry on failures

## Notes

- The scraping process may take several hours depending on the total number of doctors
- Images are automatically converted to WebP format with 85% quality
- Progress is logged to console during execution
- Failed downloads/scrapes are logged but don't stop the overall process

## Troubleshooting

If the scraper fails:
1. Check your internet connection
2. Ensure `discovered_data.json` exists (run discovery first)
3. Check if the website structure has changed
4. Review console logs for specific errors

## Legal Disclaimer

This scraper is for educational purposes only. Make sure you comply with:
- doctoralia.com.mx Terms of Service
- robots.txt guidelines
- Local data protection laws (LFPDPPP in Mexico)
- Respect rate limits and don't overload the server

Use responsibly and ethically.
