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

  const socialUrls = [
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  ].filter(Boolean)

  const organizationSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doctor.mx",
    url: "https://doctor.mx",
    logo: "https://doctor.mx/logo.png",
    ...(socialUrls.length > 0 ? { sameAs: socialUrls } : {}),
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

// Schema for individual doctor profile pages
export function PhysicianSchema({
  name,
  specialty,
  city,
  state,
  rating,
  reviewCount,
  price,
  image,
  url,
}: {
  name: string;
  specialty: string;
  city: string;
  state: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  image?: string;
  url: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name,
    url,
    medicalSpecialty: specialty,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: state,
      addressCountry: "MX",
    },
  };

  if (image) schema.image = image;
  if (rating || reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating || 0,
      reviewCount: reviewCount || 0,
      bestRating: 5,
    };
  }
  if (price) {
    schema.priceRange = `$${(price / 100).toFixed(0)} MXN`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema for medical condition/disease pages
export function MedicalConditionSchema({
  name,
  description,
  symptoms,
  url,
}: {
  name: string;
  description: string;
  symptoms?: string[];
  url: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    name,
    description,
    url,
  };

  if (symptoms && symptoms.length > 0) {
    schema.signOrSymptom = symptoms.map((s) => ({
      "@type": "MedicalSignOrSymptom",
      name: s,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema for clinic/facility pages
export function MedicalClinicSchema({
  name,
  description,
  address,
  city,
  phone,
  url,
  rating,
  reviewCount,
}: {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  url: string;
  rating?: number;
  reviewCount?: number;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name,
    url,
  };

  if (description) schema.description = description;
  if (address || city) {
    schema.address = {
      "@type": "PostalAddress",
      ...(address ? { streetAddress: address } : {}),
      ...(city ? { addressLocality: city } : {}),
      addressCountry: "MX",
    };
  }
  if (phone) schema.telephone = phone;
  if (rating || reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating || 0,
      reviewCount: reviewCount || 0,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema for blog articles
export function ArticleSchema({
  title,
  description,
  url,
  publishedTime,
  author,
  image,
}: {
  title: string;
  description?: string;
  url: string;
  publishedTime?: string;
  author?: string;
  image?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url,
  };

  if (description) schema.description = description;
  if (publishedTime) schema.datePublished = publishedTime;
  if (author) {
    schema.author = { "@type": "Person", name: author };
  }
  if (image) schema.image = image;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema for breadcrumb navigation
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema for FAQ pages
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema for Q&A pages (Ask the Expert)
export function QAPageSchema({
  questions,
}: {
  questions: {
    question: string;
    answer?: string;
    author?: string;
    dateAsked?: string;
  }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      ...(q.author ? { author: { "@type": "Person", name: q.author } } : {}),
      ...(q.dateAsked ? { dateCreated: q.dateAsked } : {}),
      ...(q.answer
        ? {
            acceptedAnswer: {
              "@type": "Answer",
              text: q.answer,
            },
          }
        : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
