import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  schema?: Record<string, any> | Record<string, any>[];
  type?: string;
  noindex?: boolean;
  alternateLanguages?: {locale: string; url: string}[];
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  cityTarget?: string;
  stateTarget?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Doctor.mx | Encuentra médicos, comunidades de pacientes y agenda citas en línea',
  description = 'La plataforma líder de salud en México para encontrar médicos, agendar citas, comunidades de pacientes y consultas por telemedicina',
  canonical,
  image = '/Doctorlogo.png',
  schema,
  type = 'website',
  noindex = false,
  alternateLanguages = [],
  keywords = 'médicos, doctores, telemedicina, citas médicas, especialistas, salud, México',
  author = 'Doctor.mx',
  publishedTime,
  modifiedTime,
  cityTarget,
  stateTarget
}) => {
  const siteUrl = 'https://doctor.mx';
  const url = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="es-MX" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && <meta name="robots" content="index,follow" />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {cityTarget && <meta name="geo.placename" content={cityTarget} />}
      {stateTarget && <meta name="geo.region" content={`MX-${stateTarget}`} />}
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Doctor.mx" />
      <meta property="og:locale" content="es_MX" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
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
      <meta name="twitter:site" content="@doctormx" />
      
      {/* Mobile and Browser Specific */}
      <meta name="theme-color" content="#1E40AF" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* JSON-LD Structured Data */}
      {schema && Array.isArray(schema) ? (
        schema.map((schemaItem, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schemaItem)}
          </script>
        ))
      ) : schema ? (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ) : null}
    </Helmet>
  );
};

export default SEO;