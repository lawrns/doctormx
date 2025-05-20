import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '../ui';
import { Plus, Save, X } from 'lucide-react';

interface MedicationFormProps {
  isEditing?: boolean;
  initialData?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
  onSubmit: (medicationData: any) => void;
  onCancel: () => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  isEditing = false,
  initialData = {
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  },
  onSubmit,
  onCancel,
}) => {
  const [medication, setMedication] = useState(initialData);

  useEffect(() => {
    setMedication(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedication(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(medication);
  };

  return (
    <Card className="mb-4 p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Editar Medicamento' : 'Agregar Medicamento'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          icon={<X size={16} />}
        >
          Cancelar
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del medicamento*
            </label>
            <Input
              name="name"
              value={medication.name}
              onChange={handleChange}
              placeholder="Ej: Paracetamol"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosis*
            </label>
            <Input
              name="dosage"
              value={medication.dosage}
              onChange={handleChange}
              placeholder="Ej: 500 mg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia*
            </label>
            <Input
              name="frequency"
              value={medication.frequency}
              onChange={handleChange}
              placeholder="Ej: Cada 8 horas"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración*
            </label>
            <Input
              name="duration"
              value={medication.duration}
              onChange={handleChange}
              placeholder="Ej: 7 días"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instrucciones específicas
            </label>
            <Textarea
              name="instructions"
              value={medication.instructions}
              onChange={handleChange}
              placeholder="Ej: Tomar con alimentos, evitar alcohol, etc."
              rows={3}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            type="submit"
            icon={isEditing ? <Save size={16} /> : <Plus size={16} />}
          >
            {isEditing ? 'Guardar Cambios' : 'Agregar Medicamento'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MedicationForm;