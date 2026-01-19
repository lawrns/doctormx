export function StructuredData() {
  const medicalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Doctor.mx",
    description:
      "Plataforma de telemedicina y consultas medicas en linea con doctores verificados en Mexico",
    url: "https://doctor.mx",
    logo: "https://doctor.mx/logo.png",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MX",
    },
    areaServed: {
      "@type": "Country",
      name: "Mexico",
    },
    priceRange: "$-$$",
    medicalSpecialty: [
      "GeneralPractice",
      "Cardiology",
      "Dermatology",
      "Pediatrics",
      "Psychiatry",
    ],
    availableService: {
      "@type": "MedicalService",
      name: "Consulta medica en linea",
      availableChannel: {
        "@type": "ServiceChannel",
        serviceType: "OnlineService",
      },
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doctor.mx",
    url: "https://doctor.mx",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://doctor.mx/doctors?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doctor.mx",
    url: "https://doctor.mx",
    logo: "https://doctor.mx/logo.png",
    sameAs: [
      "https://facebook.com/doctormx",
      "https://twitter.com/doctormx",
      "https://instagram.com/doctormx",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+52-800-DOCTOR",
      contactType: "customer service",
      availableLanguage: "Spanish",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(medicalBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
    </>
  );
}
