// ======================================================
// IMPORTANT: THIS IS THE CANONICAL VERSION
// This is the current active implementation of AIDoctorPage.
// There's a deprecated version at:
// /src/pages/AIDoctorPage.tsx
// which just re-exports this component.
// Please make all changes to this file.
// ======================================================

import { useLocation } from 'react-router-dom';
import AIDoctor from '../components/AIDoctor';
// import AIDoctorFixed from '../components/AIDoctorFixed';
import SEO from '../../../core/components/SEO';
import ClientOnly from '../../../components/ClientOnly';
import { ConversationProvider } from '../../../contexts/ConversationContext';

function AIDoctorPage() {
  const location = useLocation();
  const initialMessage = location.state?.initialMessage;

  return (
    <>
      <SEO
        title="Doctor IA | Asistente médico inteligente con análisis de síntomas e imágenes"
        description="Consulta con nuestro asistente médico impulsado por IA. Describe tus síntomas, sube imágenes o usa tu voz para recibir orientación médica personalizada."
        canonical="/doctor"
        keywords="doctor ia, asistente médico, análisis de síntomas, análisis de imágenes médicas, inteligencia artificial médica, consulta médica online"
      />
      {/* Wrap AIDoctor with ClientOnly to prevent hydration mismatches */}
      <ClientOnly>
        <ConversationProvider>
          <AIDoctor initialMessage={initialMessage} />
        </ConversationProvider>
      </ClientOnly>
    </>
  );
}

export default AIDoctorPage;
