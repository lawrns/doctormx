import React from 'react';
import * as LucideIcons from 'lucide-react';

// This function creates our own custom icon components
const createCustomIcon = (path) => {
  return (props) => (
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
      {path}
    </svg>
  );
};

// Define all custom icons
export const CustomIcons = {
  // Define AlertCircle icon
  AlertCircle: createCustomIcon(
    <>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </>
  ),
  
  // Define Bot icon
  Bot: createCustomIcon(
    <>
      <rect width="18" height="10" x="3" y="11" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M10 10V8a2 2 0 1 1 4 0v2" />
      <line x1="10" x2="10" y1="16" y2="16" />
      <line x1="14" x2="14" y1="16" y2="16" />
    </>
  ),
  
  // Define Brain icon (needed by Navbar.tsx)
  Brain: createCustomIcon(
    <>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4.04Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4.04Z"></path>
    </>
  ),
  
  // Define CheckCircle icon
  CheckCircle: createCustomIcon(
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </>
  ),
  
  // Define Info icon
  Info: createCustomIcon(
    <>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </>
  ),
  
  // Define MessageCircle icon
  MessageCircle: createCustomIcon(
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  ),

  // Define MessageSquare icon
  MessageSquare: createCustomIcon(
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  ),

  // Define Mic icon
  Mic: createCustomIcon(
    <>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </>
  ),
  
  // Define Moon icon
  Moon: createCustomIcon(
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  ),
  
  // Define Paperclip icon
  Paperclip: createCustomIcon(
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.47"></path>
  ),
  
  // Define Search icon
  Search: createCustomIcon(
    <>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </>
  ),

  // Define Shield icon
  Shield: createCustomIcon(
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  ),

  // Define Smile icon
  Smile: createCustomIcon(
    <>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </>
  ),

  // Define Sun icon
  Sun: createCustomIcon(
    <>
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </>
  ),

  // Define ThumbsUp icon
  ThumbsUp: createCustomIcon(
    <>
      <path d="M7 10v12"></path>
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
    </>
  )
};

// For backward compatibility
export const SocialIcons = CustomIcons;

// Create a function to safely get icons
const getSafeIcon = (name) => {
  try {
    return LucideIcons[name];
  } catch (error) {
    console.warn(`Icon ${name} not found:`, error);
    return null;
  }
};

// Export common icons safely - no try-catch at module level
export const Search = getSafeIcon('Search') || CustomIcons.Search;
export const Menu = getSafeIcon('Menu');
export const X = getSafeIcon('X');
export const User = getSafeIcon('User'); 
export const Calendar = getSafeIcon('Calendar');
export const LogOut = getSafeIcon('LogOut');
export const ChevronDown = getSafeIcon('ChevronDown');
export const ChevronRight = getSafeIcon('ChevronRight');
export const Facebook = getSafeIcon('Facebook');
export const Phone = getSafeIcon('Phone');
export const Mail = getSafeIcon('Mail');
export const MapPin = getSafeIcon('MapPin');
export const Star = getSafeIcon('Star');
export const Shield = getSafeIcon('Shield') || CustomIcons.Shield;
export const Clock = getSafeIcon('Clock');
export const Video = getSafeIcon('Video');
export const Leaf = getSafeIcon('Leaf');
export const Award = getSafeIcon('Award');
export const Globe = getSafeIcon('Globe');
export const Users = getSafeIcon('Users');
export const MessageCircle = getSafeIcon('MessageCircle') || CustomIcons.MessageCircle;
export const Stethoscope = getSafeIcon('Stethoscope');
export const Check = getSafeIcon('Check');
export const Info = getSafeIcon('Info') || CustomIcons.Info;
export const AlertCircle = getSafeIcon('AlertCircle') || CustomIcons.AlertCircle;
export const FileText = getSafeIcon('FileText');
export const Download = getSafeIcon('Download');
export const ArrowRight = getSafeIcon('ArrowRight');
export const Send = getSafeIcon('Send');

// Create a merged object of all available icons
const allIcons = {
  ...Object.fromEntries(
    Object.entries(LucideIcons).filter(([_, value]) => value !== undefined)
  ),
  ...CustomIcons
};

// Default export for convenience
export default allIcons;