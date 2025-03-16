import { useState, useEffect } from 'react';
import { Line, Calendar, ArrowRight, Plus, Trash2, Clock, BarChart4, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface SymptomEntry {
  id: string;
  date: Date;
  symptomId: string;
  symptomName: string;
  severityLevel: number;
  notes: string;
  tags: string[];
}

interface SymptomTrackerProps {
  initialSymptom?: {
    id: string;
    name: string;
  };
  onComplete?: (data: any) => void;
}

const SymptomTracker: React.FC<SymptomTrackerProps> = ({ initialSymptom, onComplete }) => {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState<{ id: string; name: string } | null>(
    initialSymptom || null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<SymptomEntry>>({
    date: new Date(),
    severityLevel: 5,
    notes: '',
    tags: []
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Load saved entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('symptom_tracker_entries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        // Convert date strings back to Date objects
        const processedEntries = parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        setEntries(processedEntries);
      } catch (e) {
        console.error('Error parsing saved entries:', e);
      }
    }

    // If no current symptom is set but we have entries, use the most recent one
    if (!currentSymptom && entries.length > 0) {
      const latestEntry = entries.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      setCurrentSymptom({
        id: latestEntry.symptomId,
        name: latestEntry.symptomName
      });
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('symptom_tracker_entries', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = () => {
    if (!currentSymptom) return;
    
    const entry: SymptomEntry = {
      id: `entry_${Date.now()}`,
      date: new Date(newEntry.date || new Date()),
      symptomId: currentSymptom.id,
      symptomName: currentSymptom.name,
      severityLevel: newEntry.severityLevel || 5,
      notes: newEntry.notes || '',
      tags: newEntry.tags || []
    };

    if (editingEntryId) {
      // Update existing entry
      setEntries(entries.map(e => e.id === editingEntryId ? entry : e));
      setEditingEntryId(null);
    } else {
      // Add new entry
      setEntries([...entries, entry]);
    }

    // Reset form
    setNewEntry({
      date: new Date(),
      severityLevel: 5,
      notes: '',
      tags: []
    });
    setShowAddForm(false);
  };

  const handleEditEntry = (entry: SymptomEntry) => {
    setNewEntry({
      date: entry.date,
      severityLevel: entry.severityLevel,
      notes: entry.notes,
      tags: entry.tags
    });
    setEditingEntryId(entry.id);
    setShowAddForm(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
    if (editingEntryId === entryId) {
      setEditingEntryId(null);
      setShowAddForm(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (!newEntry.tags?.includes(tag)) {
      setNewEntry({
        ...newEntry,
        tags: [...(newEntry.tags || []), tag]
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags?.filter(t => t !== tag) || []
    });
  };

  const exportToCSV = () => {
    // Format entries for CSV export
    const header = 'Date,Symptom,Severity,Notes,Tags\n';
    const rows = entries
      .filter(entry => !currentSymptom || entry.symptomId === currentSymptom.id)
      .map(entry => {
        const date = entry.date.toISOString().split('T')[0];
        const symptom = entry.symptomName.replace(/,/g, ' ');
        const severity = entry.severityLevel;
        const notes = entry.notes.replace(/,/g, ' ').replace(/\n/g, ' ');
        const tags = entry.tags.join(';').replace(/,/g, ' ');
        return `${date},${symptom},${severity},${notes},${tags}`;
      })
      .join('\n');
    
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSymptom?.name || 'symptom'}_tracker_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilteredEntries = () => {
    if (!currentSymptom) return [];
    
    // Filter by current symptom
    let filtered = entries.filter(entry => entry.symptomId === currentSymptom.id);
    
    // Filter by selected timeframe
    const now = new Date();
    let cutoffDate = new Date();
    
    if (selectedTimeframe === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (selectedTimeframe === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (selectedTimeframe === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    filtered = filtered.filter(entry => entry.date >= cutoffDate);
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const renderTrendGraph = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length < 2) return null;
    
    // Sort by date (oldest first) for graph
    const sortedEntries = [...filteredEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate graph dimensions
    const width = 100;
    const height = 50;
    const padding = 10;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Calculate points for the line
    const points = sortedEntries.map((entry, index) => {
      const x = padding + (index / (sortedEntries.length - 1)) * graphWidth;
      // Invert y-axis so higher severity shows higher on the graph
      const y = padding + (1 - (entry.severityLevel / 10)) * graphHeight;
      return `${x},${y}`;
    });
    
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Tendencia de intensidad</h4>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Y-axis labels */}
            <text x="2" y={padding} fontSize="6" textAnchor="start" fill="#666">Alta</text>
            <text x="2" y={height - padding} fontSize="6" textAnchor="start" fill="#666">Baja</text>
            
            {/* Line */}
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            
            {/* Points */}
            {sortedEntries.map((entry, index) => {
              const x = padding + (index / (sortedEntries.length - 1)) * graphWidth;
              const y = padding + (1 - (entry.severityLevel / 10)) * graphHeight;
              return (
                <circle
                  key={entry.id}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{sortedEntries[0].date.toLocaleDateString()}</span>
            <span>{sortedEntries[sortedEntries.length - 1].date.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  // Common symptom tags for quick selection
  const commonTags = [
    'Empeora con actividad', 
    'Mejora con descanso', 
    'Peor en la mañana', 
    'Peor en la noche',
    'Después de comer',
    'Estresante',
    'Dificulta el sueño'
  ];

  const filteredEntries = getFilteredEntries();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Seguimiento de Síntomas</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="p-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Nuevo registro
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={filteredEntries.length === 0}
            className={`p-2 text-sm rounded-lg border flex items-center ${
              filteredEntries.length > 0 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download size={16} className="mr-1" />
            Exportar
          </button>
        </div>
      </div>
      
      {currentSymptom ? (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="font-medium text-gray-900">{currentSymptom.name}</span>
          </div>
          
          <div className="flex border border-gray-200 rounded-lg mb-4">
            <button
              onClick={() => setSelectedTimeframe('week')}
              className={`flex-1 py-2 text-sm font-medium ${
                selectedTimeframe === 'week' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Última semana
            </button>
            <button
              onClick={() => setSelectedTimeframe('month')}
              className={`flex-1 py-2 text-sm font-medium ${
                selectedTimeframe === 'month' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Último mes
            </button>
            <button
              onClick={() => setSelectedTimeframe('year')}
              className={`flex-1 py-2 text-sm font-medium ${
                selectedTimeframe === 'year' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Último año
            </button>
          </div>
          
          {renderTrendGraph()}
          
          {filteredEntries.length > 0 ? (
            <div className="space-y-3 mt-4">
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">{entry.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Intensidad:</span>
                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            entry.severityLevel >= 7 ? 'bg-red-500' :
                            entry.severityLevel >= 4 ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${entry.severityLevel * 10}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{entry.severityLevel}/10</span>
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className="mb-2">
                      <p className="text-gray-700">{entry.notes}</p>
                    </div>
                  )}
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart4 size={32} className="mx-auto mb-2 text-gray-400" />
              <p>No hay registros para este período.</p>
              <p className="text-sm mt-1">Agrega un nuevo registro para comenzar el seguimiento.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Clock size={32} className="mx-auto mb-2 text-gray-400" />
          <p>No hay síntomas en seguimiento.</p>
          <p className="text-sm mt-1">Agrega un nuevo registro para comenzar el seguimiento.</p>
        </div>
      )}
      
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-blue-200 rounded-lg p-6 bg-blue-50 mb-6"
        >
          <h4 className="text-lg font-medium text-blue-800 mb-4">
            {editingEntryId ? 'Editar registro' : 'Nuevo registro'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Fecha</label>
              <input
                type="date"
                value={newEntry.date ? new Date(newEntry.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewEntry({ ...newEntry, date: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Intensidad ({newEntry.severityLevel}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={newEntry.severityLevel}
                onChange={(e) => setNewEntry({ ...newEntry, severityLevel: parseInt(e.target.value, 10) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blue-700 mt-1">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Severo</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Notas</label>
              <textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe cómo te sientes..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Etiquetas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newEntry.tags?.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {commonTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      newEntry.tags?.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  placeholder="Agregar etiqueta personalizada..."
                  className="flex-1 px-3 py-1 text-sm border border-blue-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      handleAddTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                    if (input.value) {
                      handleAddTag(input.value);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEntryId(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingEntryId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            El seguimiento regular de síntomas ayuda a tu médico a proporcionar un mejor diagnóstico y tratamiento.
          </p>
          
          {onComplete && (
            <button
              onClick={() => onComplete(getFilteredEntries())}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              Continuar
              <ArrowRight size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomTracker;