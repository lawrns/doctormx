
import { Check, X } from 'lucide-react';

interface ComparisonRowProps {
  feature: string;
  traditional: React.ReactNode;
  doctorMx: React.ReactNode;
}

const ComparisonRow = ({ feature, traditional, doctorMx }: ComparisonRowProps) => (
  <div className="grid grid-cols-3 border-b border-gray-100">
    <div className="p-4 text-gray-800">{feature}</div>
    <div className="p-4 text-center">{traditional}</div>
    <div className="p-4 text-center">{doctorMx}</div>
  </div>
);

const ConnectComparisonTable = () => {
  return (
    <div className="my-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ventajas Competitivas Claras</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Vea cómo Doctor.mx supera a las plataformas médicas tradicionales
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="grid grid-cols-3 bg-blue-600 text-white font-semibold">
          <div className="p-4">Características</div>
          <div className="p-4 text-center">Plataformas Tradicionales</div>
          <div className="p-4 text-center">Doctor.mx</div>
        </div>
        
        <ComparisonRow 
          feature="Sistema de Difusión a Pacientes"
          traditional={<X className="mx-auto text-gray-400" size={20} />}
          doctorMx={<Check className="mx-auto text-green-600" size={20} />}
        />
        
        <ComparisonRow 
          feature="Comunidades Moderadas por Especialidad"
          traditional={<X className="mx-auto text-gray-400" size={20} />}
          doctorMx={<Check className="mx-auto text-green-600" size={20} />}
        />
        
        <ComparisonRow 
          feature="Panel 'Mi Equipo Médico' para Pacientes"
          traditional={<X className="mx-auto text-gray-400" size={20} />}
          doctorMx={<Check className="mx-auto text-green-600" size={20} />}
        />
        
        <ComparisonRow 
          feature="Plataforma de Contenido Educativo"
          traditional={<X className="mx-auto text-gray-400" size={20} />}
          doctorMx={<Check className="mx-auto text-green-600" size={20} />}
        />
        
        <ComparisonRow 
          feature="Flujos Pre/Post Consulta Automatizados"
          traditional={<span className="text-gray-600">Básico</span>}
          doctorMx={<div><Check className="inline text-green-600 mr-1" size={18} /><span className="text-gray-800">Avanzado</span></div>}
        />
        
        <ComparisonRow 
          feature="Analytics para Crecimiento de Práctica"
          traditional={<span className="text-gray-600">Limitado</span>}
          doctorMx={<div><Check className="inline text-green-600 mr-1" size={18} /><span className="text-gray-800">Completo</span></div>}
        />
        
        <ComparisonRow 
          feature="Enfoque en Retención de Pacientes"
          traditional={<X className="mx-auto text-gray-400" size={20} />}
          doctorMx={<Check className="mx-auto text-green-600" size={20} />}
        />
      </div>
      
      <div className="mt-6 p-5 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
        <p className="font-semibold text-blue-900 mb-2">Lo que nos diferencia:</p>
        <p className="text-blue-800">
          Doctor.mx va más allá de la simple reserva de citas. Construimos un <strong>ecosistema completo</strong> donde usted puede cultivar relaciones duraderas con sus pacientes, establecerse como autoridad en su campo y hacer crecer su práctica de manera orgánica.
        </p>
      </div>
    </div>
  );
};

export default ConnectComparisonTable;
