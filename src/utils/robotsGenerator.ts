/**
 * Robots.txt generator utility for Doctor.mx
 * Creates a properly formatted robots.txt file with appropriate directives
 */

interface RobotsOptions {
  /**
   * Site domain (e.g., 'https://doctor.mx')
   */
  domain: string;
  /**
   * Path to the sitemap (e.g., '/sitemap.xml')
   */
  sitemapPath: string;
  /**
   * User agent rules to include
   */
  rules: RobotsRule[];
  /**
   * Additional custom directives to include
   */
  customDirectives?: string[];
}

interface RobotsRule {
  /**
   * User agent name ('*' for all bots)
   */
  userAgent: string;
  /**
   * Paths to allow
   */
  allow?: string[];
  /**
   * Paths to disallow
   */
  disallow?: string[];
  /**
   * Crawl delay (seconds)
   */
  crawlDelay?: number;
}

/**
 * Generates the content for a robots.txt file
 */
export function generateRobotsTxt(options: RobotsOptions): string {
  const lines: string[] = [];
  
  // Add each user agent rule
  options.rules.forEach(rule => {
    lines.push(`User-agent: ${rule.userAgent}`);
    
    // Add allow directives
    if (rule.allow && rule.allow.length > 0) {
      rule.allow.forEach(path => {
        lines.push(`Allow: ${path}`);
      });
    }
    
    // Add disallow directives
    if (rule.disallow && rule.disallow.length > 0) {
      rule.disallow.forEach(path => {
        lines.push(`Disallow: ${path}`);
      });
    }
    
    // Add crawl delay if specified
    if (rule.crawlDelay !== undefined) {
      lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    }
    
    // Add empty line between rules
    lines.push('');
  });
  
  // Add sitemap directive
  const sitemapUrl = options.sitemapPath.startsWith('http') 
    ? options.sitemapPath 
    : `${options.domain}${options.sitemapPath}`;
    
  lines.push(`Sitemap: ${sitemapUrl}`);
  
  // Add any custom directives
  if (options.customDirectives && options.customDirectives.length > 0) {
    lines.push('');
    options.customDirectives.forEach(directive => {
      lines.push(directive);
    });
  }
  
  return lines.join('\n');
}

/**
 * Creates a standard robots.txt configuration for Doctor.mx
 */
export function standardDoctorMxRobots(domain: string, sitemapPath: string): string {
  return generateRobotsTxt({
    domain,
    sitemapPath,
    rules: [
      // Google bots
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        crawlDelay: 1
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/']
      },
      {
        userAgent: 'Googlebot-Mobile',
        allow: ['/']
      },
      
      // Bing bots
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        crawlDelay: 1
      },
      
      // Other major bots
      {
        userAgent: 'DuckDuckBot',
        allow: ['/'],
        crawlDelay: 2
      },
      {
        userAgent: 'Slurp',
        allow: ['/'],
        crawlDelay: 2
      },
      
      // All other bots
      {
        userAgent: '*',
        allow: [
          '/$',
          '/doctor/',
          '/especialidad/',
          '/padecimiento/',
          '/ubicacion/',
          '/buscar',
          '/telemedicina'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/login$',
          '/register$',
          '/buscar?*', // Disallow search result pages with parameters
          '/*?ref=*', // Disallow referral parameters
          '/*&ref=*',
          '/*.json$', // Disallow direct access to JSON files
          '/*.xml$',  // Disallow direct access to XML files (except sitemap)
          '/*.md$',   // Disallow access to markdown files
          '/*.log$',  // Disallow access to log files
          '/*.txt$',  // Disallow access to text files (except robots.txt)
          '/assets/', // Disallow direct access to asset directories
          '/static/',
          '/temp/',
          '/tmp/',
          '/cache/'
        ],
        crawlDelay: 5
      }
    ],
    customDirectives: [
      '# Doctor.mx robots.txt',
      '# Last updated: ' + new Date().toISOString().split('T')[0],
      '# Sitemap index for all content types',
      `Sitemap: ${domain}/sitemap-index.xml`,
      '# Specific sitemaps',
      `Sitemap: ${domain}/sitemap-doctors.xml`,
      `Sitemap: ${domain}/sitemap-specialties.xml`,
      `Sitemap: ${domain}/sitemap-conditions.xml`,
      `Sitemap: ${domain}/sitemap-locations.xml`
    ]
  });
}