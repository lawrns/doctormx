import React from 'react';
import AIDoctor from '../components/ai/AIDoctor';
import SEO from '../components/seo/SEO';

function AIDoctorPage() {
  return (
    <div>
      <SEO 
        title="Doctor IA | Asistente médico inteligente con análisis de síntomas e imágenes" 
        description="Consulta con nuestro asistente médico impulsado por IA. Describe tus síntomas, sube imágenes o usa tu voz para recibir orientación médica personalizada."
        canonical="/ai-doctor"
        keywords="doctor ia, asistente médico, análisis de síntomas, análisis de imágenes médicas, inteligencia artificial médica, consulta médica online"
      />
      <AIDoctor />
    </div>
  );
}

export default AIDoctorPage;
