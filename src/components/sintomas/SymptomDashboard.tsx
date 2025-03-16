import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  BarChart, 
  Activity, 
  FileText, 
  ChevronRight, 
  Plus, 
  ChevronDown,
  Users,
  Clock,
  Filter,
  Trash2,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import HealthProfile from './HealthProfile';

interface SymptomEntry {
  id: string;
  date: Date;
  symptomId: string;
  symptomName: string;
  bodyRegion: string;
  severity: 'low' | 'moderate' | 'high';
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  notes?: string;
  doctor_appointment?: {
    scheduled: boolean;
    date?: Date;
    doctorName?: string;
    specialty?: string;
  };
}

interface SymptomDashboardProps {
  userId?: string;
  showWelcomeScreen?: boolean;
}

const SymptomDashboard: React.FC<SymptomDashboardProps> = ({ 
  userId, 
  showWelcomeScreen = false 
}) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'symptom'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterBodyRegion, setFilterBodyRegion] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showWelcome, setShowWelcome] = useState(showWelcomeScreen);

  // Load entries from local storage or mock data
  useEffect(() => {
    const loadEntries = () => {
      setLoading(true);
      
      // Try to load from localStorage
      const savedEntries = localStorage.getItem('symptom_entries');
      
      if (savedEntries) {
        try {
          const parsed = JSON.parse(savedEntries);
          // Convert date strings back to Date objects
          const processedEntries = parsed.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
            doctor_appointment: entry.doctor_appointment 
              ? { 
                  ...entry.doctor_appointment,
                  date: entry.doctor_appointment.date ? new Date(entry.doctor_appointment.date) : undefined
                }
              : undefined
          }));
          
          setEntries(processedEntries);
        } catch (e) {
          console.error('Error parsing saved entries:', e);
          // Fall back to mock data if there's an error
          setEntries(generateMockEntries());
        }
      } else {
        // No saved entries, use mock data
        setEntries(generateMockEntries());
      }
      
      setLoading(false);
    };
    
    loadEntries();
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('symptom_entries', JSON.stringify(entries));
    }
  }, [entries]);

  // Generate mock entries for demonstration
  const generateMockEntries = (): SymptomEntry[] => {
    const mockSymptoms = [
      { id: 'headache', name: 'Dolor de cabeza', region: 'head' },
      { id: 'stomach_pain', name: 'Dolor abdominal', region: 'abdomen' },
      { id: 'back_pain', name: 'Dolor de espalda', region: 'back' },
      { id: 'cough', name: 'Tos', region: 'chest' },
      { id: 'fever', name: 'Fiebre', region: 'general' }
    ];
    
    const severities: Array<'low' | 'moderate' | 'high'> = ['low', 'moderate', 'high'];
    const urgencies: Array<'routine' | 'soon' | 'urgent' | 'emergency'> = ['routine', 'soon', 'urgent', 'emergency'];
    
    const mockEntries: SymptomEntry[] = [];
    
    // Create entries for the past 3 months
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 90)); // Random date in the last 90 days
      
      const symptom = mockSymptoms[Math.floor(Math.random() * mockSymptoms.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const urgency = urgencies[Math.floor(Math.random() * (severity === 'high' ? 2 : (severity === 'moderate' ? 3 : 4)))];
      
      // Some entries have doctor appointments
      const hasAppointment = Math.random() > 0.6;
      
      mockEntries.push({
        id: `entry_${i}`,
        date,
        symptomId: symptom.id,
        symptomName: symptom.name,
        bodyRegion: symptom.region,
        severity,
        urgency,
        notes: Math.random() > 0.3 
          ? 'Notas de seguimiento para este síntoma.' 
          : undefined,
        doctor_appointment: hasAppointment 
          ? {
              scheduled: true,
              date: new Date(date.getTime() + Math.floor(Math.random() * 14 + 1) * 86400000), // 1-14 days after symptom
              doctorName: `Dr. ${['García', 'Martínez', 'López', 'Rodríguez'][Math.floor(Math.random() * 4)]}`,
              specialty: ['Medicina General', 'Neurología', 'Gastroenterología', 'Cardiología'][Math.floor(Math.random() * 4)]
            }
          : undefined
      });
    }
    
    return mockEntries;
  };

  // Add a new entry (from results or manually)
  const addEntry = (entry: Omit<SymptomEntry, 'id'>) => {
    const newEntry: SymptomEntry = {
      ...entry,
      id: `entry_${Date.now()}`
    };
    
    setEntries(prev => [newEntry, ...prev]);
  };

  // Delete an entry
  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  // Filter and sort entries
  const getFilteredAndSortedEntries = () => {
    let filtered = [...entries];
    
    // Apply timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (timeframe === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === 'year') {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(entry => entry.date >= cutoffDate);
    }
    
    // Apply body region filter
    if (filterBodyRegion) {
      filtered = filtered.filter(entry => entry.bodyRegion === filterBodyRegion);
    }
    
    // Apply severity filter
    if (filterSeverity) {
      filtered = filtered.filter(entry => entry.severity === filterSeverity);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.symptomName.toLowerCase().includes(query) || 
        (entry.notes && entry.notes.toLowerCase().includes(query))
      );
    }
    
    // Sort entries
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? a.date.getTime() - b.date.getTime() 
          : b.date.getTime() - a.date.getTime();
      } else if (sortBy === 'severity') {
        const severityValues = { 'low': 1, 'moderate': 2, 'high': 3 };
        return sortDirection === 'asc' 
          ? severityValues[a.severity] - severityValues[b.severity] 
          : severityValues[b.severity] - severityValues[a.severity];
      } else if (sortBy === 'symptom') {
        return sortDirection === 'asc' 
          ? a.symptomName.localeCompare(b.symptomName) 
          : b.symptomName.localeCompare(a.symptomName);
      }
      
      return 0;
    });
    
    return filtered;
  };

  // Get stats for the dashboard
  const getStats = () => {
    const total = entries.length;
    
    // Count by severity
    const severityCounts = {
      low: entries.filter(e => e.severity === 'low').length,
      moderate: entries.filter(e => e.severity === 'moderate').length,
      high: entries.filter(e => e.severity === 'high').length
    };
    
    // Count by body region
    const regionCounts: Record<string, number> = {};
    entries.forEach(entry => {
      regionCounts[entry.bodyRegion] = (regionCounts[entry.bodyRegion] || 0) + 1;
    });
    
    // Top symptom
    const symptomCounts: Record<string, number> = {};
    entries.forEach(entry => {
      symptomCounts[entry.symptomName] = (symptomCounts[entry.symptomName] || 0) + 1;
    });
    
    let topSymptom = '';
    let topSymptomCount = 0;
    
    Object.entries(symptomCounts).forEach(([symptom, count]) => {
      if (count > topSymptomCount) {
        topSymptom = symptom;
        topSymptomCount = count;
      }
    });
    
    // Appointments count
    const appointmentsCount = entries.filter(e => e.doctor_appointment?.scheduled).length;
    
    // Next appointment
    const futureAppointments = entries
      .filter(e => e.doctor_appointment?.scheduled && e.doctor_appointment.date && e.doctor_appointment.date > new Date())
      .sort((a, b) => (a.doctor_appointment?.date?.getTime() || 0) - (b.doctor_appointment?.date?.getTime() || 0));
    
    const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null;
    
    return {
      total,
      severityCounts,
      regionCounts,
      topSymptom,
      topSymptomCount,
      appointmentsCount,
      nextAppointment
    };
  };

  // Get the color class based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get the color class based on urgency
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-amber-100 text-amber-800';
      case 'soon':
        return 'bg-blue-100 text-blue-800';
      case 'routine':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEntries = getFilteredAndSortedEntries();
  const stats = getStats();

  const handleStartCheck = () => {
    navigate('/sintomas/evaluacion');
  };

  const renderWelcomeScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12 px-6"
    >
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Activity size={36} className="text-blue-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenido a tu Panel de Síntomas</h2>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Realiza una evaluación de síntomas, haz seguimiento de tu salud y mantén un historial completo.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <FileText size={20} className="text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Evalúa tus síntomas</h3>
          <p className="text-gray-600 text-sm">Obtén una evaluación precisa y recomendaciones personalizadas</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <BarChart size={20} className="text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Seguimiento</h3>
          <p className="text-gray-600 text-sm">Realiza un seguimiento de tus síntomas a lo largo del tiempo</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Gestiona consultas</h3>
          <p className="text-gray-600 text-sm">Programa citas con especialistas basadas en tus evaluaciones</p>
        </div>
      </div>
      <button
        onClick={handleStartCheck}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
      >
        Iniciar Evaluación de Síntomas
      </button>
      <p className="mt-4">
        <button
          onClick={() => setShowWelcome(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          Ver mi historial de síntomas
        </button>
      </p>
    </motion.div>
  );

  if (showWelcome) {
    return renderWelcomeScreen();
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tu historial de síntomas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mi Historial de Síntomas</h2>
          <p className="text-gray-600">Historial y seguimiento de tus evaluaciones de síntomas</p>
        </div>
        <div>
          <button
            onClick={handleStartCheck}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Plus size={18} className="mr-2" />
            Nueva evaluación
          </button>
        </div>
      </div>
      
      {/* Health Profile Summary */}
      <div className="mb-6">
        <HealthProfile compact={true} />
      </div>
      
      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Salud</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FileText size={20} className="text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-800">Total de Evaluaciones</h4>
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Activity size={20} className="text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-800">Síntoma más común</h4>
              </div>
              <p className="text-lg font-medium text-gray-900">{stats.topSymptom || "N/A"}</p>
              {stats.topSymptomCount > 0 && (
                <p className="text-sm text-gray-600">{stats.topSymptomCount} ocurrencias</p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Users size={20} className="text-indigo-600 mr-2" />
                <h4 className="font-medium text-indigo-800">Consultas Médicas</h4>
              </div>
              <p className="text-3xl font-bold text-indigo-900">{stats.appointmentsCount}</p>
              {stats.nextAppointment && (
                <p className="text-xs text-indigo-700 mt-1">
                  Próxima: {stats.nextAppointment.doctor_appointment?.date?.toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BarChart size={20} className="text-green-600 mr-2" />
                <h4 className="font-medium text-green-800">Por severidad</h4>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Leve:</span>
                  <span className="font-medium text-green-900">{stats.severityCounts.low}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-700">Moderada:</span>
                  <span className="font-medium text-amber-900">{stats.severityCounts.moderate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-700">Alta:</span>
                  <span className="font-medium text-red-900">{stats.severityCounts.high}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Entries List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Historial de Síntomas</h3>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg appearance-none"
                >
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                  <option value="year">Último año</option>
                  <option value="all">Todo el historial</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 border border-gray-300 rounded-lg flex items-center"
              >
                <Filter size={16} className="mr-1" />
                Filtros
              </button>
              
              <div className="relative">
                <select
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [by, direction] = e.target.value.split('-');
                    setSortBy(by as any);
                    setSortDirection(direction as any);
                  }}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg appearance-none"
                >
                  <option value="date-desc">Más recientes primero</option>
                  <option value="date-asc">Más antiguos primero</option>
                  <option value="severity-desc">Severidad (alta a baja)</option>
                  <option value="severity-asc">Severidad (baja a alta)</option>
                  <option value="symptom-asc">Síntoma (A-Z)</option>
                  <option value="symptom-desc">Síntoma (Z-A)</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Search and Filters */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por síntoma o notas..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Región del cuerpo</label>
                  <select
                    value={filterBodyRegion || ''}
                    onChange={(e) => setFilterBodyRegion(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todas las regiones</option>
                    <option value="head">Cabeza</option>
                    <option value="chest">Pecho</option>
                    <option value="abdomen">Abdomen</option>
                    <option value="back">Espalda</option>
                    <option value="general">General</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
                  <select
                    value={filterSeverity || ''}
                    onChange={(e) => setFilterSeverity(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todas las severidades</option>
                    <option value="low">Baja</option>
                    <option value="moderate">Moderada</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {filteredEntries.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-gray-400" />
              </div>
              <h4 className="text-gray-500 text-lg font-medium mb-1">No hay registros de síntomas</h4>
              <p className="text-gray-400 mb-4">
                {searchQuery || filterBodyRegion || filterSeverity 
                  ? 'No se encontraron registros que coincidan con los filtros aplicados.' 
                  : 'Aún no has registrado ninguna evaluación de síntomas.'}
              </p>
              <button
                onClick={handleStartCheck}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center mx-auto"
              >
                <Plus size={18} className="mr-2" />
                Realizar evaluación
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Activity size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{entry.symptomName}</h4>
                        <p className="text-sm text-gray-500">{entry.date.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(entry.severity)}`}>
                        {entry.severity === 'low' ? 'Leve' : 
                         entry.severity === 'moderate' ? 'Moderada' : 'Alta'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(entry.urgency)}`}>
                        {entry.urgency === 'routine' ? 'Rutina' : 
                         entry.urgency === 'soon' ? 'Pronto' : 
                         entry.urgency === 'urgent' ? 'Urgente' : 'Emergencia'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    <p><span className="font-medium">Región:</span> {entry.bodyRegion}</p>
                    {entry.notes && <p className="mt-1">{entry.notes}</p>}
                  </div>
                  
                  {entry.doctor_appointment?.scheduled && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">Cita médica:</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        {entry.doctor_appointment.date?.toLocaleDateString()} con {entry.doctor_appointment.doctorName} ({entry.doctor_appointment.specialty})
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/sintomas/resultados?id=${entry.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      Ver detalles <ChevronRight size={16} className="ml-1" />
                    </button>
                    
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Eliminar entrada"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 text-center text-sm text-gray-500">
                Mostrando {filteredEntries.length} de {entries.length} registros
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomDashboard;