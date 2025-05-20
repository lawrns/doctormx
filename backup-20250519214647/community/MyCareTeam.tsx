import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Video, MessageSquare, Calendar, ExternalLink } from 'lucide-react';
import { getPatientCareTeam } from '../../lib/api/careTeam';

// Types
interface CareTeamMember {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  lastAppointment?: string;
  nextAppointment?: string;
}

// Mock data
const mockCareTeam: CareTeamMember[] = [
  {
    id: '1',
    name: 'Dra. Ana García',
    specialty: 'Medicina General',
    lastAppointment: '2025-03-01T10:00:00Z',
    nextAppointment: '2025-04-15T11:30:00Z'
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Cardiología',
    lastAppointment: '2025-02-15T15:00:00Z'
  },
  {
    id: '3',
    name: 'Dra. Laura Sánchez',
    specialty: 'Nutrición',
    lastAppointment: '2025-01-20T09:00:00Z'
  }
];

interface MyCareTeamProps {
  loading?: boolean;
  fetchData?: boolean;
}

const MyCareTeam: React.FC<MyCareTeamProps> = ({ 
  loading = false,
  fetchData = false
}) => {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  
  useEffect(() => {
    if (fetchData) {
      const fetchCareTeam = async () => {
        try {
          setIsLoading(true);
          const data = await getPatientCareTeam();
          setCareTeam(data);
        } catch (err) {
          console.error('Error fetching care team:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCareTeam();
    } else {
      setCareTeam(mockCareTeam);
    }
  }, [fetchData]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mi equipo médico</h2>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mi equipo médico</h2>
        <Link to="/equipo-medico" className="text-blue-600 text-sm font-medium hover:text-blue-800">
          Ver todos
        </Link>
      </div>
      
      {careTeam.length === 0 ? (
        <div className="text-center py-6">
          <User size={40} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 mb-4">No tienes médicos en tu equipo todavía.</p>
          <Link 
            to="/buscar" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Buscar médicos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {careTeam.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  {member.imageUrl ? (
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.specialty}</p>
                </div>
              </div>
              
              {(member.lastAppointment || member.nextAppointment) && (
                <div className="text-xs text-gray-600 mb-3">
                  {member.lastAppointment && (
                    <div className="mb-1">
                      <span className="font-medium">Última cita:</span> {formatDate(member.lastAppointment)}
                    </div>
                  )}
                  
                  {member.nextAppointment && (
                    <div className="text-blue-600 font-medium">
                      Próxima cita: {formatDate(member.nextAppointment)}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex space-x-2">
                <Link 
                  to={`/mensajes?doctor=${member.id}`}
                  className="flex-1 flex items-center justify-center px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  <MessageSquare size={12} className="mr-1" />
                  Mensaje
                </Link>
                
                <Link 
                  to={`/agendar?doctor=${member.id}`}
                  className="flex-1 flex items-center justify-center px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  <Calendar size={12} className="mr-1" />
                  Cita
                </Link>
                
                <Link 
                  to={`/perfil-doctor/${member.id}`}
                  className="flex items-center justify-center w-8 h-6 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCareTeam;