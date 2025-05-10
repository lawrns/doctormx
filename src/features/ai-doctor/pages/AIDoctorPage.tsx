import React from 'react';
import AIDoctor from '../components/AIDoctor';
import SEO from '../../../core/components/SEO';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

function AIDoctorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 hidden md:flex items-center"
      >
        <div className="bg-white p-2 rounded-full shadow-lg">
          <User size={40} className="text-primary-blue" />
        </div>
      </motion.div>
      <SEO 
        title="Doctor IA | Asistente médico inteligente con análisis de síntomas e imágenes" 
        description="Consulta con nuestro asistente médico impulsado por IA. Describe tus síntomas, sube imágenes o usa tu voz para recibir orientación médica personalizada."
        canonical="/doctor"
        keywords="doctor ia, asistente médico, análisis de síntomas, análisis de imágenes médicas, inteligencia artificial médica, consulta médica online"
      />
      <AIDoctor />
    </div>
  );
}

export default AIDoctorPage;
