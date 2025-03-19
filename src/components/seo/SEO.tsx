import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterCardType?: 'summary' | 'summary_large_image';
}

const SEO: React.FC<SEOProps> = ({
  title = 'Doctor.mx - Encuentra médicos especialistas en México',
  description = 'Conectamos pacientes con los mejores médicos especialistas de México. Agenda citas fácilmente y recibe atención médica de calidad.',
  canonicalUrl = 'https://doctor.mx',
  keywords = 'médicos, doctores, especialistas, citas médicas, salud, México, telemedicina',
  ogType = 'website',
  ogImage = 'https://doctor.mx/images/doctor-mx-social.jpg',
  twitterCardType = 'summary_large_image',
}) => {
  const siteTitle = 'Doctor.mx';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Doctor.mx" />
      <meta property="og:locale" content="es_MX" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCardType} />
      <meta name="twitter:site" content="@doctormx" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Doctor.mx" />
      <meta name="application-name" content="Doctor.mx" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
    </Helmet>
  );
};

export default SEO;