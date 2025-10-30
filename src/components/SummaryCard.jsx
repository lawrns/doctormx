import { motion } from 'framer-motion';
import { FileText, Download, Share2, CheckCircle } from 'lucide-react';

export default function SummaryCard({ summary, onSave, onShare }) {
  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-4 p-5 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 border-2 border-neutral-200 rounded-xl shadow-lg"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-neutral-600 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-ink-primary mb-1">
            Resumen de tu consulta
          </h3>
          <p className="text-sm text-ink-muted">
            Guarda o comparte este resumen con tu médico
          </p>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        {summary.symptoms && (
          <div>
            <p className="font-medium text-ink-secondary mb-1">Síntomas:</p>
            <p className="text-ink-primary">{summary.symptoms}</p>
          </div>
        )}
        
        {summary.severity && (
          <div>
            <p className="font-medium text-ink-secondary mb-1">Nivel de urgencia:</p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              summary.severity === 'red' ? 'bg-red-100 text-red-700' :
              summary.severity === 'orange' ? 'bg-orange-100 text-orange-700' :
              summary.severity === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {summary.severity === 'red' ? 'Urgente' :
               summary.severity === 'orange' ? 'Serio' :
               summary.severity === 'yellow' ? 'Moderado' : 'Leve'}
            </span>
          </div>
        )}
        
        {summary.recommendations && (
          <div>
            <p className="font-medium text-ink-secondary mb-1">Recomendaciones:</p>
            <p className="text-ink-primary">{summary.recommendations}</p>
          </div>
        )}
        
        {summary.specialty && (
          <div>
            <p className="font-medium text-ink-secondary mb-1">Especialidad recomendada:</p>
            <p className="text-ink-primary">{summary.specialty}</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200">
        {onSave && (
          <motion.button
            onClick={onSave}
            className="flex-1 py-2 px-4 bg-white border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            Guardar
          </motion.button>
        )}
        
        {onShare && (
          <motion.button
            onClick={onShare}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}




