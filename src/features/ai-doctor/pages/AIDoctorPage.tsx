import AIDoctor from '../components/AIDoctor';
import SEO from '../../../core/components/SEO';

function AIDoctorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
