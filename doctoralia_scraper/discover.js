import { chromium } from 'playwright';
import fs from 'fs/promises';

async function discoverSpecialtiesAndCities() {
  console.log('Starting discovery of specialties and cities...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to homepage
    await page.goto('https://www.doctoralia.com.mx', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(3000);

    console.log('Discovering specialties from homepage...');

    // Get all specialty links from the homepage
    let specialties = await page.evaluate(() => {
      const specialtyLinks = [];
      const seen = new Set();

      // Look for specialty links in various places
      const links = Array.from(document.querySelectorAll('a[href]'));

      links.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent?.trim() || '';

        if (!href) return;

        // Match patterns like /ginecologo, /cardiologo, etc.
        const match = href.match(/^\/([a-z-]+)$/);
        if (match && text && !seen.has(match[1])) {
          const slug = match[1];

          // Filter out non-specialty pages
          const excludeTerms = ['clinicas', 'tratamientos', 'preguntas', 'articulos',
                               'especialidades', 'medicos', 'buscar', 'login',
                               'registro', 'ayuda', 'about', 'contacto', 'blog',
                               'terminos', 'privacidad', 'pacientes', 'profesionales'];

          if (!excludeTerms.some(term => slug.includes(term))) {
            specialtyLinks.push({ slug, name: text });
            seen.add(slug);
          }
        }
      });

      return specialtyLinks;
    });

    console.log(`Found ${specialties.length} specialties from homepage`);

    // If we didn't find enough, use a seed list of common medical specialties
    if (specialties.length < 10) {
      console.log('Using seed list of common specialties...');
      specialties = [
        { slug: 'ginecologo', name: 'Ginecólogo' },
        { slug: 'dermatologo', name: 'Dermatólogo' },
        { slug: 'cardiologo', name: 'Cardiólogo' },
        { slug: 'psicologo', name: 'Psicólogo' },
        { slug: 'pediatra', name: 'Pediatra' },
        { slug: 'oftalmologo', name: 'Oftalmólogo' },
        { slug: 'urologo', name: 'Urólogo' },
        { slug: 'neurologo', name: 'Neurólogo' },
        { slug: 'traumatologo', name: 'Traumatólogo' },
        { slug: 'endocrinologo', name: 'Endocrinólogo' },
        { slug: 'gastroenterologo', name: 'Gastroenterólogo' },
        { slug: 'nutriologo', name: 'Nutriólogo' },
        { slug: 'psiquiatra', name: 'Psiquiatra' },
        { slug: 'ortopedista', name: 'Ortopedista' },
        { slug: 'oncologo', name: 'Oncólogo' },
        { slug: 'otorrinolaringologo', name: 'Otorrinolaringólogo' },
        { slug: 'medico-general', name: 'Médico General' },
        { slug: 'cirujano-plastico', name: 'Cirujano Plástico' },
        { slug: 'reumatologo', name: 'Reumatólogo' },
        { slug: 'nefrologo', name: 'Nefrólogo' }
      ];
    }

    console.log(`Total specialties: ${specialties.length}`);

    // Visit a specialty page to discover all cities
    console.log('Discovering cities...');

    let cities = [];
    if (specialties.length > 0) {
      await page.goto(`https://www.doctoralia.com.mx/${specialties[0].slug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await page.waitForTimeout(3000);

      // Try to find and click "Ver más" to expand city list
      try {
        const verMasButton = await page.locator('text=Ver más').first();
        if (await verMasButton.isVisible({ timeout: 5000 })) {
          await verMasButton.click();
          await page.waitForTimeout(1500);
        }
      } catch (e) {
        console.log('No "Ver más" button found or unable to click');
      }

      cities = await page.evaluate((specialtySlug) => {
        const cityLinks = [];
        const seen = new Set();

        // Look for city filter links
        const links = Array.from(document.querySelectorAll('a[href]'));

        links.forEach(link => {
          const href = link.getAttribute('href');
          const text = link.textContent?.trim() || '';

          if (!href) return;

          // City links follow pattern: /specialty/city
          const match = href.match(/^\/[a-z-]+\/([a-z-]+(?:-[a-z-]+)*)$/);
          if (match && text && !seen.has(match[1])) {
            const citySlug = match[1];

            // Filter out "online" and other non-city terms
            if (citySlug !== 'online' && citySlug !== specialtySlug) {
              cityLinks.push({
                slug: citySlug,
                name: text
              });
              seen.add(citySlug);
            }
          }
        });

        return cityLinks;
      }, specialties[0].slug);

      console.log(`Found ${cities.length} cities from page`);

      // If we didn't find cities, use a seed list of major Mexican cities
      if (cities.length === 0) {
        console.log('Using seed list of major Mexican cities...');
        cities = [
          { slug: 'ciudad-de-mexico', name: 'Ciudad de México' },
          { slug: 'guadalajara', name: 'Guadalajara' },
          { slug: 'monterrey', name: 'Monterrey' },
          { slug: 'puebla', name: 'Puebla' },
          { slug: 'tijuana', name: 'Tijuana' },
          { slug: 'leon', name: 'León' },
          { slug: 'juarez', name: 'Juárez' },
          { slug: 'zapopan', name: 'Zapopan' },
          { slug: 'merida', name: 'Mérida' },
          { slug: 'queretaro', name: 'Querétaro' },
          { slug: 'san-luis-potosi', name: 'San Luis Potosí' },
          { slug: 'aguascalientes', name: 'Aguascalientes' },
          { slug: 'hermosillo', name: 'Hermosillo' },
          { slug: 'saltillo', name: 'Saltillo' },
          { slug: 'mexicali', name: 'Mexicali' },
          { slug: 'culiacan', name: 'Culiacán' },
          { slug: 'cancun', name: 'Cancún' },
          { slug: 'toluca', name: 'Toluca' },
          { slug: 'morelia', name: 'Morelia' },
          { slug: 'chihuahua', name: 'Chihuahua' }
        ];
      }

      console.log(`Total cities: ${cities.length}`);

      // Save to file
      const data = {
        specialties,
        cities,
        timestamp: new Date().toISOString()
      };

      await fs.writeFile(
        'discovered_data.json',
        JSON.stringify(data, null, 2)
      );

      console.log('Discovery complete! Data saved to discovered_data.json');
      console.log(`\nSummary:`);
      console.log(`- Specialties: ${specialties.length}`);
      console.log(`- Cities: ${cities.length}`);
      console.log(`- Total combinations: ${specialties.length * cities.length}`);
    }

  } catch (error) {
    console.error('Error during discovery:', error);
  } finally {
    await browser.close();
  }
}

discoverSpecialtiesAndCities();
