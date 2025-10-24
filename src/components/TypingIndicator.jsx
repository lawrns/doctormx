import { motion } from 'framer-motion';

export default function TypingIndicator() {
  const dotVariants = {
    hidden: { opacity: 0.4, y: 0 },
    visible: { opacity: 1, y: -10 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
      }
    }
  };

  return (
    <motion.div
      className="flex items-center gap-1.5 p-3 bg-white rounded-lg border border-ink-border w-fit"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Dr. Simeon avatar */}
      <div className="flex-shrink-0">
        <img
          src="/images/simeon.webp"
          alt="Dr. Simeon"
          className="w-6 h-6 rounded-full object-cover"
        />
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-gradient-to-b from-brand-400 to-brand-600 rounded-full"
            variants={dotVariants}
            initial="hidden"
            animate="animate"
            transition={{
              delay: i * 0.15,
              duration: 0.8,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="text-xs text-ink-muted ml-1"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Escribiendo...
      </motion.div>
    </motion.div>
  );
}
