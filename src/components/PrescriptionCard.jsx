import { motion } from 'framer-motion';
import { Pill, Beaker, Download, CheckCircle } from 'lucide-react';

export default function PrescriptionCard({ prescription, labOrders }) {
  if (!prescription?.available && !labOrders?.available) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full my-4 space-y-3"
    >
      {/* Prescription Card */}
      {prescription?.available && (
        <div className="border-l-4 border-brand-500 bg-gradient-to-r from-brand-50 to-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-brand-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-ink-primary flex items-center gap-2">
                Prescripción Médica
                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded">e-Rx</span>
              </h4>
              
              {prescription.items && prescription.items.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {prescription.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-ink-secondary">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              
              {prescription.note && (
                <p className="mt-2 text-sm text-ink-muted italic bg-white/50 px-2 py-1.5 rounded border border-brand-100">
                  💡 {prescription.note}
                </p>
              )}
              
              <button className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Ver & Descargar Rx
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lab Orders Card */}
      {labOrders?.available && (
        <div className="border-l-4 border-medical-500 bg-gradient-to-r from-medical-50 to-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
              <Beaker className="w-5 h-5 text-medical-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-ink-primary flex items-center gap-2">
                Orden de Laboratorio
                <span className="text-xs bg-medical-100 text-medical-700 px-2 py-1 rounded">Análisis</span>
              </h4>
              
              {labOrders.items && labOrders.items.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {labOrders.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-ink-secondary">
                      <CheckCircle className="w-3.5 h-3.5 text-medical-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              
              {labOrders.note && (
                <p className="mt-2 text-sm text-ink-muted italic bg-white/50 px-2 py-1.5 rounded border border-medical-100">
                  ℹ️ {labOrders.note}
                </p>
              )}
              
              <button className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-medical-600 text-white text-xs font-medium rounded-lg hover:bg-medical-700 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Ver Orden de Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
