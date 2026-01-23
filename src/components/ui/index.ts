// UI Component exports - Unified Design System
export { 
  Button, 
  Input, 
  Select, 
  Textarea, 
  Card, 
  Badge, 
  Spinner, 
  Alert 
} from './unified-components';

// Icon System
export * from './icons';

// Accessibility Components
export {
  SkipToContent,
  SrOnly,
  FocusTrap,
  AccessibleImage,
  LiveRegion,
  ProgressBar,
  a11yUtils,
  useKeyboardNavigation,
  medicalAnnouncements
} from './accessibility';

// Responsive Components
export {
  useResponsive,
  ResponsiveContainer,
  ResponsiveGrid,
  TouchButton,
  MobileNav,
  ResponsiveText,
  ResponsiveMedicalImage,
  MedicalCard,
  responsiveUtils
} from './responsive';

// Mexican Branding Components
export {
  MexicanTrustBadge,
  MexicanHealthcareMetrics,
  MexicanDoctorCard,
  MexicanMedicalSpecialties,
  MexicanHealthcareHours,
  MexicanEmergencyBanner,
  mexicanGreetings
} from './mexican-branding';

// Performance Components
export {
  MedicalLoadingSpinner,
  SkeletonText,
  SkeletonCard,
  SkeletonDoctorCard,
  ProgressiveImage,
  LazyWrapper,
  VirtualizedList,
  DebouncedSearch,
  OptimizedTable,
  usePerformanceMonitor,
  useIntersectionObserver
} from './performance';

// UX Flow Components
export {
  MedicalErrorFallback,
  MedicalOnboarding,
  SuccessFlow,
  EnhancedBreadcrumbs,
  HelpSupport,
  Toast
} from './ux-flows';

// Trust Signal Components
export { default as TrustBar } from './TrustBar';
export { default as DoctorCredentials } from './DoctorCredentials';
export { default as PatientTestimonials } from './PatientTestimonials';

// CTA Components
export { default as FloatingWhatsAppButton } from './FloatingWhatsAppButton';
export { default as StickyMobileCTA } from './StickyMobileCTA';

// Legacy exports for backward compatibility
export { Button as LegacyButton } from './Button';
export { Card as LegacyCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { Container } from './Container';
export { default as LegacyBadge } from './Badge';
export { default as LegacyInput } from './Input';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { default as LegacyTextarea } from './Textarea';
export { default as Switch } from './Switch';