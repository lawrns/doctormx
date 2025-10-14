import { useEffect, useState } from 'react'

const messages = [
  { id: 1, type: 'user', text: 'Tengo fiebre desde ayer y dolor de cabeza...', delay: 800, time: '13:45' },
  { id: 2, type: 'bot', text: '¿Cuánta temperatura tienes? ¿Has tomado algún medicamento?', delay: 2200, time: '13:45' },
  { id: 3, type: 'user', text: '38.5°C y solo he tomado paracetamol', delay: 3800, time: '13:46' },
  { id: 4, type: 'bot', text: 'Entendido. ¿Tienes otros síntomas como tos, dolor de garganta o congestión nasal?', delay: 5400, time: '13:46' },
  { id: 5, type: 'user', text: 'Sí, tengo tos y dolor de garganta', delay: 7000, time: '13:47' },
  { id: 6, type: 'bot', text: 'Basado en tus síntomas, recomiendo consulta con Médico General. Te muestro especialistas verificados cerca de ti:', delay: 8800, time: '13:47' },
  { id: 7, type: 'referral', doctor: 'Dr. Carlos Méndez', specialty: 'Medicina General', distance: '1.2 km', delay: 10200, time: '13:48' },
]

export default function AnimatedChat() {
  const [visibleMessages, setVisibleMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    messages.forEach((msg) => {
      setTimeout(() => {
        if (msg.type === 'bot') {
          setIsTyping(true)
          setTimeout(() => {
            setIsTyping(false)
            setVisibleMessages(prev => [...prev, msg])
          }, 800)
        } else {
          setVisibleMessages(prev => [...prev, msg])
        }
      }, msg.delay)
    })
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-ink-primary to-ink-secondary p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-ink-primary rounded-b-3xl z-10"></div>

        {/* Screen */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white h-[600px]">
          {/* WhatsApp header */}
          <div className="bg-gradient-to-r from-medical-600 to-medical-500 px-4 py-3 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">Doctor IA</div>
              <div className="text-white/80 text-xs">En línea</div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="p-4 space-y-3 h-[calc(100%-80px)] overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                {msg.type === 'referral' ? (
                  <div className="w-full bg-white border border-medical-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-medical-500 to-medical-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {msg.doctor.split(' ')[1]?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink-primary text-sm">{msg.doctor}</p>
                          <svg className="w-4 h-4 text-medical-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-xs text-medical-600 font-medium">{msg.specialty}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-[10px] text-ink-muted">{msg.distance}</span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-semibold rounded-lg flex-shrink-0">
                        Ver perfil
                      </button>
                    </div>
                    <div className="text-[10px] text-ink-muted mt-2">{msg.time}</div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-brand-500 text-white rounded-br-md'
                        : 'bg-white text-ink-primary border border-ink-border rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-white/70' : 'text-ink-muted'}`}>
                      {msg.time}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="bg-white border border-ink-border px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area (static decoration) */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-ink-border px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                <span className="text-sm text-ink-muted">Escribe un mensaje...</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-medical-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating verification badge */}
      <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-ink-border animate-fade-in-up" style={{animationDelay: '1s'}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-medical-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-primary">Verificado</div>
            <div className="text-[10px] text-ink-secondary">NOM-004</div>
          </div>
        </div>
      </div>

      {/* Floating response time badge */}
      <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-ink-border animate-fade-in-up" style={{animationDelay: '1.5s'}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-primary">2 min</div>
            <div className="text-[10px] text-ink-secondary">respuesta</div>
          </div>
        </div>
      </div>
    </div>
  )
}
