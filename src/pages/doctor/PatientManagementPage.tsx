import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Input,
  Badge
} from '../../components/ui';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  User, 
  ArrowUpDown, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  UserPlus,
  AlertCircle,
  Heart,
  FileText,
  Phone,
  Mail,
  MapPin,
  Upload,
  Download,
  Trash
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  lastVisit: Date | null;
  status: 'active' | 'inactive';
  chronicConditions: string[];
  allergies: string[];
  createdAt: Date;
}

type SortField = 'name' | 'lastVisit' | 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

const PatientManagementPage: React.FC = () => {
  const { doctorId } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Fetch patients data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          const mockPatients: Patient[] = [];
          
          // Generate 20 mock patients
          for (let i = 1; i <= 20; i++) {
            const gender = i % 3 === 0 ? 'male' : 'female';
            const lastVisitDays = i % 5 === 0 ? null : i * 5;
            const createdAtDays = 30 + i * 7;
            
            mockPatients.push({
              id: `pat_${i}`,
              name: gender === 'male' 
                ? ['Juan Pérez', 'Carlos Rodríguez', 'Luis Martínez', 'José García', 'Roberto Hernández'][i % 5] 
                : ['María López', 'Ana González', 'Laura Sánchez', 'Sofía Torres', 'Carmen Flores'][i % 5],
              email: `paciente${i}@example.com`,
              phone: `+52 55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
              age: 25 + i % 50,
              gender,
              lastVisit: lastVisitDays ? new Date(Date.now() - lastVisitDays * 24 * 60 * 60 * 1000) : null,
              status: i % 10 === 0 ? 'inactive' : 'active',
              chronicConditions: i % 3 === 0 
                ? ['Hipertensión', 'Diabetes tipo 2'] 
                : i % 3 === 1 
                  ? ['Asma'] 
                  : [],
              allergies: i % 4 === 0 
                ? ['Penicilina'] 
                : i % 4 === 1 
                  ? ['Sulfas', 'Látex'] 
                  : [],
              createdAt: new Date(Date.now() - createdAtDays * 24 * 60 * 60 * 1000)
            });
          }
          
          setPatients(mockPatients);
          filterAndSortPatients(mockPatients, searchTerm, statusFilter, sortField, sortDirection);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [doctorId]);
  
  // Filter and sort patients
  const filterAndSortPatients = (
    allPatients: Patient[],
    search: string,
    status: 'all' | 'active' | 'inactive',
    field: SortField,
    direction: SortDirection
  ) => {
    // Filter patients
    let filtered = allPatients;
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        patient => 
          patient.name.toLowerCase().includes(lowerSearch) ||
          patient.email.toLowerCase().includes(lowerSearch) ||
          patient.phone.includes(lowerSearch)
      );
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(patient => patient.status === status);
    }
    
    // Sort patients
    filtered.sort((a, b) => {
      if (field === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (field === 'lastVisit') {
        // Handle null values for lastVisit
        if (a.lastVisit === null && b.lastVisit === null) return 0;
        if (a.lastVisit === null) return direction === 'asc' ? 1 : -1;
        if (b.lastVisit === null) return direction === 'asc' ? -1 : 1;
        
        return direction === 'asc'
          ? a.lastVisit.getTime() - b.lastVisit.getTime()
          : b.lastVisit.getTime() - a.lastVisit.getTime();
      } else if (field === 'createdAt') {
        return direction === 'asc'
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
      } else if (field === 'status') {
        return direction === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      
      return 0;
    });
    
    setFilteredPatients(filtered);
  };
  
  // Handle search
  useEffect(() => {
    filterAndSortPatients(patients, searchTerm, statusFilter, sortField, sortDirection);
  }, [searchTerm, statusFilter, sortField, sortDirection, patients]);
  
  // Handle sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new field
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle patient click
  const handlePatientClick = (patient: Patient) => {
    navigate(`/doctor-dashboard/patients/${patient.id}`);
  };
  
  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Handle patient delete
  const handleDeletePatient = () => {
    if (!selectedPatient) return;
    
    // In a real implementation, delete from Supabase
    // For now, just update local state
    setPatients(patients.filter(p => p.id !== selectedPatient.id));
    setShowDeleteConfirmation(false);
    setSelectedPatient(null);
  };
  
  // Import patients
  const handleImportPatients = () => {
    // This would be implemented with a file upload in a real app
    setShowImportDialog(false);
    alert('La funcionalidad de importación se implementará próximamente.');
  };
  
  return (
    <DashboardLayout title="Gestión de Pacientes" loading={loading}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">Gestiona el expediente clínico de tus pacientes</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Upload size={16} />}
            onClick={() => setShowImportDialog(true)}
          >
            Importar
          </Button>
          
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/doctor-dashboard/patients/new')}
          >
            Nuevo Paciente
          </Button>
        </div>
      </div>
      
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar pacientes por nombre, correo o teléfono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            
            <Button
              variant="outline"
              icon={<Filter size={16} />}
            >
              Más filtros
            </Button>
          </div>
        </div>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Paciente
                    {sortField === 'name' && (
                      <ArrowUpDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastVisit')}
                >
                  <div className="flex items-center">
                    Última visita
                    {sortField === 'lastVisit' && (
                      <ArrowUpDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Estado
                    {sortField === 'status' && (
                      <ArrowUpDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            {patient.age} años • {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(patient.lastVisit)}</div>
                      <div className="text-sm text-gray-500">
                        {patient.lastVisit 
                          ? `${Math.round((new Date().getTime() - patient.lastVisit.getTime()) / (1000 * 60 * 60 * 24))} días` 
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={patient.status === 'active' ? 'success' : 'secondary'}
                      >
                        {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                      
                      {patient.chronicConditions.length > 0 && (
                        <div className="flex mt-1">
                          <Heart size={14} className="text-red-500 mr-1" />
                          <span className="text-xs text-gray-500">{patient.chronicConditions.length} condiciones</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<FileText size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor-dashboard/prescriptions/new?patientId=${patient.id}`);
                          }}
                        >
                          Receta
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Calendar size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor-dashboard/appointments/new?patientId=${patient.id}`);
                          }}
                        >
                          Cita
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<MoreHorizontal size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <User size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-lg">No se encontraron pacientes</p>
                    <p className="text-gray-400 mb-4">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Prueba con otros filtros de búsqueda'
                        : 'Comienza registrando a tus pacientes'}
                    </p>
                    <Button
                      variant="outline"
                      icon={<UserPlus size={16} />}
                      onClick={() => navigate('/doctor-dashboard/patients/new')}
                    >
                      Nuevo Paciente
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{filteredPatients.length}</span> de <span className="font-medium">{patients.length}</span> pacientes
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Importar Pacientes</h2>
            
            <p className="text-gray-600 mb-4">
              Sube un archivo CSV o Excel con la información de tus pacientes. Puedes descargar una plantilla para asegurarte de que el formato sea correcto.
            </p>
            
            <div className="flex justify-center mb-4">
              <Button
                variant="outline"
                icon={<Download size={16} />}
              >
                Descargar plantilla
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-4">
              <Upload size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                Arrastra y suelta tu archivo aquí o
              </p>
              <Button
                variant="outline"
                size="sm"
              >
                Seleccionar archivo
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Formatos aceptados: .csv, .xlsx
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleImportPatients}
              >
                Importar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <AlertCircle size={24} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Eliminar paciente</h2>
                <p className="text-gray-600 mt-1">
                  ¿Estás seguro de que deseas eliminar al paciente {selectedPatient.name}? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                icon={<Trash size={16} />}
                onClick={handleDeletePatient}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Patient Actions Menu */}
      {selectedPatient && !showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setSelectedPatient(null)}>
          <div className="absolute inset-0 bg-transparent"></div>
          <div className="bg-white rounded-lg shadow-xl w-64 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-sm font-medium truncate">{selectedPatient.name}</div>
            </div>
            
            <div className="p-2">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/doctor-dashboard/patients/${selectedPatient.id}`);
                }}
              >
                <User size={16} className="mr-3 text-gray-500" />
                Ver expediente
              </button>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/doctor-dashboard/prescriptions/new?patientId=${selectedPatient.id}`);
                }}
              >
                <FileText size={16} className="mr-3 text-gray-500" />
                Generar receta
              </button>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/doctor-dashboard/appointments/new?patientId=${selectedPatient.id}`);
                }}
              >
                <Calendar size={16} className="mr-3 text-gray-500" />
                Agendar cita
              </button>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${selectedPatient.phone}`);
                }}
              >
                <Phone size={16} className="mr-3 text-gray-500" />
                Llamar
              </button>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${selectedPatient.email}`);
                }}
              >
                <Mail size={16} className="mr-3 text-gray-500" />
                Enviar correo
              </button>
              
              <div className="border-t border-gray-200 my-1"></div>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirmation(true);
                }}
              >
                <Trash size={16} className="mr-3 text-red-500" />
                Eliminar paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientManagementPage;