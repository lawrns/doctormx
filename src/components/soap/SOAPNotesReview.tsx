'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Edit,
  Check,
  X,
  Loader2,
  Download,
  AlertCircle,
  Save,
} from 'lucide-react';

interface SOAPSection {
  label: string;
  key: 'subjective' | 'objective' | 'assessment' | 'plan';
  description: string;
}

const SECTIONS: SOAPSection[] = [
  {
    label: 'Subjetivo (S)',
    key: 'subjective',
    description: 'Síntomas y antecedentes reportados por el paciente',
  },
  {
    label: 'Objetivo (O)',
    key: 'objective',
    description: 'Hallazgos del examen físico y signos vitales',
  },
  {
    label: 'Evaluación (A)',
    key: 'assessment',
    description: 'Análisis e impresión diagnóstica',
  },
  {
    label: 'Plan (P)',
    key: 'plan',
    description: 'Tratamiento y recomendaciones',
  },
];

interface SOAPNoteData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  json?: Record<string, unknown>;
}

interface SOAPNotesReviewProps {
  noteId?: string;
  initialData?: SOAPNoteData;
  isLoading?: boolean;
  onGenerate?: (notes: string, patientContext?: PatientContext) => Promise<{ id: string; soap_note: SOAPNoteData }>;
  onApprove?: (noteId: string, edits?: Partial<SOAPNoteData>) => Promise<void>;
  onDiscard?: () => void;
  onExport?: () => Promise<void>;
  patientName?: string;
  consultationNotes?: string;
  patientContext?: PatientContext;
}

interface PatientContext {
  name?: string;
  age?: number;
  gender?: string;
  medical_history?: string;
}

type GenerationStep = 'idle' | 'generating' | 'reviewing' | 'saving' | 'saved' | 'error';

export function SOAPNotesReview({
  noteId,
  initialData,
  isLoading = false,
  onGenerate,
  onApprove,
  onDiscard,
  onExport,
  patientName,
  consultationNotes,
  patientContext,
}: SOAPNotesReviewProps) {
  const [step, setStep] = useState<GenerationStep>(initialData ? 'reviewing' : 'idle');
  const [soapData, setSoapData] = useState<SOAPNoteData>(initialData || {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [editedData, setEditedData] = useState<SOAPNoteData>(soapData);
  const [editingSection, setEditingSection] = useState<keyof SOAPNoteData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!onGenerate || !consultationNotes) {
      setError('No hay notas de consulta para generar SOAP');
      return;
    }

    setStep('generating');
    setError(null);

    try {
      const result = await onGenerate(consultationNotes, patientContext);
      setSoapData(result.soap_note);
      setEditedData(result.soap_note);
      setStep('reviewing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar nota SOAP');
      setStep('error');
    }
  }, [onGenerate, consultationNotes, patientContext]);

  const handleEdit = useCallback((key: keyof SOAPNoteData, value: string) => {
    setEditedData((prev) => {
      const newData = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(newData) !== JSON.stringify(soapData));
      return newData;
    });
  }, [soapData]);

  const handleApprove = useCallback(async () => {
    if (!noteId || !onApprove) return;

    setIsSaving(true);
    setError(null);

    try {
      const edits: Partial<SOAPNoteData> = {};
      let hasEdits = false;

      if (editedData.subjective !== soapData.subjective) {
        edits.subjective = editedData.subjective;
        hasEdits = true;
      }
      if (editedData.objective !== soapData.objective) {
        edits.objective = editedData.objective;
        hasEdits = true;
      }
      if (editedData.assessment !== soapData.assessment) {
        edits.assessment = editedData.assessment;
        hasEdits = true;
      }
      if (editedData.plan !== soapData.plan) {
        edits.plan = editedData.plan;
        hasEdits = true;
      }

      await onApprove(noteId, hasEdits ? edits : undefined);
      setStep('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar nota SOAP');
    } finally {
      setIsSaving(false);
    }
  }, [noteId, onApprove, editedData, soapData]);

  const handleDiscard = useCallback(() => {
    setEditedData(soapData);
    setHasChanges(false);
    setEditingSection(null);
    onDiscard?.();
  }, [soapData, onDiscard]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Cargando nota SOAP...</p>
        </div>
      </div>
    );
  }

  if (step === 'idle') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generar nota SOAP con IA
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Crea una nota médica estructurada basada en las notas de la consulta
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="space-y-1">
                  <li>• Esta nota es generada por IA como apoyo administrativo</li>
                  <li>• Debes revisar y editar antes de aprobar</li>
                  <li>• Tú eres responsable del contenido médico final</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Generar nota SOAP
          </button>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-12 h-12 text-blue-600" />
          </motion.div>
          <p className="text-gray-900 font-medium mt-4">Generando nota SOAP...</p>
          <p className="text-sm text-gray-500 mt-2">La IA está analizando la consulta</p>
        </div>
      </div>
    );
  }

  if (step === 'saving') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-900 font-medium">Guardando nota SOAP...</p>
        </div>
      </div>
    );
  }

  if (step === 'saved') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nota SOAP guardada
          </h3>
          <p className="text-gray-600 mb-6">
            La nota ha sido aprobada y guardada en el expediente del paciente
          </p>
          {onDiscard && (
            <button
              onClick={onDiscard}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error al generar nota SOAP
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
            {onDiscard && (
              <button
                onClick={onDiscard}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Review/Edit state
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Nota SOAP
            </h3>
            {patientName && (
              <p className="text-sm text-gray-600 mt-1">Paciente: {patientName}</p>
            )}
          </div>
          <div className="flex gap-2">
            {onExport && (
              <button
                onClick={onExport}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exportar a PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {hasChanges && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                <Edit className="w-3 h-3" />
                Modificado
              </span>
            )}
          </div>
        </div>

        {/* AI Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Generado por IA:</strong> Esta nota fue creada por inteligencia artificial
            como apoyo administrativo. Debes revisar y editar el contenido antes de aprobarlo.
            Tú eres responsable del contenido médico final.
          </p>
        </div>
      </div>

      {/* SOAP Sections */}
      <div className="divide-y">
        <AnimatePresence mode="sync">
          {SECTIONS.map((section, index) => {
            const isEditing = editingSection === section.key;
            const content = editedData[section.key];

            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{section.label}</h4>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                  {isEditing ? (
                    <button
                      onClick={() => setEditingSection(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Terminar edición"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingSection(section.key)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar sección"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => handleEdit(section.key, e.target.value)}
                    className="w-full min-h-[120px] p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder={`Escribe la sección ${section.label}...`}
                    autoFocus
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg min-h-[80px]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {content || (
                        <span className="text-gray-400 italic">
                          Sin información en esta sección
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Additional Data from JSON */}
      {soapData.json && (
        <div className="p-6 bg-gray-50 border-t">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Información adicional</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {soapData.json.icd10_codes && Array.isArray(soapData.json.icd10_codes) && soapData.json.icd10_codes.length > 0 ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Códigos CIE-10</p>
                <div className="flex flex-wrap gap-1">
                  {soapData.json.icd10_codes.map((code: unknown, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {String(code)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {soapData.json.medications && Array.isArray(soapData.json.medications) && soapData.json.medications.length > 0 ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Medicamentos sugeridos</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {soapData.json.medications.map((med: unknown, i: number) => {
                    const medObj = med as Record<string, unknown>;
                    const name = medObj.name ? String(medObj.name) : null;
                    const dosage = medObj.dosage ? String(medObj.dosage) : null;
                    const frequency = medObj.frequency ? String(medObj.frequency) : null;
                    return (
                      <li key={i} className="flex items-center gap-2 flex-wrap">
                        {name && <span className="font-medium">{name}</span>}
                        {dosage && <span>{dosage}</span>}
                        {frequency && <span className="text-gray-500">{frequency}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
            {soapData.json.followup ? (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Seguimiento</p>
                <p className="text-sm text-gray-700">{String(soapData.json.followup)}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleApprove}
          disabled={isSaving}
          className="flex-1 sm:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Aprobar y guardar
            </>
          )}
        </button>
        {onDiscard && (
          <button
            onClick={handleDiscard}
            className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Descartar
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SOAPNotesReview;
