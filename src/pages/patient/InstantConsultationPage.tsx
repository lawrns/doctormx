import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConsultationMatchingService, ConsultationRequest } from '../../services/telemedicine/ConsultationMatchingService';
import { TelemedicineSessionService } from '../../services/telemedicine/TelemedicineSessionService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { 
  Search, 
  Clock, 
  DollarSign, 
  Users, 
  Video,
  AlertCircle,
  CheckCircle,
  Loader2,
  Heart,
  Brain,
  Eye,
  Stethoscope
} from 'lucide-react';

interface SymptomCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  symptoms: string[];
  specialty?: string;
}

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'general',
    name: 'Síntomas Generales',
    icon: Stethoscope,
    symptoms: ['Fiebre', 'Dolor de cabeza', 'Fatiga', 'Mareos', 'Náuseas']
  },
  {
    id: 'respiratory',
    name: 'Respiratorio',
    icon: Heart,
    symptoms: ['Tos', 'Dolor de garganta', 'Dificultad respirar', 'Congestión nasal'],
    specialty: 'Neumología'
  },
  {
    id: 'digestive',
    name: 'Digestivo',
    icon: Heart,
    symptoms: ['Dolor abdominal', 'Diarrea', 'Estreñimiento', 'Acidez'],
    specialty: 'Gastroenterología'
  },
  {
    id: 'mental',
    name: 'Salud Mental',
    icon: Brain,
    symptoms: ['Ansiedad', 'Depresión', 'Estrés', 'Insomnio'],
    specialty: 'Psiquiatría'
  },
  {
    id: 'eyes',
    name: 'Ojos',
    icon: Eye,
    symptoms: ['Dolor de ojos', 'Visión borrosa', 'Ojos rojos', 'Picazón'],
    specialty: 'Oftalmología'
  }
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Baja - No urgente', color: 'bg-green-100 text-green-800', description: 'Consulta de rutina' },
  { value: 'medium', label: 'Media - Normal', color: 'bg-yellow-100 text-yellow-800', description: 'Síntomas moderados' },
  { value: 'high', label: 'Alta - Urgente', color: 'bg-red-100 text-red-800', description: 'Requiere atención rápida' }
];

const InstantConsultationPage: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<'symptoms' | 'matching' | 'waiting' | 'session'>('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [preferredSpecialty, setPreferredSpecialty] = useState<string>('');
  const [consultationRequest, setConsultationRequest] = useState<ConsultationRequest | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(0);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get estimated wait time
  const updateEstimatedTime = async () => {
    const waitTime = await ConsultationMatchingService.getEstimatedWaitTime(
      preferredSpecialty,
      urgencyLevel
    );
    setEstimatedWaitTime(waitTime);
  };

  useEffect(() => {
    updateEstimatedTime();
  }, [preferredSpecialty, urgencyLevel]);

  // Toggle symptom selection
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Handle category selection
  const selectCategory = (category: SymptomCategory) => {
    setPreferredSpecialty(category.specialty || '');
  };

  // Start consultation request
  const startConsultation = async () => {
    if (!user?.id || selectedSymptoms.length === 0) {
      setError('Por favor selecciona al menos un síntoma');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setStep('matching');
      
      const request = await ConsultationMatchingService.createConsultationRequest(
        user.id,
        selectedSymptoms,
        description,
        urgencyLevel,
        preferredSpecialty,
        600 // 10 minutes max wait
      );

      if (!request) {
        throw new Error('No se pudo crear la solicitud de consulta');
      }

      setConsultationRequest(request);
      setStep('waiting');

      // Subscribe to consultation updates
      const subscription = ConsultationMatchingService.subscribeToMatching(
        user.id,
        (payload) => {
          console.log('Consultation update:', payload);
          if (payload.new.status === 'matched') {
            // Get session code and redirect
            handleConsultationMatched(payload.new.id);
          }
        }
      );

      // Set timeout for no match found
      setTimeout(() => {
        if (step === 'waiting') {
          setError('No se encontró un doctor disponible. Intenta más tarde.');
          subscription.unsubscribe();
        }
      }, 600000); // 10 minutes

    } catch (error) {
      console.error('Error starting consultation:', error);
      setError('Error al iniciar la consulta. Intenta nuevamente.');
      setStep('symptoms');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful consultation match
  const handleConsultationMatched = async (requestId: string) => {
    try {
      // Get the session code from the telemedicine session
      const sessions = await TelemedicineSessionService.getUserSessions(user!.id, 'patient', 'waiting');
      const session = sessions.find(s => s.consultation_request_id === requestId);
      
      if (session) {
        setSessionCode(session.session_code);
        setStep('session');
      }
    } catch (error) {
      console.error('Error getting session:', error);
      setError('Error al conectar con el doctor');
    }
  };

  // Cancel consultation
  const cancelConsultation = async () => {
    if (consultationRequest) {
      await ConsultationMatchingService.cancelConsultationRequest(consultationRequest.id);
      setStep('symptoms');
      setConsultationRequest(null);
      setError('');
    }
  };

  // Join session
  const joinSession = () => {
    if (sessionCode) {
      window.location.href = `/consultation/${sessionCode}`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso requerido</h2>
            <p className="text-gray-600">Debes iniciar sesión para solicitar una consulta.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Consulta Médica Instantánea
          </h1>
          <p className="text-gray-600">
            Conecta con doctores mexicanos verificados • Solo $50 MXN
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'symptoms' ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'symptoms' ? 'bg-teal-600 text-white' : 'bg-gray-200'
              }`}>1</div>
              <span className="hidden sm:block">Síntomas</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 'matching' || step === 'waiting' ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['matching', 'waiting'].includes(step) ? 'bg-teal-600 text-white' : 'bg-gray-200'
              }`}>2</div>
              <span className="hidden sm:block">Búsqueda</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 'session' ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'session' ? 'bg-teal-600 text-white' : 'bg-gray-200'
              }`}>3</div>
              <span className="hidden sm:block">Consulta</span>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Symptoms Selection */}
        {step === 'symptoms' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Symptom Categories */}
            <Card>
              <CardHeader>
                <CardTitle>¿Qué síntomas tienes?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {SYMPTOM_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.id} className="space-y-3">
                        <div 
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                          onClick={() => selectCategory(category)}
                        >
                          <Icon className="w-5 h-5 text-teal-600" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="space-y-1 pl-4">
                          {category.symptoms.map((symptom) => (
                            <label
                              key={symptom}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSymptoms.includes(symptom)}
                                onChange={() => toggleSymptom(symptom)}
                                className="text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm">{symptom}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom symptom input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Otros síntomas (opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Describe otros síntomas..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        toggleSymptom(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>

                {/* Selected symptoms */}
                {selectedSymptoms.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Síntomas seleccionados:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((symptom) => (
                        <Badge
                          key={symptom}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => toggleSymptom(symptom)}
                        >
                          {symptom} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Describe tu situación (opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Cuéntanos más detalles sobre tus síntomas, cuándo comenzaron, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Urgency Level */}
            <Card>
              <CardHeader>
                <CardTitle>Nivel de urgencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {URGENCY_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level.value}
                        checked={urgencyLevel === level.value}
                        onChange={(e) => setUrgencyLevel(e.target.value as any)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={level.color}>
                            {level.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consultation Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-teal-600" />
                      <span className="font-semibold">$50 MXN</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-teal-600" />
                      <span>~{Math.round(estimatedWaitTime / 60)} min de espera</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-teal-600" />
                      <span>Doctores verificados</span>
                    </div>
                  </div>
                  <Button
                    onClick={startConsultation}
                    disabled={selectedSymptoms.length === 0 || loading}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Buscar Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Matching */}
        {step === 'matching' && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="text-center p-8">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Buscando doctor disponible...</h3>
                <p className="text-gray-600">Estamos conectándote con el mejor doctor para tu caso</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Waiting */}
        {step === 'waiting' && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="text-center p-8">
                <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">En cola de espera</h3>
                <p className="text-gray-600 mb-4">
                  Tiempo estimado: ~{Math.round(estimatedWaitTime / 60)} minutos
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Te notificaremos cuando un doctor esté disponible
                </p>
                <Button
                  variant="outline"
                  onClick={cancelConsultation}
                >
                  Cancelar consulta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Session Ready */}
        {step === 'session' && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="text-center p-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">¡Doctor encontrado!</h3>
                <p className="text-gray-600 mb-4">
                  Tu consulta está lista. Código: <strong>{sessionCode}</strong>
                </p>
                <Button
                  onClick={joinSession}
                  className="bg-teal-600 hover:bg-teal-700 w-full"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Unirse a la consulta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantConsultationPage;