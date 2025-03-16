import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  schema?: Record<string, any>;
  type?: string;
  noindex?: boolean;
  alternateLanguages?: {locale: string; url: string}[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'Doctor.mx | Encuentra médicos, comunidades de pacientes y agenda citas en línea',
  description = 'La plataforma líder de salud en México para encontrar médicos, agendar citas, comunidades de pacientes y consultas por telemedicina',
  canonical,
  image = '/Doctorlogo.png',
  schema,
  type = 'website',
  noindex = false,
  alternateLanguages = []
}) => {
  const siteUrl = 'https://doctor.mx';
  const url = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Doctor.mx" />
      <meta property="og:locale" content="es_MX" />
      
      {/* Alternate language tags */}
      {alternateLanguages.map((lang) => (
        <link 
          key={lang.locale} 
          rel="alternate" 
          hreflang={lang.locale} 
          href={lang.url} 
        />
      ))}
      <link rel="alternate" hreflang="es-mx" href={url} />
      <link rel="alternate" hreflang="x-default" href={url} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;