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
  Bot: 'User',
  Mic: 'AlertCircle',
  Paperclip: 'Link',
  MessageCircle: 'MessageSquare',
  Smile: 'User',
  ThumbsUp: 'CheckCircle',
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
 * Social Media Icons and Custom Icons as SVG components
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
  ),
  
  Bot: (props) => (
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
      <rect width="18" height="10" x="3" y="11" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M10 10V8a2 2 0 1 1 4 0v2" />
      <line x1="10" x2="10" y1="16" y2="16" />
      <line x1="14" x2="14" y1="16" y2="16" />
    </svg>
  ),
  
  Mic: (props) => (
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
  ),
  
  Paperclip: (props) => (
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
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.47"></path>
    </svg>
  ),
  
  MessageCircle: (props) => (
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
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),

  MessageSquare: (props) => (
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),

  Smile: (props) => (
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
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),

  ThumbsUp: (props) => (
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
      <path d="M7 10v12"></path>
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
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
  ArrowRight,
  Send
} = LucideIcons;

export default {
  SafeIcon,
  getIcon,
  SocialIcons,
  // Re-export Lucide icons
  ...LucideIcons
};