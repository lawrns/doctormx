import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import {
  Card,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Textarea,
  Badge
} from '../../components/ui';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  Edit,
  Trash,
  Plus,
  AlertCircle,
  Heart,
  ChevronRight,
  ChevronDown,
  Upload,
  Download,
  Printer,
  Share2,
  MessageSquare,
  Activity,
  BarChart2,
  Clipboard,
  Home,
  Info
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  insuranceProvider: string;
  insuranceNumber: string;
  notes: string;
  createdAt: Date;
  lastVisit: Date | null;
  status: 'active' | 'inactive';
}

interface Appointment {
  id: string;
  date: Date;
  type: string;
  status: 'completed' | 'cancelled' | 'no-show';
  summary: string;
}

interface MedicalRecord {
  id: string;
  date: Date;
  type: string;
  title: string;
  description: string;
  attachments: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date | null;
  status: 'active' | 'completed' | 'discontinued';
}

interface VitalSign {
  id: string;
  date: Date;
  type: string;
  value: number;
  unit: string;
}

interface Note {
  id: string;
  date: Date;
  content: string;
  isPrivate: boolean;
}

const PatientDetailPage: React.FC = () => {
  const { doctorId } = useAuth();
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  
  // Calculate patient age
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        if (!patientId || !doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          // Mock patient data
          const mockPatient: Patient = {
            id: patientId,
            name: 'María López Sánchez',
            email: 'maria.lopez@example.com',
            phone: '+52 55 1234 5678',
            dateOfBirth: '1985-06-15',
            gender: 'female',
            address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
            emergencyContact: 'Juan López (Esposo): +52 55 8765 4321',
            bloodType: 'O+',
            allergies: ['Penicilina', 'Sulfas', 'Mariscos'],
            chronicConditions: ['Hipertensión arterial', 'Diabetes tipo 2'],
            currentMedications: ['Metformina 850mg BID', 'Losartán 50mg QD'],
            insuranceProvider: 'Seguros Monterrey',
            insuranceNumber: 'SM-12345678',
            notes: 'Paciente con buen control de sus patologías crónicas. Adherencia adecuada a tratamiento.',
            createdAt: new Date('2022-01-15'),
            lastVisit: new Date('2023-03-10'),
            status: 'active'
          };
          
          // Mock appointments
          const mockAppointments: Appointment[] = [
            {
              id: 'app_1',
              date: new Date('2023-03-10T10:00:00'),
              type: 'Control rutinario',
              status: 'completed',
              summary: 'Paciente estable. Se ajustó dosis de Metformina a 850mg BID.'
            },
            {
              id: 'app_2',
              date: new Date('2023-01-20T15:30:00'),
              type: 'Consulta por cuadro respiratorio',
              status: 'completed',
              summary: 'Diagnóstico: Infección respiratoria alta. Tratamiento: Azitromicina 500mg QD x 3 días.'
            },
            {
              id: 'app_3',
              date: new Date('2022-11-05T09:00:00'),
              type: 'Control de diabetes',
              status: 'completed',
              summary: 'HbA1c: 7.2%. Buen control. Se mantiene tratamiento.'
            },
            {
              id: 'app_4',
              date: new Date('2022-09-15T11:30:00'),
              type: 'Control rutinario',
              status: 'no-show',
              summary: 'Paciente no se presentó a la cita.'
            }
          ];
          
          // Mock medical records
          const mockMedicalRecords: MedicalRecord[] = [
            {
              id: 'rec_1',
              date: new Date('2023-03-10'),
              type: 'Resultados de laboratorio',
              title: 'Perfil metabólico completo',
              description: 'Glucosa: 110 mg/dL, HbA1c: 7.2%, Colesterol total: 175 mg/dL, Triglicéridos: 130 mg/dL',
              attachments: 1
            },
            {
              id: 'rec_2',
              date: new Date('2023-02-05'),
              type: 'Estudios de imagen',
              title: 'Radiografía de tórax',
              description: 'Sin hallazgos patológicos. Índice cardiotorácico normal.',
              attachments: 2
            },
            {
              id: 'rec_3',
              date: new Date('2022-12-10'),
              type: 'Resultados de laboratorio',
              title: 'Perfil tiroideo',
              description: 'TSH: 2.5 mUI/L, T4 libre: 1.2 ng/dL. Función tiroidea normal.',
              attachments: 1
            }
          ];
          
          // Mock medications
          const mockMedications: Medication[] = [
            {
              id: 'med_1',
              name: 'Metformina',
              dosage: '850mg',
              frequency: 'Dos veces al día',
              startDate: new Date('2022-01-15'),
              endDate: null,
              status: 'active'
            },
            {
              id: 'med_2',
              name: 'Losartán',
              dosage: '50mg',
              frequency: 'Una vez al día',
              startDate: new Date('2022-01-15'),
              endDate: null,
              status: 'active'
            },
            {
              id: 'med_3',
              name: 'Azitromicina',
              dosage: '500mg',
              frequency: 'Una vez al día por 3 días',
              startDate: new Date('2023-01-20'),
              endDate: new Date('2023-01-23'),
              status: 'completed'
            }
          ];
          
          // Mock vital signs
          const mockVitalSigns: VitalSign[] = [
            // Blood pressure
            {
              id: 'vs_1',
              date: new Date('2023-03-10'),
              type: 'blood_pressure',
              value: 130,
              unit: 'mmHg'
            },
            {
              id: 'vs_2',
              date: new Date('2023-01-20'),
              type: 'blood_pressure',
              value: 135,
              unit: 'mmHg'
            },
            {
              id: 'vs_3',
              date: new Date('2022-11-05'),
              type: 'blood_pressure',
              value: 140,
              unit: 'mmHg'
            },
            
            // Heart rate
            {
              id: 'vs_4',
              date: new Date('2023-03-10'),
              type: 'heart_rate',
              value: 72,
              unit: 'bpm'
            },
            {
              id: 'vs_5',
              date: new Date('2023-01-20'),
              type: 'heart_rate',
              value: 75,
              unit: 'bpm'
            },
            {
              id: 'vs_6',
              date: new Date('2022-11-05'),
              type: 'heart_rate',
              value: 78,
              unit: 'bpm'
            },
            
            // Weight
            {
              id: 'vs_7',
              date: new Date('2023-03-10'),
              type: 'weight',
              value: 68.5,
              unit: 'kg'
            },
            {
              id: 'vs_8',
              date: new Date('2023-01-20'),
              type: 'weight',
              value: 69.2,
              unit: 'kg'
            },
            {
              id: 'vs_9',
              date: new Date('2022-11-05'),
              type: 'weight',
              value: 70.1,
              unit: 'kg'
            },
            
            // Glucose
            {
              id: 'vs_10',
              date: new Date('2023-03-10'),
              type: 'glucose',
              value: 110,
              unit: 'mg/dL'
            },
            {
              id: 'vs_11',
              date: new Date('2023-01-20'),
              type: 'glucose',
              value: 115,
              unit: 'mg/dL'
            },
            {
              id: 'vs_12',
              date: new Date('2022-11-05'),
              type: 'glucose',
              value: 120,
              unit: 'mg/dL'
            }
          ];
          
          // Mock notes
          const mockNotes: Note[] = [
            {
              id: 'note_1',
              date: new Date('2023-03-10'),
              content: 'Paciente con buen control de diabetes e hipertensión. Refiere adherencia adecuada al tratamiento. Sin efectos adversos a los medicamentos.',
              isPrivate: false
            },
            {
              id: 'note_2',
              date: new Date('2023-01-20'),
              content: 'Paciente con sintomatología respiratoria de 3 días de evolución. Afebril. Se indica Azitromicina por 3 días.',
              isPrivate: false
            },
            {
              id: 'note_3',
              date: new Date('2023-01-20'),
              content: 'NOTA PRIVADA: Sospecha de baja adherencia al tratamiento antihipertensivo. Discutir en próxima visita.',
              isPrivate: true
            }
          ];
          
          setPatient(mockPatient);
          setAppointments(mockAppointments);
          setMedicalRecords(mockMedicalRecords);
          setMedications(mockMedications);
          setVitalSigns(mockVitalSigns);
          setNotes(mockNotes);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId, doctorId]);
  
  // Add new note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: `note_${Date.now()}`,
      date: new Date(),
      content: newNote,
      isPrivate: isPrivateNote
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
    setIsPrivateNote(false);
  };
  
  // Delete note
  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };
  
  // Schedule appointment
  const handleScheduleAppointment = () => {
    navigate(`/doctor-dashboard/appointments/new?patientId=${patientId}`);
  };
  
  // Start consultation
  const handleStartConsultation = () => {
    navigate(`/doctor-dashboard/telemedicine/consultation?patientId=${patientId}`);
  };
  
  // Create prescription
  const handleCreatePrescription = () => {
    navigate(`/doctor-dashboard/prescriptions/new?patientId=${patientId}`);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get vital signs of specific type
  const getVitalSignsByType = (type: string) => {
    return vitalSigns
      .filter(vs => vs.type === type)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  
  return (
    <DashboardLayout title="Expediente del Paciente" loading={loading}>
      {patient && (
        <>
          <div className="mb-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                    {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                    <div className="flex flex-wrap items-center text-gray-500 mt-1">
                      <span className="mr-4">
                        {calculateAge(patient.dateOfBirth)} años
                      </span>
                      <span className="mr-4">
                        {patient.gender === 'female' ? 'Femenino' : patient.gender === 'male' ? 'Masculino' : 'Otro'}
                      </span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        Paciente activo
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    icon={<Calendar size={16} />}
                    onClick={handleScheduleAppointment}
                  >
                    Agendar Cita
                  </Button>
                  
                  <Button
                    variant="outline"
                    icon={<MessageSquare size={16} />}
                    onClick={handleStartConsultation}
                  >
                    Iniciar Consulta
                  </Button>
                  
                  <Button
                    variant="primary"
                    icon={<FileText size={16} />}
                    onClick={handleCreatePrescription}
                  >
                    Nueva Receta
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                {patient.chronicConditions.map((condition, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {condition}
                  </span>
                ))}
                
                {patient.allergies.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <AlertCircle size={14} className="mr-1" />
                    Alergias ({patient.allergies.length})
                  </span>
                )}
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">
                    Resumen
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    Historial Clínico
                  </TabsTrigger>
                  <TabsTrigger value="medications">
                    Medicamentos
                  </TabsTrigger>
                  <TabsTrigger value="vitals">
                    Signos Vitales
                  </TabsTrigger>
                  <TabsTrigger value="records">
                    Documentos
                  </TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview">
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Información Personal</h2>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => setEditMode(!editMode)}
                        >
                          {editMode ? 'Cancelar' : 'Editar'}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Información de contacto</h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <Mail size={16} className="text-gray-400 mr-2 mt-0.5" />
                              {editMode ? (
                                <Input
                                  value={patient.email}
                                  onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                                  className="max-w-xs"
                                />
                              ) : (
                                <p>{patient.email}</p>
                              )}
                            </div>
                            
                            <div className="flex items-start">
                              <Phone size={16} className="text-gray-400 mr-2 mt-0.5" />
                              {editMode ? (
                                <Input
                                  value={patient.phone}
                                  onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                                  className="max-w-xs"
                                />
                              ) : (
                                <p>{patient.phone}</p>
                              )}
                            </div>
                            
                            <div className="flex items-start">
                              <Home size={16} className="text-gray-400 mr-2 mt-0.5" />
                              {editMode ? (
                                <Textarea
                                  value={patient.address}
                                  onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                                  className="max-w-xs"
                                  rows={2}
                                />
                              ) : (
                                <p>{patient.address}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Información médica básica</h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <Calendar size={16} className="text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-gray-700">Fecha de nacimiento</p>
                                {editMode ? (
                                  <Input
                                    type="date"
                                    value={patient.dateOfBirth}
                                    onChange={(e) => setPatient({ ...patient, dateOfBirth: e.target.value })}
                                    className="max-w-xs mt-1"
                                  />
                                ) : (
                                  <p className="font-medium">{formatDate(new Date(patient.dateOfBirth))}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Heart size={16} className="text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-gray-700">Tipo de sangre</p>
                                {editMode ? (
                                  <Input
                                    value={patient.bloodType}
                                    onChange={(e) => setPatient({ ...patient, bloodType: e.target.value })}
                                    className="max-w-xs mt-1"
                                  />
                                ) : (
                                  <p className="font-medium">{patient.bloodType}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <AlertCircle size={16} className="text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-gray-700">Contacto de emergencia</p>
                                {editMode ? (
                                  <Input
                                    value={patient.emergencyContact}
                                    onChange={(e) => setPatient({ ...patient, emergencyContact: e.target.value })}
                                    className="max-w-xs mt-1"
                                  />
                                ) : (
                                  <p className="font-medium">{patient.emergencyContact}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {editMode && (
                        <div className="mt-6 flex justify-end">
                          <Button
                            variant="primary"
                            onClick={() => setEditMode(false)}
                          >
                            Guardar Cambios
                          </Button>
                        </div>
                      )}
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Alergias</h2>
                        
                        {patient.allergies.length > 0 ? (
                          <div className="space-y-2">
                            {patient.allergies.map((allergy, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-2 rounded bg-red-50"
                              >
                                <div className="flex items-center">
                                  <AlertCircle size={16} className="text-red-500 mr-2" />
                                  <span className="text-red-700">{allergy}</span>
                                </div>
                                
                                {editMode && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                    icon={<Trash size={16} />}
                                    onClick={() => {
                                      setPatient({
                                        ...patient,
                                        allergies: patient.allergies.filter((_, i) => i !== index)
                                      });
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No se han registrado alergias</p>
                        )}
                        
                        {editMode && (
                          <div className="mt-4 flex">
                            <Input
                              placeholder="Nueva alergia"
                              className="rounded-r-none"
                              value={newAllergy}
                              onChange={(e) => setNewAllergy(e.target.value)}
                            />
                            <Button
                              className="rounded-l-none"
                              onClick={() => {
                                if (newAllergy.trim()) {
                                  setPatient({
                                    ...patient,
                                    allergies: [...patient.allergies, newAllergy.trim()]
                                  });
                                  setNewAllergy('');
                                }
                              }}
                            >
                              Añadir
                            </Button>
                          </div>
                        )}
                      </Card>
                      
                      <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Condiciones Crónicas</h2>
                        
                        {patient.chronicConditions.length > 0 ? (
                          <div className="space-y-2">
                            {patient.chronicConditions.map((condition, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-2 rounded bg-blue-50"
                              >
                                <div className="flex items-center">
                                  <Activity size={16} className="text-blue-500 mr-2" />
                                  <span className="text-blue-700">{condition}</span>
                                </div>
                                
                                {editMode && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                    icon={<Trash size={16} />}
                                    onClick={() => {
                                      setPatient({
                                        ...patient,
                                        chronicConditions: patient.chronicConditions.filter((_, i) => i !== index)
                                      });
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No se han registrado condiciones crónicas</p>
                        )}
                        
                        {editMode && (
                          <div className="mt-4 flex">
                            <Input
                              placeholder="Nueva condición"
                              className="rounded-r-none"
                              value={newCondition}
                              onChange={(e) => setNewCondition(e.target.value)}
                            />
                            <Button
                              className="rounded-l-none"
                              onClick={() => {
                                if (newCondition.trim()) {
                                  setPatient({
                                    ...patient,
                                    chronicConditions: [...patient.chronicConditions, newCondition.trim()]
                                  });
                                  setNewCondition('');
                                }
                              }}
                            >
                              Añadir
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>
                    
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Próximas Citas</h2>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="flex items-center text-blue-800 font-medium">
                              <Calendar size={16} className="mr-2" />
                              Jueves, 28 de marzo, 10:00 AM
                            </div>
                            <p className="text-blue-600 mt-1">Control rutinario</p>
                          </div>
                          
                          <div className="flex items-center">
                            <Badge className="bg-blue-100 text-blue-800 mr-2">Confirmada</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              Detalles
                            </Button>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          className="w-full"
                          icon={<Calendar size={16} />}
                          onClick={handleScheduleAppointment}
                        >
                          Agendar nueva cita
                        </Button>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-semibold">Notas</h2>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download size={16} />}
                        >
                          Exportar notas
                        </Button>
                      </div>
                      
                      <div className="mb-4">
                        <Textarea
                          placeholder="Escribir nueva nota..."
                          rows={3}
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />
                        
                        <div className="flex justify-between mt-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="private-note"
                              checked={isPrivateNote}
                              onChange={(e) => setIsPrivateNote(e.target.checked)}
                              className="mr-2"
                            />
                            <label htmlFor="private-note" className="text-sm text-gray-700">
                              Nota privada (solo visible para ti)
                            </label>
                          </div>
                          
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                          >
                            Guardar Nota
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {notes.map((note) => (
                          <div 
                            key={note.id} 
                            className={`p-4 rounded-lg ${note.isPrivate ? 'bg-yellow-50' : 'bg-gray-50'}`}
                          >
                            <div className="flex justify-between">
                              <div className="flex items-center mb-2">
                                {note.isPrivate && (
                                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                                    Privada
                                  </span>
                                )}
                                <span className="text-sm text-gray-500">
                                  {formatDate(note.date)} a las {formatTime(note.date)}
                                </span>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500"
                                icon={<Trash size={16} />}
                                onClick={() => handleDeleteNote(note.id)}
                              />
                            </div>
                            
                            <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* History Tab */}
                <TabsContent value="history">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Historial de Consultas</h2>
                    
                    <div className="space-y-6">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{appointment.type}</h3>
                              <p className="text-sm text-gray-500">
                                {formatDate(appointment.date)} - {formatTime(appointment.date)}
                              </p>
                            </div>
                            
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status === 'completed' ? 'Completada' :
                                 appointment.status === 'cancelled' ? 'Cancelada' :
                                 'No asistió'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Resumen de la consulta</h4>
                            <p className="text-sm text-gray-600">{appointment.summary}</p>
                          </div>
                          
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-blue-600"
                              icon={<ChevronRight size={16} />}
                            >
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Medications Tab */}
                <TabsContent value="medications">
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Medicamentos Actuales</h2>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FileText size={16} />}
                        onClick={handleCreatePrescription}
                      >
                        Nueva Receta
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {medications
                        .filter(med => med.status === 'active')
                        .map((medication) => (
                          <div 
                            key={medication.id} 
                            className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500"
                          >
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">{medication.name} {medication.dosage}</h3>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                Activo
                              </span>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Frecuencia: {medication.frequency}</p>
                              <p>Inicio: {formatDate(medication.startDate)}</p>
                            </div>
                            
                            <div className="mt-3 flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Descontinuar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Historial de Medicamentos</h2>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ChevronDown size={16} />}
                        >
                          Mostrar todo
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {medications
                          .filter(med => med.status !== 'active')
                          .map((medication) => (
                            <div 
                              key={medication.id} 
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex justify-between">
                                <h3 className="font-medium text-gray-900">{medication.name} {medication.dosage}</h3>
                                <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                                  {medication.status === 'completed' ? 'Completado' : 'Descontinuado'}
                                </span>
                              </div>
                              
                              <div className="mt-2 text-sm text-gray-600">
                                <p>Frecuencia: {medication.frequency}</p>
                                <p>
                                  Periodo: {formatDate(medication.startDate)} - {
                                    medication.endDate ? formatDate(medication.endDate) : 'Actualmente'
                                  }
                                </p>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Vitals Tab */}
                <TabsContent value="vitals">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Presión Arterial (mmHg)</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getVitalSignsByType('blood_pressure').map(vs => ({
                              date: formatDate(vs.date),
                              value: vs.value
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[90, 160]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" name="Presión Sistólica" stroke="#8884d8" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-medium text-gray-900 mb-2">Últimas mediciones</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getVitalSignsByType('blood_pressure').slice(0, 3).map((vs, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(vs.date)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {vs.value} {vs.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Glucemia (mg/dL)</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getVitalSignsByType('glucose').map(vs => ({
                              date: formatDate(vs.date),
                              value: vs.value
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[80, 200]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" name="Glucosa" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-medium text-gray-900 mb-2">Últimas mediciones</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getVitalSignsByType('glucose').slice(0, 3).map((vs, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(vs.date)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {vs.value} {vs.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Peso (kg)</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getVitalSignsByType('weight').map(vs => ({
                              date: formatDate(vs.date),
                              value: vs.value
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[60, 80]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" name="Peso" stroke="#ff7300" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-medium text-gray-900 mb-2">Últimas mediciones</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getVitalSignsByType('weight').slice(0, 3).map((vs, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(vs.date)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {vs.value} {vs.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Frecuencia Cardíaca (bpm)</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getVitalSignsByType('heart_rate').map(vs => ({
                              date: formatDate(vs.date),
                              value: vs.value
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[60, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" name="Frecuencia Cardíaca" stroke="#8884d8" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="font-medium text-gray-900 mb-2">Últimas mediciones</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getVitalSignsByType('heart_rate').slice(0, 3).map((vs, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(vs.date)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {vs.value} {vs.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<Plus size={16} />}
                    >
                      Registrar nuevos signos vitales
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Records Tab */}
                <TabsContent value="records">
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold">Documentos y Resultados</h2>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Upload size={16} />}
                        >
                          Subir Documento
                        </Button>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Plus size={16} />}
                        >
                          Crear Informe
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {medicalRecords.map((record) => (
                        <div 
                          key={record.id} 
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center">
                                <FileText size={16} className="text-blue-500 mr-2" />
                                <h3 className="font-medium text-gray-900">{record.title}</h3>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(record.date)} · {record.type}
                              </p>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-3">
                                {record.attachments} archivo{record.attachments !== 1 ? 's' : ''}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<ChevronDown size={16} />}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-sm text-gray-700">{record.description}</p>
                          </div>
                          
                          <div className="mt-3 flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Download size={16} />}
                            >
                              Descargar
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Printer size={16} />}
                            >
                              Imprimir
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Share2 size={16} />}
                            >
                              Compartir
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center py-4">
                        <Button
                          variant="link"
                          className="text-blue-600"
                          icon={<ChevronDown size={16} />}
                        >
                          Cargar más documentos
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Información del Seguro</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Aseguradora</p>
                    <p className="font-medium">{patient.insuranceProvider}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Número de póliza</p>
                    <p className="font-medium">{patient.insuranceNumber}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    icon={<Edit size={16} />}
                  >
                    Actualizar información
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Resumen del Paciente</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de registro</span>
                    <span className="font-medium">{formatDate(patient.createdAt)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Última visita</span>
                    <span className="font-medium">
                      {patient.lastVisit ? formatDate(patient.lastVisit) : 'No registrado'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total de consultas</span>
                    <span className="font-medium">{appointments.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado del paciente</span>
                    <span className="font-medium text-green-600">Activo</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Cumplimiento con tratamiento</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="font-medium">75%</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Calendar size={16} />}
                    onClick={handleScheduleAppointment}
                  >
                    Agendar cita
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<MessageSquare size={16} />}
                    onClick={handleStartConsultation}
                  >
                    Iniciar consulta
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<FileText size={16} />}
                    onClick={handleCreatePrescription}
                  >
                    Crear receta
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Upload size={16} />}
                  >
                    Subir documento
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Clipboard size={16} />}
                  >
                    Plan de tratamiento
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default PatientDetailPage;