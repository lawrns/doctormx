// ======================================================
// IMPORTANT: THIS IS THE CANONICAL VERSION
// This is the current active implementation of AIDoctorPage.
// There's a deprecated version at:
// /src/pages/AIDoctorPage.tsx
// which just re-exports this component.
// Please make all changes to this file.
// ======================================================

import AIDoctor from '../components/AIDoctor';
import SEO from '../../../core/components/SEO';

function AIDoctorPage() {
  return (
    <>
      <SEO
        title="Doctor IA | Asistente médico inteligente con análisis de síntomas e imágenes"
        description="Consulta con nuestro asistente médico impulsado por IA. Describe tus síntomas, sube imágenes o usa tu voz para recibir orientación médica personalizada."
        canonical="/doctor"
        keywords="doctor ia, asistente médico, análisis de síntomas, análisis de imágenes médicas, inteligencia artificial médica, consulta médica online"
      />
      <AIDoctor />
    </>
  );
}

export default AIDoctorPage;
