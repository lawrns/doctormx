import { Metadata } from "next";
import { routing } from "@/i18n/routing";

const baseUrl = 'https://doctor.mx';

// I18N-007: SEO utility for generating locale-aware metadata
export interface SEOMetadataParams {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
}

/**
 * Generate metadata with proper hreflang tags and OpenGraph locale
 * @param params SEO metadata parameters
 * @param currentLocale Current locale ('es' or 'en')
 * @returns Next.js Metadata object
 */
export function generateSEOMetadata(
  params: SEOMetadataParams,
  currentLocale: string = 'es'
): Metadata {
  const {
    path,
    title,
    description,
    keywords,
    ogImage = "/og-image.png",
    ogImageAlt = "Doctor.mx - Telemedicina y Doctores Verificados en México",
    noIndex = false,
  } = params;

  // Build canonical URL for current locale
  const canonicalPath = currentLocale === 'en' && !path.startsWith('/en')
    ? `/en${path}`
    : path;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  // Generate hreflang alternates for all locales
  const languages: Record<string, string> = {};
  routing.locales.forEach((locale) => {
    // Remove any existing locale prefix from path
    const pathWithoutLocale = path.replace(/^\/(es|en)/, '');
    const localePath = locale === 'es'
      ? pathWithoutLocale || '/'
      : `/en${pathWithoutLocale || ''}`;
    languages[locale] = `${baseUrl}${localePath}`;
  });

  // Add x-default pointing to Spanish (default locale)
  const pathWithoutLocale = path.replace(/^\/(es|en)/, '');
  languages['x-default'] = `${baseUrl}${pathWithoutLocale || '/'}`;

  // Set OpenGraph locale based on current locale
  const ogLocale = currentLocale === 'en' ? 'en_US' : 'es_MX';

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords && { keywords }),
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // I18N-007: Hreflang tags for SEO
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    // I18N-007: Dynamic OpenGraph locale
    openGraph: {
      title,
      description,
      type: "website",
      locale: ogLocale,
      url: canonicalUrl,
      siteName: "Doctor.mx",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@doctormx",
      site: "@doctormx",
    },
  };
}

/**
 * Generate hreflang link tags for manual insertion in head
 * @param path Current path without locale prefix
 * @returns Array of link objects for head injection
 */
export function generateHreflangLinks(path: string = ''): Array<{ rel: string; hrefLang: string; href: string }> {
  const links: Array<{ rel: string; hrefLang: string; href: string }> = routing.locales.map((locale) => {
    const localePath = locale === 'es'
      ? path || '/'
      : `/en${path || ''}`;
    return {
      rel: 'alternate',
      hrefLang: locale,
      href: `${baseUrl}${localePath}`,
    };
  });
  
  // x-default for language/region independent matching
  links.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}${path || '/'}`,
  });
  
  return links;
}

/**
 * Get the locale-specific path for a given path and locale
 */
export function getLocalePath(path: string, locale: string): string {
  const pathWithoutLocale = path.replace(/^\/(es|en)/, '');
  return locale === 'es'
    ? pathWithoutLocale || '/'
    : `/en${pathWithoutLocale || ''}`;
}

/**
 * Generate sitemap entries with locale alternates
 */
export function generateSitemapEntries(
  paths: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }>
) {
  const now = new Date();
  const entries: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: number;
    alternates: {
      languages: Record<string, string>;
    };
  }> = [];

  paths.forEach(({ path, priority, changeFrequency }) => {
    routing.locales.forEach((locale) => {
      const urlPath = getLocalePath(path, locale);
      
      // Build alternate URLs for all locales
      const alternates: Record<string, string> = {};
      routing.locales.forEach((altLocale) => {
        alternates[altLocale] = `${baseUrl}${getLocalePath(path, altLocale)}`;
      });

      entries.push({
        url: `${baseUrl}${urlPath}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  return entries;
}
