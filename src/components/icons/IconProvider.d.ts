import { SVGProps } from 'react';
import * as LucideIcons from 'lucide-react';

export const SafeIcon: React.FC<{ name: string } & React.SVGProps<SVGSVGElement>>;
export const getIcon: (name: string) => React.FC<React.SVGProps<SVGSVGElement>>;

export interface SocialIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const SocialIcons: {
  Twitter: React.FC<SocialIconProps>;
  Instagram: React.FC<SocialIconProps>;
  Brain: React.FC<SocialIconProps>;
  Bot: React.FC<SocialIconProps>;
  Mic: React.FC<SocialIconProps>;
  Paperclip: React.FC<SocialIconProps>;
  MessageCircle: React.FC<SocialIconProps>;
  MessageSquare: React.FC<SocialIconProps>;
  Smile: React.FC<SocialIconProps>;
  ThumbsUp: React.FC<SocialIconProps>;
};

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
}: typeof LucideIcons;

export default {
  SafeIcon,
  getIcon,
  SocialIcons,
  ...LucideIcons
};
