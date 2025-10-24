import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  MapPin, 
  MessageCircle, 
  Save, 
  Share2, 
  Search,
  Calendar,
  Stethoscope,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const iconMap = {
  'severity_check': AlertCircle,
  'find_specialist': MapPin,
  'find_doctor': MapPin,
  'ask_follow_up': MessageCircle,
  'save_conversation': Save,
  'share_with_doctor': Share2,
  'book_appointment': Calendar,
  'view_details': Search,
  'emergency': AlertCircle,
  'select_specialty': Stethoscope,
  'help': HelpCircle,
  'more': ChevronRight
};

export default function ChipBar({ chips = [], onChipClick, isLoading }) {
  if (!chips || chips.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="w-full mt-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {chips.map((chip) => {
          const Icon = iconMap[chip.icon] || iconMap['help'];
          const isPrimary = chip.variant === 'primary';
          
          return (
            <motion.button
              key={chip.id}
              variants={itemVariants}
              onClick={() => onChipClick(chip.action)}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                whitespace-nowrap snap-start flex-shrink-0
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${isPrimary 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 hover:scale-105' 
                  : 'bg-white border border-ink-border text-ink-primary hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-700'
                }
              `}
              aria-label={chip.label}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="leading-tight">{chip.label}</span>
            </motion.button>
          );
        })}
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}

