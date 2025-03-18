import React from 'react';
import * as LucideIcons from 'lucide-react';

// Mapping for icons that might have different names or missing in some versions
const ICON_FALLBACKS = {
  // Add fallbacks for missing icons
  Brain: 'Search',
  Activity: 'Search',
  ActivitySquare: 'Search',
  Instagram: 'Share2',
  Twitter: 'Share2',
  // Add more mappings as needed
};

/**
 * A component that safely renders a Lucide icon with fallbacks
 * @param {string} name - The name of the icon to render
 * @param {object} props - Additional props to pass to the icon
 */
export const SafeIcon = ({ name, ...props }) => {
  // Check if the icon exists in the current version
  if (LucideIcons[name]) {
    const Icon = LucideIcons[name];
    return <Icon {...props} />;
  }
  
  // Check if we have a fallback for this icon
  if (ICON_FALLBACKS[name] && LucideIcons[ICON_FALLBACKS[name]]) {
    const FallbackIcon = LucideIcons[ICON_FALLBACKS[name]];
    return <FallbackIcon {...props} />;
  }
  
  // Provide an emergency fallback
  console.warn(`Icon '${name}' not found and no fallback available.`);
  return <span className="icon-fallback" {...props} />;
};

/**
 * Get a specific icon component
 * @param {string} name - Icon name
 * @returns {React.Component} - Icon component or fallback
 */
export const getIcon = (name) => {
  // First, check if the icon exists in the current version
  if (LucideIcons[name]) {
    return LucideIcons[name];
  }
  
  // Check if we have a fallback for this icon
  if (ICON_FALLBACKS[name] && LucideIcons[ICON_FALLBACKS[name]]) {
    return LucideIcons[ICON_FALLBACKS[name]];
  }
  
  // Return a simple component that renders nothing
  return (props) => <span className="icon-fallback" {...props} />;
};

/**
 * Social Media Icons as SVG components
 */
export const SocialIcons = {
  Twitter: (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={props.color || "currentColor"} 
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  ),
  
  Instagram: (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={props.color || "currentColor"} 
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={props.className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  
  Brain: (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={props.color || "currentColor"} 
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4.04Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4.04Z"></path>
    </svg>
  )
};

// Export Lucide icons that we know are available
export const {
  Search,
  Menu,
  X,
  User,
  Calendar,
  LogOut,
  ChevronDown,
  ChevronRight,
  Facebook,
  Phone,
  Mail,
  MapPin,
  Star,
  Shield,
  Clock,
  Video,
  Leaf,
  Award,
  Globe,
  Users,
  MessageCircle,
  Stethoscope,
  Check,
  Info,
  AlertCircle,
  FileText,
  Download,
  ArrowRight
} = LucideIcons;

export default {
  SafeIcon,
  getIcon,
  SocialIcons,
  // Re-export Lucide icons
  ...LucideIcons
};