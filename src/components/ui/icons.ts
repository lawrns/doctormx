/**
 * Standardized Icon System for DoctorMX
 * Single source of truth for all icons using lucide-react
 */

// Core UI Icons
export {
  // Navigation & Actions
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  
  // User & Authentication
  User,
  Users,
  UserPlus,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  
  // Medical & Healthcare
  Stethoscope,
  Heart,
  HeartPulse,
  Activity,
  Pill,
  Syringe,
  Thermometer,
  Brain,
  Zap,
  Shield,
  ShieldCheck,
  Cross,
  
  // Communication
  Phone,
  PhoneCall,
  Mail,
  MessageSquare,
  MessageCircle,
  Send,
  Bell,
  BellRing,
  BellOff,
  
  // Files & Documents
  File,
  FileText,
  Download,
  Upload,
  Paperclip,
  Image,
  Camera,
  Video,
  Mic,
  MicOff,
  
  // Status & Feedback
  Check,
  CheckCircle,
  CheckCircle2,
  X as XIcon,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Star,
  
  // Navigation & Location
  Home,
  MapPin,
  Navigation,
  Compass,
  Globe,
  
  // Time & Calendar
  Clock,
  Calendar,
  CalendarDays,
  Timer,
  
  // Settings & Configuration
  Settings,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  
  // Social & External
  Facebook,
  Twitter,
  Instagram,
  Share,
  Share2,
  Link,
  
  // Business & Professional
  Award,
  Badge,
  FileBadge,
  Briefcase,
  Building,
  
  // Loading & States
  Loader,
  Loader2,
  RefreshCw,
  
  // Layout & Design
  Grid,
  List,
  Columns,
  Rows,
  Layout,
  
  // Mexican Cultural Icons (using existing Lucide icons)
  Flag, // For Mexican flag contexts
  Languages, // For language switching
  Banknote, // For peso/currency
  
  // Miscellaneous
  Bookmark,
  BookmarkPlus,
  Tag,
  Tags,
  Trash,
  Trash2,
  Edit,
  Edit2,
  Copy,
  Save,
  
} from 'lucide-react';

// Medical Specialty Icons (mapped to appropriate Lucide icons)
export {
  Heart as Cardiology,
  Brain as Neurology,
  Eye as Ophthalmology,
  Headphones as Otolaryngology,  // Using Headphones for ear-related
  Users as Pediatrics,  // Using Users for family/children care
  User as Psychiatry,
  Activity as Orthopedics,  // Using Activity for bone/movement
  Scissors as Surgery,
  Pill as Pharmacy,
  Activity as Emergency,
} from 'lucide-react';

// Size variants for consistent icon sizing
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48
} as const;

// Icon component props interface
export interface IconProps {
  size?: keyof typeof IconSizes | number;
  className?: string;
  'aria-label'?: string;
}

// Utility function to get icon size
export const getIconSize = (size: keyof typeof IconSizes | number = 'md'): number => {
  return typeof size === 'number' ? size : IconSizes[size];
};

// Mexican flag colors for cultural icons
export const MexicanColors = {
  green: '#006341',
  white: '#ffffff',
  red: '#CE1126'
} as const;