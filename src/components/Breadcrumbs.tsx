import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from './icons';
import { generateBreadcrumbSchema } from '../lib/schemaGenerators';
import { Helmet } from 'react-helmet';

export interface BreadcrumbItem {
  name: string;
  url: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  /**
   * Array of breadcrumb items to display
   */
  items: BreadcrumbItem[];
  /**
   * Optional class name for additional styling
   */
  className?: string;
  /**
   * Whether to add schema data to the page head
   * @default true
   */
  addSchema?: boolean;
}

/**
 * Enhanced breadcrumb component that also inserts schema.org BreadcrumbList data
 * for improved SEO and structured data
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  addSchema = true
}) => {
  // Always include home as the first item if not already present
  const breadcrumbItems = items[0]?.url === '/' 
    ? items 
    : [{ name: 'Inicio', url: '/' }, ...items];

  // Generate schema.org BreadcrumbList for search engines and structured data
  const breadcrumbSchema = addSchema ? generateBreadcrumbSchema(
    breadcrumbItems.map(item => ({
      name: item.name,
      url: item.url
    }))
  ) : null;

  return (
    <>
      {/* Add schema.org data if enabled */}
      {addSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        </Helmet>
      )}

      {/* Visible breadcrumb navigation */}
      <nav className={`flex ${className}`} aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center text-sm">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <li key={item.url} className="flex items-center">
                {index > 0 && (
                  <ChevronRight 
                    size={16} 
                    className="mx-2 text-gray-400 flex-shrink-0" 
                    aria-hidden="true" 
                  />
                )}
                
                {isLast || item.isActive ? (
                  <span 
                    className="font-medium text-gray-700" 
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    to={item.url}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;