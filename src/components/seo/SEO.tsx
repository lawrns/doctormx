import React, { useEffect } from 'react';

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

  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph meta tags
    updateMetaTag('og:title', fullTitle);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', ogType);
    updateMetaTag('og:url', canonicalUrl);
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:site_name', 'Doctor.mx');
    updateMetaTag('og:locale', 'es_MX');
    
    // Update Twitter meta tags
    updateMetaTag('twitter:card', twitterCardType);
    updateMetaTag('twitter:site', '@doctormx');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    
    // Update canonical link
    updateCanonicalLink(canonicalUrl);
    
    // Clean up function
    return () => {
      // No cleanup needed as we'll handle updates in the next render
    };
  }, [fullTitle, description, canonicalUrl, keywords, ogType, ogImage, twitterCardType]);
  
  // Helper function to update meta tags
  const updateMetaTag = (name: string, content: string) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`) ||
                  document.querySelector(`meta[property="${name}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      if (name.startsWith('og:')) {
        metaTag.setAttribute('property', name);
      } else {
        metaTag.setAttribute('name', name);
      }
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  };
  
  // Helper function to update canonical link
  const updateCanonicalLink = (href: string) => {
    let linkTag = document.querySelector('link[rel="canonical"]');
    
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.setAttribute('rel', 'canonical');
      document.head.appendChild(linkTag);
    }
    
    linkTag.setAttribute('href', href);
  };

  // This component doesn't render anything visible
  return null;
};

export default SEO;