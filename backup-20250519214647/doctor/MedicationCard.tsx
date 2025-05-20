import React from 'react';
import { Card, Button } from '../ui';
import { Pill, Clock, Calendar, Trash2, Edit } from 'lucide-react';

interface MedicationCardProps {
  index: number;
  medication: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
  onDelete: (index: number) => void;
  onEdit: (index: number, medication: any) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  index,
  medication,
  onDelete,
  onEdit
}) => {
  return (
    <Card className="mb-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Pill className="mr-2 text-blue-500" size={20} />
          Medicamento {index + 1}
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(index, medication)}
            icon={<Edit size={16} />}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(index)}
            icon={<Trash2 size={16} className="text-red-500" />}
            className="text-red-500"
          >
            Eliminar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Nombre del medicamento</h4>
          <p className="text-gray-800 font-medium">{medication.name}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Dosis</h4>
          <p className="text-gray-800 font-medium">{medication.dosage}</p>
        </div>
        
        <div className="flex items-start">
          <Clock className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Frecuencia</h4>
            <p className="text-gray-800 font-medium">{medication.frequency}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Calendar className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Duración</h4>
            <p className="text-gray-800 font-medium">{medication.duration}</p>
          </div>
        </div>
      </div>
      
      {medication.instructions && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Instrucciones específicas</h4>
          <p className="text-gray-700">{medication.instructions}</p>
        </div>
      )}
    </Card>
  );
};

export default MedicationCard;