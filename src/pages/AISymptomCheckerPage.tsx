import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, AlertCircle, ChevronRight, Shield } from 'lucide-react';

function AISymptomCheckerPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Evaluación de Síntomas con IA</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestro asistente virtual te ayudará a entender tus síntomas y te guiará hacia la atención médica adecuada.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain size={48} className="text-blue-600" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
              <p className="text-gray-600">
                Nuestro sistema de IA analizará tus síntomas y te proporcionará recomendaciones personalizadas basadas en evidencia médica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Describe tus síntomas</h3>
                <p className="text-sm text-gray-600">
                  Responde algunas preguntas sobre lo que estás sintiendo
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Análisis de IA</h3>
                <p className="text-sm text-gray-600">
                  Nuestro sistema analiza tus respuestas y patrones
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Recomendaciones</h3>
                <p className="text-sm text-gray-600">
                  Recibe orientación y sugerencias de especialistas
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Link 
                to="/sintomas"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Comenzar evaluación
                <ChevronRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Importante</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Esta herramienta no sustituye una evaluación médica profesional. Si experimentas síntomas graves o una emergencia médica, busca atención médica inmediata o llama al número de emergencias.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Privacidad y Seguridad</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Tu información médica está protegida con los más altos estándares de seguridad y encriptación.
            </p>
            <Link 
              to="/privacidad"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Conoce más sobre nuestra política de privacidad
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Brain className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Tecnología Avanzada</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Nuestro sistema de IA está en constante aprendizaje y actualización con la más reciente evidencia médica.
            </p>
            <Link 
              to="/acerca"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Conoce más sobre nuestra tecnología
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISymptomCheckerPage;