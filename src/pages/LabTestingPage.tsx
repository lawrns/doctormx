import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Beaker, Calendar, FileText, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import LabTestRequestForm from '../components/lab/LabTestRequestForm';
import AppointmentScheduler from '../components/lab/AppointmentScheduler';
import LabResultsViewer from '../components/lab/LabResultsViewer';
import Container from '../components/ui/Container';

// Step configuration with titles and descriptions
const steps = [
  {
    id: 'tests',
    title: 'Seleccionar Exámenes',
    description: 'Elige los exámenes de laboratorio que necesitas',
    icon: Beaker
  },
  {
    id: 'schedule',
    title: 'Programar Cita',
    description: 'Selecciona fecha, hora y lugar para la toma de muestra',
    icon: Calendar
  },
  {
    id: 'confirmation',
    title: 'Confirmación',
    description: 'Revisa y confirma tu solicitud de exámenes',
    icon: CheckCircle
  },
  {
    id: 'results',
    title: 'Resultados',
    description: 'Consulta tus resultados cuando estén disponibles',
    icon: FileText
  }
];

interface StepIndicatorProps {
  currentStep: string;
  goToStep: (step: string) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, goToStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div 
              className={`flex flex-col items-center ${index <= currentIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              onClick={() => index <= currentIndex && goToStep(step.id)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${step.id === currentStep 
                  ? 'bg-brand-jade-600 text-white' 
                  : index < currentIndex 
                    ? 'bg-brand-jade-100 text-brand-jade-600 border-2 border-brand-jade-600' 
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center hidden sm:block">{step.title}</span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${
                index < currentIndex ? 'bg-brand-jade-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Type for test request data
interface TestRequestData {
  tests: string[];
  instructions: string;
}

// Type for appointment data
interface AppointmentData {
  date: string;
  time: string;
  address: string;
  zipCode: string;
}

const LabTestingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string>('tests');
  const [testRequestData, setTestRequestData] = useState<TestRequestData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const requestId = params.get('requestId');
    
    if (tab) {
      if (tab === 'results' && requestId) {
        setRequestId(requestId);
        setCurrentStep('results');
      } else if (tab === 'catalog') {
        setCurrentStep('tests');
      } else if (tab === 'schedule') {
        setCurrentStep('schedule');
      }
    }
  }, [location]);
  
  const goToStep = (step: string) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };
  
  const handleNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1].id);
    }
  };
  
  const handlePrevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1].id);
    }
  };
  
  const handleTestSelection = (data: TestRequestData) => {
    setTestRequestData(data);
    handleNextStep();
  };
  
  const handleAppointmentScheduled = (data: AppointmentData, requestId: string) => {
    setAppointmentData(data);
    setRequestId(requestId);
    setIsSuccess(true);
    handleNextStep();
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'tests':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Selecciona tus exámenes</h2>
            <LabTestRequestForm 
              onSubmit={handleTestSelection}
              initialData={testRequestData}
            />
          </div>
        );
        
      case 'schedule':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Agenda tu cita</h2>
            {testRequestData ? (
              <AppointmentScheduler 
                testData={testRequestData}
                onScheduled={handleAppointmentScheduled}
                initialData={appointmentData}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Primero debes seleccionar los exámenes que deseas realizar.</p>
                <button
                  onClick={() => goToStep('tests')}
                  className="bg-brand-jade-600 text-white px-4 py-2 rounded-md font-medium"
                >
                  Seleccionar exámenes
                </button>
              </div>
            )}
          </div>
        );
        
      case 'confirmation':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Confirmación de tu solicitud</h2>
            
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">¡Cita programada con éxito!</h3>
                <p className="text-gray-600 mb-6">
                  Tu solicitud ha sido recibida y tu cita ha sido agendada. Uno de nuestros técnicos te visitará
                  {appointmentData && (
                    <span> el día <strong>{appointmentData.date}</strong> a las <strong>{appointmentData.time}</strong></span>
                  )}.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg mb-6 max-w-md mx-auto">
                  <h4 className="font-bold text-gray-900 mb-2">Detalles importantes:</h4>
                  <ul className="text-left text-gray-700 space-y-2">
                    <li>• ID de solicitud: <span className="font-mono font-medium">{requestId}</span></li>
                    <li>• Conserve su ID para consultar resultados</li>
                    <li>• El pago se realizará en efectivo durante la visita</li>
                    <li>• Tenga lista su identificación para la cita</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/')}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md font-medium"
                  >
                    Volver al inicio
                  </button>
                  <button
                    onClick={() => goToStep('results')}
                    className="bg-brand-jade-600 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Ver resultados
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Completa los pasos anteriores para confirmar tu solicitud.</p>
                <button
                  onClick={() => goToStep('tests')}
                  className="bg-brand-jade-600 text-white px-4 py-2 rounded-md font-medium"
                >
                  Comenzar proceso
                </button>
              </div>
            )}
          </div>
        );
        
      case 'results':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Resultados de tus exámenes</h2>
            <LabResultsViewer requestId={requestId} />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Container>
      <div className="py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exámenes de Laboratorio a Domicilio</h1>
          <p className="text-lg text-gray-600">
            Solicita tus exámenes de laboratorio y recibe atención en la comodidad de tu hogar
          </p>
        </div>
        
        <StepIndicator currentStep={currentStep} goToStep={goToStep} />
        
        {renderStepContent()}
        
        {currentStep !== 'confirmation' && currentStep !== 'results' && (
          <div className="flex justify-between mt-8">
            {currentStep !== 'tests' ? (
              <button
                onClick={handlePrevStep}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md font-medium flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </button>
            ) : (
              <div />
            )}
            
            {currentStep === 'tests' && testRequestData && (
              <button
                onClick={handleNextStep}
                className="bg-brand-jade-600 text-white px-4 py-2 rounded-md font-medium flex items-center"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default LabTestingPage;