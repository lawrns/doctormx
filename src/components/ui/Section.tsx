import React, { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  centered?: boolean;
  withContainer?: boolean;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'white' | 'light' | 'brand' | 'gradient';
  animated?: boolean;
  className?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  centered = false,
  withContainer = true,
  containerSize = 'lg',
  padding = 'md',
  background = 'white',
  animated = true,
  className = '',
  ...props
}) => {
  // Background classes
  const backgroundClasses: Record<string, string> = {
    white: 'bg-white',
    light: 'bg-gray-50',
    brand: 'bg-brand-jade-50',
    gradient: 'bg-gradient-to-br from-brand-jade-50 to-white',
  };

  // Container size classes
  const containerSizeClasses: Record<string, string> = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  // Padding classes
  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'py-8',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
  };

  const sectionClasses = `
    ${backgroundClasses[background]}
    ${paddingClasses[padding]}
    ${className}
  `;

  const containerClasses = `
    ${withContainer ? 'mx-auto px-4 sm:px-6 lg:px-8' : ''}
    ${withContainer ? containerSizeClasses[containerSize] : ''}
    ${centered ? 'text-center' : ''}
  `;

  const headerAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const headerContent = (title || subtitle) && (
    <div className={`mb-10 ${centered ? 'mx-auto max-w-3xl' : ''}`}>
      {title && (
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          initial={animated ? 'hidden' : undefined}
          whileInView={animated ? 'visible' : undefined}
          viewport={{ once: true }}
          variants={headerAnimation}
        >
          {title}
        </motion.h2>
      )}
      {subtitle && (
        <motion.p
          className="text-xl text-gray-600"
          initial={animated ? { opacity: 0, y: -10 } : undefined}
          whileInView={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );

  return (
    <section className={sectionClasses} {...props}>
      <div className={containerClasses}>
        {headerContent}
        {children}
      </div>
    </section>
  );
};

export { Section };
export default Section;