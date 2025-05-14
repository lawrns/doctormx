import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.FC<any> | LucideIcon;
  color?: 'primary' | 'secondary' | 'accent' | 'blue';
  delay?: number;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  color = 'primary',
  delay = 0,
  className = '',
}) => {
  const colorClasses = {
    primary: {
      gradient: 'from-primary-600 to-primary-700',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600'
    },
    secondary: {
      gradient: 'from-secondary-600 to-secondary-700',
      iconBg: 'bg-secondary-100',
      iconColor: 'text-secondary-600'
    },
    accent: {
      gradient: 'from-accent-500 to-accent-600',
      iconBg: 'bg-accent-100',
      iconColor: 'text-accent-600'
    },
    blue: {
      gradient: 'from-blue-600 to-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}
      className={`bg-white rounded-xl shadow-sm p-6 transition-all relative overflow-hidden ${className}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedColor.gradient}`}></div>
      <div className={`w-12 h-12 rounded-lg ${selectedColor.iconBg} flex items-center justify-center mb-4`}>
        {React.isValidElement(Icon) ? Icon : <Icon className={selectedColor.iconColor} size={24} />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
