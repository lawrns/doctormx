import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  UserPlus,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Tabs, TabsContent, TabsList, TabsTrigger, Input } from '../ui';
import { supabase } from '../../lib/supabase';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: Date | null;
  nextAppointment?: Date | null;
  status?: 'active' | 'pending' | 'follow-up' | 'inactive';
  medicalRecords?: boolean;
  pendingResults?: boolean;
}

interface PatientManagementProps {
  doctorId: string;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ doctorId }) => {
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock patient data
  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'María López',
      email: 'maria@example.com',
      phone: '+52 55 1234 5678',
      lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      medicalRecords: true,
      pendingResults: true
    },
    {
      id: '2',
      name: 'Pedro Sánchez',
      email: 'pedro@example.com',
      phone: '+52 55 2345 6789',
      lastVisit: null,
      nextAppointment: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
      medicalRecords: false,
      pendingResults: false
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana@example.com',
      phone: '+52 55 3456 7890',
      lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextAppointment: null,
      status: 'follow-up',
      medicalRecords: true,
      pendingResults: true
    },
    {
      id: '4',
      name: 'Carlos González',
      email: 'carlos@example.com',
      phone: '+52 55 4567 8901',
      lastVisit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      nextAppointment: null,
      status: 'inactive',
      medicalRecords: true,
      pendingResults: false
    }
  ];
  
  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('patients')
        //   .select('*')
        //   .eq('doctor_id', doctorId);
        
        // if (error) throw error;
        
        // For now, use mock data
        setTimeout(() => {
          setPatients(mockPatients);
          setFilteredPatients(mockPatients);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [doctorId]);
  
  // Filter patients based on search query and active tab
  useEffect(() => {
    let filtered = [...patients];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(query) || 
        patient.email.toLowerCase().includes(query) ||
        (patient.phone && patient.phone.includes(query))
      );
    }
    
    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(patient => {
        if (activeTab === 'active' && patient.status === 'active') return true;
        if (activeTab === 'pending' && patient.status === 'pending') return true;
        if (activeTab === 'follow-up' && patient.status === 'follow-up') return true;
        if (activeTab === 'inactive' && patient.status === 'inactive') return true;
        if (activeTab === 'with-results' && patient.pendingResults) return true;
        return false;
      });
    }
    
    setFilteredPatients(filtered);
  }, [patients, searchQuery, activeTab]);
  
  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor-dashboard/patients/${patientId}`);
  };
  
  const handleNewAppointment = (patientId: string) => {
    navigate(`/doctor-dashboard/appointments/new?patient=${patientId}`);
  };
  
  const handleStartConsultation = (patientId: string) => {
    navigate(`/telemedicina/consulta/new?patient=${patientId}`);
  };
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Activo</span>;
      case 'pending':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Pendiente</span>;
      case 'follow-up':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Seguimiento</span>;
      case 'inactive':
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactivo</span>;
      default:
        return null;
    }
  };
  
  const renderLastVisit = (date: Date | null | undefined) => {
    if (!date) return 'Sin visitas previas';
    
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  };
  
  const renderNextAppointment = (date: Date | null | undefined) => {
    if (!date) return 'Sin citas programadas';
    
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 7) return `En ${diffDays} días`;
    if (diffDays < 30) return `En ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `En ${Math.floor(diffDays / 30)} meses`;
    return `En ${Math.floor(diffDays / 365)} años`;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 relative max-w-md">
          <Input
            placeholder="Buscar pacientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            icon={<Filter size={16} />}
          >
            Filtrar
          </Button>
          
          <Button 
            variant="primary" 
            icon={<UserPlus size={16} />}
            onClick={() => navigate('/doctor-dashboard/patients/new')}
          >
            Nuevo Paciente
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="all" className="rounded-md">
            Todos
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-md">
            Activos
          </TabsTrigger>
          <TabsTrigger value="follow-up" className="rounded-md">
            Seguimiento
          </TabsTrigger>
          <TabsTrigger value="with-results" className="rounded-md">
            Con resultados
          </TabsTrigger>
          <TabsTrigger value="inactive" className="rounded-md">
            Inactivos
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última visita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próxima cita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Cargando pacientes...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pacientes
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewPatient(patient.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          {patient.pendingResults && (
                            <div className="flex items-center mt-1">
                              <FileCheck size={14} className="text-amber-500 mr-1" />
                              <span className="text-xs text-amber-600">Resultados pendientes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderLastVisit(patient.lastVisit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderNextAppointment(patient.nextAppointment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(patient.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Calendar size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNewAppointment(patient.id);
                          }}
                          title="Agendar cita"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<MessageSquare size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartConsultation(patient.id);
                          }}
                          title="Iniciar consulta"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<FileText size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor-dashboard/patients/${patient.id}/records`);
                          }}
                          title="Expediente médico"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ChevronRight size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPatient(patient.id);
                          }}
                          title="Ver detalles"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Mostrando {filteredPatients.length} de {patients.length} pacientes
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;