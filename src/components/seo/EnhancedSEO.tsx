import { Helmet } from 'react-helmet';

interface SEOProps {
  /**
   * Page title - should be unique, descriptive, and include keywords + brand
   */
  title?: string;
  /**
   * Meta description - should be compelling, include keywords, and be 120-160 characters
   */
  description?: string;
  /**
   * Canonical URL path (e.g., '/doctor/dr-name') - will be prefixed with site URL
   */
  canonical?: string;
  /**
   * Image URL for social sharing - must be at least 1200x630px for optimal sharing
   */
  image?: string;
  /**
   * Structured data schema objects following Schema.org specifications
   */
  schema?: Record<string, any> | Record<string, any>[];
  /**
   * Content type (website, article, profile, etc.)
   */
  type?: string;
  /**
   * Whether search engines should index the page
   */
  noindex?: boolean;
  /**
   * Alternative language versions of the page
   */
  alternateLanguages?: {locale: string; url: string}[];
  /**
   * Comma-separated keywords
   */
  keywords?: string;
  /**
   * Content author
   */
  author?: string;
  /**
   * ISO date when content was first published
   */
  publishedTime?: string;
  /**
   * ISO date when content was last modified
   */
  modifiedTime?: string;
  /**
   * Target city for local SEO
   */
  cityTarget?: string;
  /**
   * Target state for local SEO (two-letter code)
   */
  stateTarget?: string;
  /**
   * Related breadcrumbs for structured navigation
   */
  breadcrumbs?: Array<{name: string; url: string}>;
  /**
   * Video URL if the page contains a primary video
   */
  videoUrl?: string;
  /**
   * Paginated content information
   */
  pagination?: {
    current: number;
    total: number;
    nextUrl?: string;
    prevUrl?: string;
  };
}

/**
 * Enhanced SEO component that implements comprehensive metadata for doctors directory
 * including OpenGraph, Twitter Cards, JSON-LD structured data, and more.
 * 
 * This component includes optimization for:
 * - Search engines (Google, Bing)
 * - Social media sharing (Facebook, Twitter, LinkedIn)
 * - Local SEO
 * - Structured data for rich snippets
 * - Mobile optimization
 */
const EnhancedSEO: React.FC<SEOProps> = ({
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
  stateTarget,
  breadcrumbs,
  videoUrl,
  pagination
}) => {
  // Base configuration
  const siteUrl = 'https://doctor.mx';
  const siteName = 'Doctor.mx';
  const twitterHandle = '@doctormx';
  const url = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Prepare breadcrumb schema if provided
  const breadcrumbsSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Inicio',
        'item': siteUrl
      },
      ...breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': crumb.name,
        'item': `${siteUrl}${crumb.url}`
      }))
    ]
  } : null;

  // Prepare WebSite schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': siteUrl,
    'name': siteName,
    'description': 'La plataforma líder de salud en México para encontrar médicos y agendar citas',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/buscar?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // Prepare Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'url': siteUrl,
    'logo': `${siteUrl}/Doctorlogo.png`,
    'name': siteName,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+52-55-1234-5678',
      'contactType': 'customer service',
      'areaServed': 'MX',
      'availableLanguage': ['Spanish', 'English']
    },
    'sameAs': [
      'https://www.facebook.com/doctormx',
      'https://twitter.com/doctormx',
      'https://www.instagram.com/doctormx/',
      'https://www.linkedin.com/company/doctormx'
    ]
  };

  // Create combined schema array
  const combinedSchema = [];
  
  // Add base schemas
  combinedSchema.push(websiteSchema);
  combinedSchema.push(organizationSchema);
  
  // Add breadcrumbs schema if available
  if (breadcrumbsSchema) {
    combinedSchema.push(breadcrumbsSchema);
  }
  
  // Add user provided schema(s)
  if (schema) {
    if (Array.isArray(schema)) {
      combinedSchema.push(...schema);
    } else {
      combinedSchema.push(schema);
    }
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="es-MX" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Canonical Link - Adjusted for pagination */}
      {pagination ? (
        <link rel="canonical" href={pagination.current > 1 ? `${url.split('?')[0]}` : url} />
      ) : (
        <link rel="canonical" href={url} />
      )}
      
      {/* Robots Meta - Enhanced for more control */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && pagination && pagination.current > 1 ? (
        <meta name="robots" content="noindex,follow" />
      ) : !noindex ? (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      ) : null}
      
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Additional technical meta tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="referrer" content="origin-when-cross-origin" />
      
      {/* Local SEO tags */}
      {cityTarget && <meta name="geo.placename" content={cityTarget} />}
      {stateTarget && <meta name="geo.region" content={`MX-${stateTarget}`} />}
      {(cityTarget || stateTarget) && <meta name="geo.position" content="19.4326;-99.1332" />}
      {(cityTarget || stateTarget) && <meta name="ICBM" content="19.4326, -99.1332" />}
      
      {/* Open Graph Tags - Enhanced for various sharing scenarios */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="es_MX" />
      <meta property="og:locale:alternate" content="en_US" />
      {videoUrl && <meta property="og:video" content={videoUrl} />}
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
      
      {/* Pagination links for SEO */}
      {pagination && (
        <>
          {pagination.nextUrl && <link rel="next" href={`${siteUrl}${pagination.nextUrl}`} />}
          {pagination.prevUrl && <link rel="prev" href={`${siteUrl}${pagination.prevUrl}`} />}
        </>
      )}

      {/* Twitter Tags - Enhanced for better Twitter card display */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      
      {/* Mobile and Browser Specific */}
      <meta name="theme-color" content="#1E40AF" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Article-specific meta tags */}
      {type === 'article' && (
        <>
          <meta property="article:publisher" content="https://www.facebook.com/doctormx" />
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* JSON-LD Structured Data - Now with combined schema approach */}
      {combinedSchema.map((schemaItem, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaItem)}
        </script>
      ))}
    </Helmet>
  );
};

export default EnhancedSEO;