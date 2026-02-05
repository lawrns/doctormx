'use client'

import { useState } from 'react'
import PreConsultaChat from '@/components/PreConsultaChat'

export default function PreConsultaChatWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [completed, setCompleted] = useState(false)

  if (completed) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Pre-consulta completada!</h3>
        <p className="text-gray-600">Gracias por completar tu evaluación. Ahora puedes agendar tu consulta.</p>
        <button
          onClick={() => setIsOpen(true)}
          className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Volver a iniciar
        </button>
      </div>
    )
  }

  return (
    <>
      {!isOpen && (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Tienes síntomas o preguntas?</h3>
            <p className="text-gray-600 mb-6">Habla con nuestro asistente de orientación antes de tu consulta</p>
            <button
              onClick={() => setIsOpen(true)}
              className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Iniciar pre-consulta
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <PreConsultaChat
          isOpen={true}
          onCloseAction={() => setIsOpen(false)}
          onCompleteAction={() => {
            setCompleted(true)
            setIsOpen(false)
          }}
        />
      )}
    </>
  )
}
