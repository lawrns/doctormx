import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export interface CallToActionProps {
  title: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  background?: 'primary' | 'secondary' | 'accent' | 'gradient' | 'light';
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
  className?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  background = 'gradient',
  align = 'center',
  children,
  className = '',
}) => {
  const backgroundStyles = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-secondary-500 text-white',
    accent: 'bg-accent-500 text-white',
    gradient: 'bg-gradient-to-r from-primary-600 to-primary-800 text-white',
    light: 'bg-gray-50 text-gray-900',
  };

  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const primaryButtonStyles = background === 'light'
    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md'
    : 'bg-white hover:bg-gray-50 text-primary-600 shadow-md';

  const secondaryButtonStyles = background === 'light'
    ? 'bg-transparent border border-primary-500 text-primary-600 hover:bg-primary-50'
    : 'bg-transparent border border-white text-white hover:bg-white/10';

  return (
    <div className={`py-16 ${backgroundStyles[background]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-3xl mx-auto ${alignStyles[align]}`}>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-4"
          >
            {title}
          </motion.h2>
          
          {description && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl mb-8 opacity-90"
            >
              {description}
            </motion.p>
          )}
          
          {children}
          
          {(primaryButtonText || secondaryButtonText) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8"
            >
              {primaryButtonText && primaryButtonLink && (
                <Link
                  to={primaryButtonLink}
                  className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 ${primaryButtonStyles}`}
                >
                  {primaryButtonText}
                </Link>
              )}
              
              {secondaryButtonText && secondaryButtonLink && (
                <Link
                  to={secondaryButtonLink}
                  className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 ${secondaryButtonStyles}`}
                >
                  {secondaryButtonText}
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
