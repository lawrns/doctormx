import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Filter, Check, X, AlertCircle,
  ChevronDown, Star, MapPin, Video, Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

// Filter options
const specialtyOptions = [
  { value: '', label: 'Todas las especialidades' },
  { value: 'medicina-general', label: 'Medicina General' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'ginecologia', label: 'Ginecología' },
  // Add more specialties...
];

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente de verificación' },
  { value: 'verified', label: 'Verificado' },
  { value: 'rejected', label: 'Rechazado' }
];

function DoctorsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch doctors using @tanstack/react-query
  const { data: doctors = [], isLoading, error } = useQuery({
    queryKey: ['doctors', searchTerm, selectedSpecialty, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('doctors')
        .select(`
          *,
          specialties (name),
          locations (city, state),
          reviews (rating)
        `);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (selectedSpecialty) {
        query = query.eq('specialty', selectedSpecialty);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('verification_status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleVerifyDoctor = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ 
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', doctorId);

      if (error) throw error;
      // Refetch doctors
    } catch (err) {
      console.error('Error verifying doctor:', err);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Médicos</h1>
          <p className="text-gray-600">Administra y verifica los perfiles de médicos</p>
        </div>

        <Link 
          to="/admin/doctors/new"
          className="btn-primary"
        >
          Agregar médico
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter size={20} className="mr-2" />
            Filtros
            <ChevronDown size={16} className="ml-2" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                {specialtyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Doctors list */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando médicos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar los médicos</h3>
            <p className="text-red-600">Por favor, intenta de nuevo más tarde.</p>
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron médicos</h3>
          <p className="text-gray-600">Ajusta los filtros o agrega un nuevo médico.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {doctor.image_url ? (
                            <img
                              src={doctor.image_url}
                              alt={doctor.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{doctor.specialty}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-gray-400 mr-1" />
                        <span className="text-gray-900">{doctor.city}, {doctor.state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.verification_status === 'verified' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check size={12} className="mr-1" />
                          Verificado
                        </span>
                      ) : doctor.verification_status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle size={12} className="mr-1" />
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X size={12} className="mr-1" />
                          Rechazado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="text-gray-900">{doctor.rating || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/doctors/${doctor.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver detalles
                        </Link>
                        {doctor.verification_status === 'pending' && (
                          <button
                            onClick={() => handleVerifyDoctor(doctor.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Verificar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorsListPage;