import { chromium } from 'playwright';

async function analyzeSections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const testUrl = 'https://www.doctoralia.com.mx/diana-selenne-hernandez-castilla/ginecologo/iztapalapa';

  console.log(`Analyzing sections: ${testUrl}\n`);

  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Extract data by sections
  const extracted = await page.evaluate(() => {
    const data = {};

    // Helper function to get content after a heading
    function getContentAfterHeading(headingText) {
      const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
      const heading = headings.find(h => h.textContent.trim().toLowerCase().includes(headingText.toLowerCase()));
      if (!heading) return null;

      const content = [];
      let sibling = heading.nextElementSibling;
      while (sibling && !['H2', 'H3', 'H4'].includes(sibling.tagName)) {
        const text = sibling.textContent?.trim();
        if (text && text.length > 0) {
          content.push(text);
        }
        sibling = sibling.nextElementSibling;
      }
      return content.join(' ');
    }

    // About/Sobre mí
    const aboutHeading = Array.from(document.querySelectorAll('h3, h4')).find(h =>
      h.textContent.trim().toLowerCase() === 'sobre mí' ||
      h.textContent.trim().toLowerCase() === 'sobre mi'
    );
    if (aboutHeading) {
      let sibling = aboutHeading.nextElementSibling;
      const aboutParts = [];
      while (sibling && !['H2', 'H3', 'H4'].includes(sibling.tagName)) {
        const text = sibling.textContent?.trim();
        if (text && text.length > 5) {
          aboutParts.push(text);
        }
        sibling = sibling.nextElementSibling;
      }
      data.about = aboutParts.join(' ').slice(0, 500);
    }

    // Services and prices
    data.services = [];
    const servicesHeading = Array.from(document.querySelectorAll('h2')).find(h =>
      h.textContent.includes('Servicios y precios')
    );
    if (servicesHeading) {
      let element = servicesHeading.nextElementSibling;
      while (element) {
        if (element.tagName === 'H2') break;

        if (element.tagName === 'H3') {
          const serviceName = element.textContent?.trim();
          let priceText = '';

          // Look for price in next siblings
          let priceSibling = element.nextElementSibling;
          for (let i = 0; i < 5 && priceSibling; i++) {
            const text = priceSibling.textContent?.trim() || '';
            if (text.includes('$') || text.match(/\d{3,}/)) {
              priceText = text;
              break;
            }
            priceSibling = priceSibling.nextElementSibling;
          }

          if (serviceName) {
            data.services.push({
              name: serviceName,
              price: priceText
            });
          }
        }

        element = element.nextElementSibling;
      }
    }

    // Addresses/Consultorios
    data.addresses = [];
    const addressesHeading = Array.from(document.querySelectorAll('h2')).find(h =>
      h.textContent.includes('Consultorio')
    );
    if (addressesHeading) {
      let element = addressesHeading.nextElementSibling;
      while (element) {
        if (element.tagName === 'H2') break;

        // Look for H4 with address-like content
        if (element.tagName === 'H4') {
          const text = element.textContent?.trim();
          if (text && (text.includes(',') || text.match(/\d{4}/))) {
            data.addresses.push({
              full: text.replace(/\s+/g, ' ')
            });
          }
        }

        element = element.nextElementSibling;
      }
    }

    // Insurance
    data.insurance = [];
    const insuranceHeading = Array.from(document.querySelectorAll('h2')).find(h =>
      h.textContent.includes('Aseguradora')
    );
    if (insuranceHeading) {
      const insuranceSection = insuranceHeading.nextElementSibling;
      if (insuranceSection) {
        const insuranceItems = insuranceSection.querySelectorAll('img, span, div');
        insuranceItems.forEach(item => {
          const alt = item.getAttribute('alt');
          const title = item.getAttribute('title');
          const text = item.textContent?.trim();

          const insuranceName = alt || title || text;
          if (insuranceName && insuranceName.length > 2 && !insuranceName.includes('svg-icon')) {
            data.insurance.push(insuranceName);
          }
        });
      }
    }

    // Education/Formación
    data.education = [];
    const educationHeading = Array.from(document.querySelectorAll('h3')).find(h =>
      h.textContent.trim().toLowerCase() === 'formación' ||
      h.textContent.trim().toLowerCase() === 'formacion'
    );
    if (educationHeading) {
      let sibling = educationHeading.nextElementSibling;
      while (sibling && !['H2', 'H3'].includes(sibling.tagName)) {
        const text = sibling.textContent?.trim();
        if (text && text.length > 5) {
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
          data.education.push(...lines);
        }
        sibling = sibling.nextElementSibling;
      }
    }

    // Languages/Idiomas
    data.languages = [];
    const languagesHeading = Array.from(document.querySelectorAll('h3')).find(h =>
      h.textContent.trim().toLowerCase() === 'idiomas'
    );
    if (languagesHeading) {
      let sibling = languagesHeading.nextElementSibling;
      while (sibling && !['H2', 'H3'].includes(sibling.tagName)) {
        const text = sibling.textContent?.trim();
        if (text && text.length > 2) {
          data.languages.push(text);
        }
        sibling = sibling.nextElementSibling;
      }
    }

    // Experience years
    const experienceHeading = Array.from(document.querySelectorAll('h2, h3')).find(h =>
      h.textContent.trim().toLowerCase() === 'experiencia'
    );
    if (experienceHeading) {
      let sibling = experienceHeading.nextElementSibling;
      while (sibling && !['H2', 'H3'].includes(sibling.tagName)) {
        const text = sibling.textContent?.trim();
        const yearMatch = text?.match(/(\d+)\s*(?:años?|years?)/i);
        if (yearMatch) {
          data.yearsOfExperience = parseInt(yearMatch[1]);
          break;
        }
        sibling = sibling.nextElementSibling;
      }
    }

    return data;
  });

  console.log('=== SECTION EXTRACTION ===\n');
  console.log(JSON.stringify(extracted, null, 2));

  await browser.close();
}

analyzeSections();
