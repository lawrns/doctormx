import React from 'react';
import { useLocation, Outlet, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Define the wizard step paths
const stepPaths = ['step-1', 'step-2', 'step-3'];

const WizardLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || '';
  const index = stepPaths.indexOf(currentPath);
  const stepIndex = index >= 0 ? index + 1 : 1;
  const totalSteps = stepPaths.length;
  const progress = (stepIndex / totalSteps) * 100;

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      {/* Progress Indicator */}
      <div className="flex items-center mb-6">
        <span className="font-medium">Paso {stepIndex} de {totalSteps}</span>
        <div className="flex-1 bg-gray-200 h-2 rounded-full ml-4 overflow-hidden">
          <motion.div
            className="bg-teal-600 h-2"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Animated Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WizardLayout;