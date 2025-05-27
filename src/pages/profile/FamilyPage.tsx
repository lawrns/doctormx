import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Users, User, UserPlus, Calendar, Phone,
  Heart, Edit2, Trash2, Shield, Baby, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
  };
  isMinor: boolean;
  profileImage?: string;
}

export default function FamilyPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'María García',
      relationship: 'Esposa',
      birthDate: '1985-06-15',
      gender: 'female',
      bloodType: 'A+',
      allergies: ['Polen'],
      chronicConditions: [],
      medications: [],
      isMinor: false
    },
    {
      id: '2',
      name: 'Carlos García Jr.',
      relationship: 'Hijo',
      birthDate: '2015-03-22',
      gender: 'male',
      bloodType: 'O+',
      allergies: ['Cacahuates'],
      chronicConditions: ['Asma'],
      medications: ['Salbutamol'],
      isMinor: true
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    relationship: '',
    birthDate: '',
    gender: 'male',
    bloodType: '',
    allergies: [],
    chronicConditions: [],
    medications: [],
    isMinor: false
  });

  const relationshipOptions = [
    'Esposo/a',
    'Hijo/a',
    'Padre',
    'Madre',
    'Hermano/a',
    'Abuelo/a',
    'Nieto/a',
    'Tío/a',
    'Primo/a',
    'Otro'
  ];

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddMember = () => {
    if (!formData.name || !formData.relationship || !formData.birthDate) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const age = calculateAge(formData.birthDate);
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: formData.name,
      relationship: formData.relationship,
      birthDate: formData.birthDate,
      gender: formData.gender || 'male',
      bloodType: formData.bloodType,
      allergies: formData.allergies || [],
      chronicConditions: formData.chronicConditions || [],
      medications: formData.medications || [],
      isMinor: age < 18
    };

    setFamilyMembers([...familyMembers, newMember]);
    setShowAddModal(false);
    resetForm();
    showToast('Familiar agregado exitosamente', 'success');
  };

  const handleEditMember = () => {
    if (!editingMember || !formData.name || !formData.relationship || !formData.birthDate) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const age = calculateAge(formData.birthDate);
    const updatedMembers = familyMembers.map(member => 
      member.id === editingMember.id 
        ? { ...member, ...formData, isMinor: age < 18 }
        : member
    );

    setFamilyMembers(updatedMembers);
    setEditingMember(null);
    resetForm();
    showToast('Información actualizada exitosamente', 'success');
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este familiar?')) {
      setFamilyMembers(familyMembers.filter(m => m.id !== memberId));
      showToast('Familiar eliminado', 'info');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      birthDate: '',
      gender: 'male',
      bloodType: '',
      allergies: [],
      chronicConditions: [],
      medications: [],
      isMinor: false
    });
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData(member);
    setShowAddModal(true);
  };

  const getRelationshipIcon = (relationship: string) => {
    if (relationship.includes('Hij')) return Baby;
    if (relationship.includes('Espos')) return Heart;
    return User;
  };

  return (
    <>
      <SEO 
        title="Mi Familia - DoctorMX"
        description="Gestiona la salud de toda tu familia en un solo lugar"
        keywords={['familia salud', 'gestión familiar médica', 'salud familiar']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <Link
                  to="/profile"
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Mi Familia</h1>
              </div>
              
              <Button
                onClick={() => {
                  resetForm();
                  setEditingMember(null);
                  setShowAddModal(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar Familiar
              </Button>
            </div>
          </div>
        </div>

        {/* Family Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <Users className="w-8 h-8 text-brand-jade-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{familyMembers.length}</div>
              <div className="text-sm text-gray-600">Familiares</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Baby className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {familyMembers.filter(m => m.isMinor).length}
              </div>
              <div className="text-sm text-gray-600">Menores</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {familyMembers.filter(m => m.chronicConditions.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Con condiciones</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-gray-600">Protegidos</div>
            </Card>
          </div>

          {/* Family Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member) => {
              const Icon = getRelationshipIcon(member.relationship);
              const age = calculateAge(member.birthDate);
              
              return (
                <Card key={member.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-gray-600">{member.relationship}</p>
                        <p className="text-sm text-gray-500">{age} años</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Health Info */}
                  <div className="space-y-3">
                    {member.bloodType && (
                      <div className="flex items-center text-sm">
                        <Heart className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-gray-600">Tipo de sangre:</span>
                        <span className="ml-2 font-medium">{member.bloodType}</span>
                      </div>
                    )}

                    {member.allergies.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Alergias:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.allergies.map((allergy, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.chronicConditions.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Condiciones:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.chronicConditions.map((condition, index) => (
                            <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.isMinor && (
                      <Badge className="bg-blue-100 text-blue-800 w-full justify-center">
                        <Baby className="w-3 h-3 mr-1" />
                        Menor de edad
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/profile/family/${member.id}/medical-history`)}
                    >
                      Ver historial médico
                    </Button>
                  </div>
                </Card>
              );
            })}

            {/* Add Member Card */}
            <Card 
              className="p-6 border-2 border-dashed border-gray-300 hover:border-brand-jade-400 hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => {
                resetForm();
                setEditingMember(null);
                setShowAddModal(true);
              }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700">Agregar Familiar</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Gestiona la salud de toda tu familia
                </p>
              </div>
            </Card>
          </div>

          {/* Info Box */}
          <Card className="mt-8 p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Gestión Familiar:</strong> Puedes gestionar citas, recetas y consultas 
                  para todos los miembros de tu familia desde una sola cuenta. Los menores de edad 
                  requieren autorización del tutor.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingMember(null);
          resetForm();
        }}
        title={editingMember ? 'Editar Familiar' : 'Agregar Familiar'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relación *
            </label>
            <select
              value={formData.relationship || ''}
              onChange={(e) => setFormData({...formData, relationship: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
            >
              <option value="">Seleccionar relación</option>
              {relationshipOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento *
              </label>
              <Input
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                value={formData.gender || 'male'}
                onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de sangre
            </label>
            <select
              value={formData.bloodType || ''}
              onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
            >
              <option value="">Seleccionar</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingMember(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={editingMember ? handleEditMember : handleAddMember}
            >
              {editingMember ? 'Guardar Cambios' : 'Agregar Familiar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}