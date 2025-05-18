import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Robot, Shield, Save, RotateCcw, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import AIService, { AICharacterProfile } from '../../core/services/ai/AIService';
import Container from '../../components/ui/Container';
import Section from '../../components/ui/Section';
import SEO from '../../core/components/SEO';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

const AICharacterSettingsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [characterProfile, setCharacterProfile] = useState<AICharacterProfile>(AIService.getCharacterProfile());
  const navigate = useNavigate();

  // Predefined password for accessing the settings
  const ADMIN_PASSWORD = 'doctor123'; // In production, this would be a proper auth system

  useEffect(() => {
    // Clear messages when component mounts
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMessage(null);
    } else {
      setErrorMessage('Contraseña incorrecta. Por favor intenta nuevamente.');
    }
  };

  const handleSaveChanges = () => {
    try {
      AIService.setCharacterProfile(characterProfile);
      setSuccessMessage('¡Cambios guardados exitosamente!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Error al guardar los cambios. Intenta nuevamente.');
    }
  };

  const handleResetToDefault = () => {
    const defaultProfile = AIService.resetCharacterProfile();
    setCharacterProfile(defaultProfile);
    setSuccessMessage('Configuración restablecida a los valores predeterminados.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-jade-50 to-white py-12">
        <SEO
          title="Configuración del Doctor IA | DoctorMX"
          description="Panel de administración para configurar el Doctor IA"
          keywords="admin, doctor IA, configuración, personalidad"
        />

        <Container>
          <motion.div
            className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-full bg-brand-jade-100">
                <Lock className="h-8 w-8 text-brand-jade-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Acceso Restringido
            </h1>

            <p className="text-gray-600 text-center mb-6">
              Ingresa la contraseña para acceder a la configuración del Doctor IA.
            </p>

            {errorMessage && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-jade-500"
                  placeholder="Ingresa la contraseña"
                  required
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-jade-600 text-white rounded-md hover:bg-brand-jade-700 focus:outline-none focus:ring-2 focus:ring-brand-jade-500 focus:ring-offset-2"
                >
                  Acceder
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-brand-jade-600 hover:text-brand-jade-800 text-sm"
              >
                Volver al inicio
              </button>
            </div>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-jade-50 to-white">
      <SEO
        title="Configuración del Doctor IA | DoctorMX"
        description="Panel de administración para configurar el Doctor IA"
        keywords="admin, doctor IA, configuración, personalidad"
      />

      <Section
        title="Configuración del Doctor IA"
        subtitle="Personaliza el comportamiento y características del asistente médico virtual"
        padding="lg"
        background="white"
      >
        <motion.div
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Admin header */}
          <div className="bg-brand-jade-600 text-white px-6 py-4 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-semibold">Panel de Administración</h2>
          </div>

          {/* Success message */}
          {successMessage && (
            <motion.div
              className="m-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p>{successMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {errorMessage && (
            <motion.div
              className="m-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{errorMessage}</p>
              </div>
            </motion.div>
          )}

          <div className="p-6">
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center mb-4">
                <Robot className="h-5 w-5 text-brand-jade-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">Personalidad y Comportamiento</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del doctor virtual
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={characterProfile.name}
                    onChange={(e) => setCharacterProfile({ ...characterProfile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-jade-500"
                  />
                </div>

                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    Especialización
                  </label>
                  <select
                    id="specialization"
                    value={characterProfile.specialization}
                    onChange={(e) => setCharacterProfile({ ...characterProfile, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-jade-500"
                  >
                    <option value="Medicina General">Medicina General</option>
                    <option value="Medicina Familiar">Medicina Familiar</option>
                    <option value="Medicina Interna">Medicina Interna</option>
                    <option value="Pediatría">Pediatría</option>
                    <option value="Dermatología">Dermatología</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Neurología">Neurología</option>
                    <option value="Psiquiatría">Psiquiatría</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="personality" className="block text-sm font-medium text-gray-700 mb-1">
                    Rasgos de personalidad
                  </label>
                  <textarea
                    id="personality"
                    value={characterProfile.personality}
                    onChange={(e) => setCharacterProfile({ ...characterProfile, personality: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-jade-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                    Tono de comunicación
                  </label>
                  <select
                    id="tone"
                    value={characterProfile.tone}
                    onChange={(e) => setCharacterProfile({ ...characterProfile, tone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-jade-500 mb-2"
                  >
                    <option value="Formal y tranquilizador">Formal y tranquilizador</option>
                    <option value="Amigable y cercano">Amigable y cercano</option>
                    <option value="Científico y detallado">Científico y detallado</option>
                    <option value="Comprensivo y empático">Comprensivo y empático</option>
                  </select>

                  <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
                    Estilo comunicativo
                  </label>
                  <select
                    id="style"
                    value={characterProfile.style}
                    onChange={(e) => setCharacterProfile({ ...characterProfile, style: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-jade-500"
                  >
                    <option value="Claro y directo">Claro y directo</option>
                    <option value="Detallado y explicativo">Detallado y explicativo</option>
                    <option value="Simple y conciso">Simple y conciso</option>
                    <option value="Descriptivo e ilustrativo">Descriptivo e ilustrativo</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 flex justify-between">
              <button
                onClick={handleResetToDefault}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-jade-500 focus:ring-offset-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer a valores predeterminados
              </button>

              <button
                onClick={handleSaveChanges}
                className="flex items-center px-4 py-2 bg-brand-jade-600 text-white rounded-md hover:bg-brand-jade-700 focus:outline-none focus:ring-2 focus:ring-brand-jade-500 focus:ring-offset-2"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-4 text-right">
              <button
                onClick={() => navigate('/doctor')}
                className="text-brand-jade-600 hover:text-brand-jade-800 text-sm"
              >
                Ir a la consulta virtual para probar los cambios
              </button>
            </motion.div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
};

export default AICharacterSettingsPage;