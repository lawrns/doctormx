import { useState, useEffect } from 'react';
import { User, Heart, Clock, Activity, PlusCircle, Trash2, ShieldAlert, Edit, Save, X } from 'lucide-react';

export interface HealthProfileData {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  familyHistory: string[];
  lastUpdated?: string;
}

interface HealthProfileProps {
  onProfileUpdate?: (profile: HealthProfileData) => void;
  readOnly?: boolean;
  compact?: boolean;
}

const HealthProfile: React.FC<HealthProfileProps> = ({
  onProfileUpdate,
  readOnly = false,
  compact = false
}) => {
  const [profile, setProfile] = useState<HealthProfileData>({
    allergies: [],
    medications: [],
    chronicConditions: [],
    familyHistory: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<HealthProfileData>(profile);
  const [newItem, setNewItem] = useState<{ category: string; value: string }>({
    category: '',
    value: ''
  });

  // Load saved profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('health_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
        setTempProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error loading health profile:', e);
      }
    }
  }, []);

  const saveProfile = () => {
    // Update profile with current date
    const updatedProfile = {
      ...tempProfile,
      lastUpdated: new Date().toISOString()
    };
    
    setProfile(updatedProfile);
    setIsEditing(false);
    
    // Save to localStorage
    localStorage.setItem('health_profile', JSON.stringify(updatedProfile));
    
    // Notify parent component if needed
    if (onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }
  };

  const handleAddItem = (category: keyof HealthProfileData) => {
    if (!newItem.value.trim() || newItem.category !== category) return;
    
    const currentItems = tempProfile[category] as string[];
    
    if (!currentItems.includes(newItem.value)) {
      setTempProfile({
        ...tempProfile,
        [category]: [...currentItems, newItem.value]
      });
    }
    
    setNewItem({ category: '', value: '' });
  };

  const handleRemoveItem = (category: keyof HealthProfileData, item: string) => {
    const currentItems = tempProfile[category] as string[];
    setTempProfile({
      ...tempProfile,
      [category]: currentItems.filter(i => i !== item)
    });
  };

  const calculateBMI = () => {
    if (!tempProfile.height || !tempProfile.weight) return null;
    
    const heightInMeters = tempProfile.height / 100;
    const bmi = tempProfile.weight / (heightInMeters * heightInMeters);
    
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-500' };
    return { label: 'Obesidad', color: 'text-red-600' };
  };

  if (compact && !isEditing) {
    // Compact view (summary)
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User size={18} className="mr-2 text-blue-600" />
            Perfil de Salud
          </h3>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Editar perfil de salud"
            >
              <Edit size={18} />
            </button>
          )}
        </div>
        
        {!profile.age && !profile.gender && !profile.medications.length && !profile.chronicConditions.length ? (
          <div className="text-center py-4 text-gray-500">
            <p className="mb-2">No hay información de perfil guardada.</p>
            {!readOnly && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Completar mi perfil de salud
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {profile.age && (
                <div className="text-sm">
                  <span className="text-gray-500">Edad:</span> {profile.age} años
                </div>
              )}
              {profile.gender && (
                <div className="text-sm">
                  <span className="text-gray-500">Género:</span> {
                    profile.gender === 'male' ? 'Masculino' :
                    profile.gender === 'female' ? 'Femenino' : 'Otro'
                  }
                </div>
              )}
            </div>
            
            {/* Chronic conditions */}
            {profile.chronicConditions.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Condiciones crónicas:</p>
                <div className="flex flex-wrap gap-1">
                  {profile.chronicConditions.map(condition => (
                    <span 
                      key={condition} 
                      className="inline-block bg-red-50 text-red-800 text-xs px-2 py-0.5 rounded-full"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Medications */}
            {profile.medications.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Medicamentos:</p>
                <div className="flex flex-wrap gap-1">
                  {profile.medications.map(medication => (
                    <span 
                      key={medication} 
                      className="inline-block bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                    >
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {profile.lastUpdated && (
          <div className="mt-3 text-xs text-gray-500 flex items-center">
            <Clock size={12} className="mr-1" />
            Actualizado: {new Date(profile.lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-900">Perfil de Salud</h3>
        
        {!readOnly && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
          >
            <Edit size={16} className="mr-1" />
            Editar
          </button>
        )}
        
        {!readOnly && isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setTempProfile(profile);
                setIsEditing(false);
              }}
              className="text-gray-600 hover:text-gray-800 flex items-center text-sm font-medium"
            >
              <X size={16} className="mr-1" />
              Cancelar
            </button>
            
            <button
              onClick={saveProfile}
              className="text-green-600 hover:text-green-800 flex items-center text-sm font-medium"
            >
              <Save size={16} className="mr-1" />
              Guardar
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {!isEditing ? (
          /* View mode */
          <div className="space-y-6">
            {/* Basic information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <User size={16} className="mr-2 text-blue-600" />
                Información básica
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <p className="text-sm text-gray-500">Edad</p>
                  <p className="font-medium">{profile.age ? `${profile.age} años` : 'No especificada'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Género</p>
                  <p className="font-medium">
                    {profile.gender === 'male' ? 'Masculino' :
                     profile.gender === 'female' ? 'Femenino' :
                     profile.gender === 'other' ? 'Otro' : 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Altura</p>
                  <p className="font-medium">{profile.height ? `${profile.height} cm` : 'No especificada'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Peso</p>
                  <p className="font-medium">{profile.weight ? `${profile.weight} kg` : 'No especificado'}</p>
                </div>
                
                {profile.height && profile.weight && (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm text-gray-500">IMC (Índice de Masa Corporal)</p>
                    <div className="flex items-center">
                      <p className="font-medium">{calculateBMI()}</p>
                      <span className={`ml-2 text-sm ${getBMICategory(parseFloat(calculateBMI() || '0')).color}`}>
                        {getBMICategory(parseFloat(calculateBMI() || '0')).label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <ShieldAlert size={16} className="mr-2 text-blue-600" />
                Alergias
              </h4>
              
              {profile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map(allergy => (
                    <span 
                      key={allergy} 
                      className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No se han registrado alergias.</p>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Activity size={16} className="mr-2 text-blue-600" />
                Medicamentos actuales
              </h4>
              
              {profile.medications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.medications.map(medication => (
                    <span 
                      key={medication} 
                      className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {medication}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No se han registrado medicamentos.</p>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Clock size={16} className="mr-2 text-blue-600" />
                Condiciones crónicas
              </h4>
              
              {profile.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.chronicConditions.map(condition => (
                    <span 
                      key={condition} 
                      className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No se han registrado condiciones crónicas.</p>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Heart size={16} className="mr-2 text-blue-600" />
                Historia familiar
              </h4>
              
              {profile.familyHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.familyHistory.map(history => (
                    <span 
                      key={history} 
                      className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {history}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No se ha registrado historia familiar.</p>
              )}
            </div>
            
            {profile.lastUpdated && (
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-4 mt-2">
                Última actualización: {new Date(profile.lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          /* Edit mode */
          <div className="space-y-6">
            {/* Basic information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <User size={16} className="mr-2 text-blue-600" />
                Información básica
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Edad
                  </label>
                  <input
                    type="number"
                    id="age"
                    min="0"
                    max="120"
                    value={tempProfile.age || ''}
                    onChange={(e) => setTempProfile({
                      ...tempProfile,
                      age: e.target.value ? parseInt(e.target.value, 10) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Edad en años"
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Género
                  </label>
                  <select
                    id="gender"
                    value={tempProfile.gender || ''}
                    onChange={(e) => setTempProfile({
                      ...tempProfile,
                      gender: e.target.value as 'male' | 'female' | 'other' | undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    min="0"
                    max="300"
                    value={tempProfile.height || ''}
                    onChange={(e) => setTempProfile({
                      ...tempProfile,
                      height: e.target.value ? parseInt(e.target.value, 10) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Altura en centímetros"
                  />
                </div>
                
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    min="0"
                    max="500"
                    step="0.1"
                    value={tempProfile.weight || ''}
                    onChange={(e) => setTempProfile({
                      ...tempProfile,
                      weight: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Peso en kilogramos"
                  />
                </div>
              </div>
            </div>
            
            {/* Allergies */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <ShieldAlert size={16} className="mr-2 text-blue-600" />
                Alergias
              </h4>
              
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Agregar alergia..."
                    value={newItem.category === 'allergies' ? newItem.value : ''}
                    onChange={(e) => setNewItem({ category: 'allergies', value: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('allergies')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleAddItem('allergies')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tempProfile.allergies.map(allergy => (
                    <div 
                      key={allergy} 
                      className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {allergy}
                      <button
                        onClick={() => handleRemoveItem('allergies', allergy)}
                        className="ml-1 text-red-700 hover:text-red-900"
                        aria-label={`Eliminar alergia ${allergy}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Medications */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Activity size={16} className="mr-2 text-blue-600" />
                Medicamentos actuales
              </h4>
              
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Agregar medicamento..."
                    value={newItem.category === 'medications' ? newItem.value : ''}
                    onChange={(e) => setNewItem({ category: 'medications', value: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('medications')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleAddItem('medications')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tempProfile.medications.map(medication => (
                    <div 
                      key={medication} 
                      className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {medication}
                      <button
                        onClick={() => handleRemoveItem('medications', medication)}
                        className="ml-1 text-blue-700 hover:text-blue-900"
                        aria-label={`Eliminar medicamento ${medication}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Chronic Conditions */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Clock size={16} className="mr-2 text-blue-600" />
                Condiciones crónicas
              </h4>
              
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Agregar condición crónica..."
                    value={newItem.category === 'chronicConditions' ? newItem.value : ''}
                    onChange={(e) => setNewItem({ category: 'chronicConditions', value: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('chronicConditions')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleAddItem('chronicConditions')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tempProfile.chronicConditions.map(condition => (
                    <div 
                      key={condition} 
                      className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {condition}
                      <button
                        onClick={() => handleRemoveItem('chronicConditions', condition)}
                        className="ml-1 text-amber-700 hover:text-amber-900"
                        aria-label={`Eliminar condición ${condition}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Family History */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Heart size={16} className="mr-2 text-blue-600" />
                Historia familiar
              </h4>
              
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Agregar condición familiar..."
                    value={newItem.category === 'familyHistory' ? newItem.value : ''}
                    onChange={(e) => setNewItem({ category: 'familyHistory', value: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('familyHistory')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleAddItem('familyHistory')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tempProfile.familyHistory.map(history => (
                    <div 
                      key={history} 
                      className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {history}
                      <button
                        onClick={() => handleRemoveItem('familyHistory', history)}
                        className="ml-1 text-purple-700 hover:text-purple-900"
                        aria-label={`Eliminar antecedente ${history}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6 flex justify-end">
              <div className="space-x-3">
                <button
                  onClick={() => {
                    setTempProfile(profile);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Privacy notice */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            <ShieldAlert size={12} className="inline-block mr-1" />
            Tu información de salud se guarda localmente en tu dispositivo y se usa solo para personalizar tus evaluaciones de síntomas. No compartimos estos datos con terceros.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthProfile;