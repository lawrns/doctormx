'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96"
    >
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
