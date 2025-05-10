import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Users, Calendar, DollarSign, Award } from 'lucide-react';
import RevenueProjectionDashboard from '../components/connect/RevenueProjectionDashboard';
import PatientFlowVisualization from '../components/connect/PatientFlowVisualization';
import ComparativeSuccessStories from '../components/connect/ComparativeSuccessStories';

const ConnectLandingPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-blue-dark to-primary-blue py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Doctor.mx Connect
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Expanda su práctica médica y reciba referidos calificados a través de nuestra plataforma de IA líder en México.
            </p>
            <div className="mt-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/connect/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-blue bg-white hover:bg-gray-50 shadow-lg"
                >
                  Únase ahora
                  <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Beneficios para médicos</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Doctor.mx Connect le ofrece una forma innovadora de expandir su práctica médica y optimizar su agenda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary-blue" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Pacientes calificados</h3>
            <p className="text-gray-600">
              Reciba pacientes pre-evaluados por nuestra IA médica, con información relevante sobre sus síntomas y posibles diagnósticos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary-blue" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Optimización de agenda</h3>
            <p className="text-gray-600">
              Reduzca los tiempos muertos y maximice su disponibilidad con pacientes que realmente necesitan su especialidad.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-primary-blue" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ingresos adicionales</h3>
            <p className="text-gray-600">
              Aumente sus ingresos con un flujo constante de nuevos pacientes, sin costos de adquisición ni inversión en marketing.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Proyección de ingresos</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Vea cómo Doctor.mx Connect puede impactar sus ingresos mensuales según su especialidad y disponibilidad.
          </p>
        </div>

        <RevenueProjectionDashboard />
      </div>

      {/* Patient Flow */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Flujo de pacientes</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Entienda cómo los pacientes llegan a su consulta a través de nuestra plataforma de IA.
          </p>
        </div>

        <PatientFlowVisualization />
      </div>

      {/* Success Stories */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Historias de éxito</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Vea cómo otros médicos han mejorado su práctica con Doctor.mx Connect.
          </p>
        </div>

        <ComparativeSuccessStories />
      </div>

      {/* How it Works */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Cómo funciona</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Un proceso simple para comenzar a recibir pacientes calificados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Regístrese',
              description: 'Complete su perfil profesional con su especialidad, ubicación y horarios de atención.'
            },
            {
              step: '02',
              title: 'Verifique su licencia',
              description: 'Validamos sus credenciales médicas para garantizar la calidad de nuestra red.'
            },
            {
              step: '03',
              title: 'Configure preferencias',
              description: 'Indique qué tipos de pacientes y condiciones prefiere atender.'
            },
            {
              step: '04',
              title: 'Reciba pacientes',
              description: 'Comience a recibir referidos calificados directamente en su agenda.'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold">
                {item.step}
              </div>
              <div className="bg-white p-6 pt-10 rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-blue py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">Comience hoy mismo</h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Únase a la red de médicos de Doctor.mx y comience a recibir pacientes calificados.
          </p>
          <div className="mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/connect/register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-blue bg-white hover:bg-gray-50 shadow-lg"
              >
                Registrarse ahora
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectLandingPage;
