import React, { useState } from 'react';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { Card, Button, Textarea } from '../../components/ui';
import { Plus, FileText, Trash2, Mail, Send, Download } from 'lucide-react';
import MedicationCard from '../../components/doctor/MedicationCard';
import MedicationForm from '../../components/doctor/MedicationForm';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const DigitalPrescriptionPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      name: 'Paracetamol',
      dosage: '500 mg',
      frequency: 'Cada 8 horas',
      duration: '7 días',
      instructions: 'Tomar con alimentos, evitar alcohol, etc.',
    }
  ]);
  
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const handleAddMedication = (medicationData: Medication) => {
    setMedications([...medications, medicationData]);
    setShowAddForm(false);
  };
  
  const handleEditMedication = (index: number, medicationData: Medication) => {
    setEditingIndex(index);
  };
  
  const handleUpdateMedication = (medicationData: Medication) => {
    const updatedMedications = [...medications];
    if (editingIndex !== null) {
      updatedMedications[editingIndex] = medicationData;
      setMedications(updatedMedications);
      setEditingIndex(null);
    }
  };
  
  const handleDeleteMedication = (index: number) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
  };
  
  return (
    <DashboardLayout title="Crear Receta Digital">
      <div className="max-w-4xl mx-auto">
        {/* Medications Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Medicamentos</h2>
            
            {!showAddForm && editingIndex === null && (
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                icon={<Plus size={16} />}
              >
                Agregar Medicamento
              </Button>
            )}
          </div>
          
          {showAddForm && (
            <MedicationForm
              onSubmit={handleAddMedication}
              onCancel={() => setShowAddForm(false)}
            />
          )}
          
          {editingIndex !== null && (
            <MedicationForm
              isEditing
              initialData={medications[editingIndex]}
              onSubmit={handleUpdateMedication}
              onCancel={() => setEditingIndex(null)}
            />
          )}
          
          {medications.map((medication, index) => (
            editingIndex !== index && (
              <MedicationCard
                key={index}
                index={index}
                medication={medication}
                onDelete={handleDeleteMedication}
                onEdit={handleEditMedication}
              />
            )
          ))}
          
          {medications.length === 0 && !showAddForm && (
            <Card className="mb-4 p-6 text-center bg-gray-50">
              <p className="text-gray-500 mb-4">No hay medicamentos en la receta.</p>
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                icon={<Plus size={16} />}
                size="sm"
              >
                Agregar Medicamento
              </Button>
            </Card>
          )}
        </div>
        
        {/* Additional Instructions Section */}
        <Card className="mb-6 p-4">
          <h2 className="text-lg font-semibold mb-4">Instrucciones Adicionales</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instrucciones generales
            </label>
            <Textarea
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              placeholder="Instrucciones generales para el paciente"
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas médicas (no visibles para el paciente)
            </label>
            <Textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Notas internas sobre el tratamiento o seguimiento"
              rows={4}
              className="bg-yellow-50"
            />
          </div>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mb-10">
          <Button 
            variant="outline"
            icon={<Download size={16} />}
          >
            Guardar Borrador
          </Button>
          
          <Button 
            variant="primary"
            icon={<Send size={16} />}
          >
            Generar Receta
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DigitalPrescriptionPage;