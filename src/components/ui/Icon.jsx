import React from 'react';
import {
  // Medical & Health
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  
  // Actions & Status
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  
  // Navigation & UI
  MagnifyingGlassIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  
  // Communication
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  
  // Business & Finance
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrophyIcon,
  
  // Technology
  CpuChipIcon,
  CloudIcon,
  ServerIcon,
  
  // General
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  
  // Targets & Navigation
  AcademicCapIcon as TargetIcon,
  AcademicCapIcon as RocketIcon,
  
  // File & Document
  DocumentIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  
  // Security & Compliance
  LockClosedIcon,
  KeyIcon,
  ShieldExclamationIcon,
  
  // Gamification
  GiftIcon,
  FireIcon,
  BoltIcon,
  
  // Specialty Icons
  AcademicCapIcon,
  BeakerIcon,
  BeakerIcon as LabIcon,
  HeartIcon as CardiologyIcon,
  AcademicCapIcon as NeurologyIcon,
  EyeIcon as OphthalmologyIcon,
  UserGroupIcon as GeneralMedicineIcon,
  
  // Outline versions
  HeartIcon as HeartOutlineIcon,
  StarIcon as StarOutlineIcon,
  CheckCircleIcon as CheckCircleOutlineIcon,
  XCircleIcon as XCircleOutlineIcon,
  ExclamationTriangleIcon as ExclamationTriangleOutlineIcon,
} from '@heroicons/react/24/outline';

import {
  // Solid versions for filled states
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
} from '@heroicons/react/24/solid';

// Icon mapping for easy replacement
const iconMap = {
  // Medical & Health
  '🏥': HeartIcon,
  '❤️': HeartIcon,
  '🫁': HeartIcon,
  '🦴': HeartIcon,
  '🧠': HeartIcon,
  '🦠': HeartIcon,
  '👩': UserGroupIcon,
  '🔬': BeakerIcon,
  '🍽️': HeartIcon,
  
  // Status & Actions
  '✅': CheckCircleIcon,
  '❌': XCircleIcon,
  '🚨': ExclamationTriangleIcon,
  '⚠️': ExclamationTriangleIcon,
  '🎯': TargetIcon,
  '🏆': TrophyIcon,
  '💳': CreditCardIcon,
  '📝': DocumentTextIcon,
  '🔍': MagnifyingGlassIcon,
  '🤖': CpuChipIcon,
  '📋': ClipboardDocumentListIcon,
  '🔧': CogIcon,
  '🚀': RocketIcon,
  '📡': ServerIcon,
  '⚙️': CogIcon,
  '🔐': LockClosedIcon,
  '🎉': GiftIcon,
  '📷': PhotoIcon,
  '🔄': ArrowPathIcon,
  '👨‍⚕️': UserGroupIcon,
  
  // Communication
  '💬': ChatBubbleLeftRightIcon,
  '📞': PhoneIcon,
  '📧': EnvelopeIcon,
  
  // Business
  '💰': CurrencyDollarIcon,
  '📊': ChartBarIcon,
  '📈': ChartBarIcon,
  '📉': ChartBarIcon,
  
  // Technology
  '☁️': CloudIcon,
  '🖥️': ServerIcon,
  '💻': ServerIcon,
  
  // General UI
  '⭐': StarIcon,
  '👁️': EyeIcon,
  '👁️‍🗨️': EyeIcon,
  '➕': PlusIcon,
  '➖': MinusIcon,
  '✏️': PencilIcon,
  '🗑️': TrashIcon,
  '⬆️': ArrowUpIcon,
  '⬇️': ArrowDownIcon,
  '⬅️': ArrowLeftIcon,
  '➡️': ArrowRightIcon,
  
  // Files
  '📄': DocumentIcon,
  '📁': DocumentIcon,
  '📤': CloudArrowUpIcon,
  
  // Security
  '🔒': LockClosedIcon,
  '🔑': KeyIcon,
  '🛡️': ShieldCheckIcon,
  
  // Gamification
  '🎁': GiftIcon,
  '🔥': FireIcon,
  '⚡': BoltIcon,
  '🏅': TrophyIcon,
  
  // Specialty Medicine
  '🎓': AcademicCapIcon,
  '🧪': BeakerIcon,
};

// Fallback icons for unmapped emojis
const fallbackIconMap = {
  'target': TargetIcon,
  'rocket': RocketIcon,
  'arrow-path': ArrowPathIcon,
};

// Icon component with size and color variants
const Icon = ({ 
  name, 
  size = 'md', 
  color = 'current', 
  variant = 'outline',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  const colorClasses = {
    current: 'text-current',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  // Handle emoji names (legacy support)
  let IconComponent = iconMap[name];
  
  // Handle icon names
  if (!IconComponent) {
    // Try to find icon by name in the imports
    const iconName = name.charAt(0).toUpperCase() + name.slice(1) + 'Icon';
    
    // Safe icon mapping instead of eval
    const safeIconMap = {
      'HeartIcon': HeartIcon,
      'ShieldCheckIcon': ShieldCheckIcon,
      'UserGroupIcon': UserGroupIcon,
      'DocumentTextIcon': DocumentTextIcon,
      'ClipboardDocumentListIcon': ClipboardDocumentListIcon,
      'CheckCircleIcon': CheckCircleIcon,
      'XCircleIcon': XCircleIcon,
      'ExclamationTriangleIcon': ExclamationTriangleIcon,
      'InformationCircleIcon': InformationCircleIcon,
      'ClockIcon': ClockIcon,
      'MagnifyingGlassIcon': MagnifyingGlassIcon,
      'CogIcon': CogIcon,
      'Bars3Icon': Bars3Icon,
      'XMarkIcon': XMarkIcon,
      'ChevronDownIcon': ChevronDownIcon,
      'ChevronRightIcon': ChevronRightIcon,
      'ChatBubbleLeftRightIcon': ChatBubbleLeftRightIcon,
      'PhoneIcon': PhoneIcon,
      'EnvelopeIcon': EnvelopeIcon,
      'CreditCardIcon': CreditCardIcon,
      'CurrencyDollarIcon': CurrencyDollarIcon,
      'ChartBarIcon': ChartBarIcon,
      'TrophyIcon': TrophyIcon,
      'CpuChipIcon': CpuChipIcon,
      'CloudIcon': CloudIcon,
      'ServerIcon': ServerIcon,
      'StarIcon': StarIcon,
      'EyeIcon': EyeIcon,
      'EyeSlashIcon': EyeSlashIcon,
      'PlusIcon': PlusIcon,
      'MinusIcon': MinusIcon,
      'PencilIcon': PencilIcon,
      'TrashIcon': TrashIcon,
      'ArrowUpIcon': ArrowUpIcon,
      'ArrowDownIcon': ArrowDownIcon,
      'ArrowLeftIcon': ArrowLeftIcon,
      'ArrowRightIcon': ArrowRightIcon,
      'ArrowPathIcon': ArrowPathIcon,
      'TargetIcon': TargetIcon,
      'RocketIcon': RocketIcon,
      'DocumentIcon': DocumentIcon,
      'PhotoIcon': PhotoIcon,
      'CloudArrowUpIcon': CloudArrowUpIcon,
      'LockClosedIcon': LockClosedIcon,
      'KeyIcon': KeyIcon,
      'ShieldExclamationIcon': ShieldExclamationIcon,
      'GiftIcon': GiftIcon,
      'FireIcon': FireIcon,
      'BoltIcon': BoltIcon,
      'AcademicCapIcon': AcademicCapIcon,
      'BeakerIcon': BeakerIcon,
      'CardiologyIcon': CardiologyIcon,
      'NeurologyIcon': NeurologyIcon,
      'OphthalmologyIcon': OphthalmologyIcon,
      'GeneralMedicineIcon': GeneralMedicineIcon,
    };
    
    IconComponent = safeIconMap[iconName] || fallbackIconMap[name] || DocumentIcon;
  }

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.current;

  return (
    <IconComponent
      className={`${sizeClass} ${colorClass} ${className}`}
      {...props}
    />
  );
};

// Convenience components for common icons
export const MedicalIcon = (props) => <Icon name="heart" {...props} />;
export const SuccessIcon = (props) => <Icon name="check-circle" {...props} />;
export const ErrorIcon = (props) => <Icon name="x-circle" {...props} />;
export const WarningIcon = (props) => <Icon name="exclamation-triangle" {...props} />;
export const InfoIcon = (props) => <Icon name="information-circle" {...props} />;
export const LoadingIcon = (props) => <Icon name="clock" {...props} />;
export const SearchIcon = (props) => <Icon name="magnifying-glass" {...props} />;
export const SettingsIcon = (props) => <Icon name="cog" {...props} />;
export const MenuIcon = (props) => <Icon name="bars-3" {...props} />;
export const CloseIcon = (props) => <Icon name="x-mark" {...props} />;
export const StarIconComponent = (props) => <Icon name="star" {...props} />;
export const TrophyIconComponent = (props) => <Icon name="trophy" {...props} />;
// Convenience components for commonly used icons (avoiding duplicates with imports)
export const ChatIcon = (props) => <Icon name="chat-bubble-left-right" {...props} />;
export const EmailIcon = (props) => <Icon name="envelope" {...props} />;
export const ShieldIcon = (props) => <Icon name="shield-check" {...props} />;
export const LockIcon = (props) => <Icon name="lock-closed" {...props} />;
export const CpuIcon = (props) => <Icon name="cpu-chip" {...props} />;

export default Icon;
