import React, { memo, useRef, useCallback } from 'react';
import { Send, Image, Mic, Phone } from 'lucide-react';

interface AIDoctorInputProps {
  input: string;
  setInput: (value: string) => void;
  isRecording: boolean;
  isUploading: boolean;
  isProcessing: boolean;
  onSendMessage: (message?: string) => void;
  onMicClick: () => void;
  onImageUpload: (file: File) => void;
}

function AIDoctorInput({
  input,
  setInput,
  isRecording,
  isUploading,
  isProcessing,
  onSendMessage,
  onMicClick,
  onImageUpload
}: AIDoctorInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  }, [onSendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    // Auto-resize textarea
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  }, [setInput]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20" 
         style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'layout', minHeight: '120px' }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Emergency Contact Bar */}
        <div className="flex items-center justify-center mb-3 text-sm">
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1 flex items-center">
            <Phone className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-red-700 font-medium">Emergencia: 911 • Cruz Roja: 065</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={onMicClick}
            className={`p-3 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-100 text-red-600' 
                : 'text-gray-500 hover:text-[#006D77] hover:bg-[#D0F0EF]'
            }`}
            aria-label="Usar micrófono"
            disabled={isProcessing}
          >
            <Mic size={20} />
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-full transition-all duration-200 ${
              isUploading 
                ? 'text-[#006D77] bg-[#D0F0EF]' 
                : 'text-gray-500 hover:text-[#006D77] hover:bg-[#D0F0EF]'
            }`}
            aria-label="Subir imagen"
            disabled={isProcessing}
          >
            <Image size={20} />
          </button>
          
          <a
            href="https://wa.me/+525512345678?text=Hola%20Dr.%20Simeon%2C%20necesito%20ayuda%20médica%20urgente"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full text-[#25D366] hover:bg-green-50 transition-all duration-200"
            aria-label="WhatsApp directo"
          >
            <Phone size={20} />
          </a>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex-1 relative" 
               style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'layout style', minHeight: '56px' }}>
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Cuéntame qué te duele o preocupa... (Presiona Enter para enviar, Shift+Enter para nueva línea)"
              className="w-full border-2 border-[#006D77]/30 focus:border-[#006D77] rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#006D77]/20 chat-input resize-none transition-all duration-200"
              disabled={isProcessing}
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
            
            {input.length > 0 && (
              <div className="absolute right-16 bottom-3 text-xs text-[#006D77] opacity-70 pointer-events-none">
                {input.length} caracteres
              </div>
            )}
          </div>
          
          <button
            onClick={() => onSendMessage()}
            disabled={!input.trim() || isProcessing}
            className={`p-3 rounded-full transition-all duration-200 ${
              input.trim() && !isProcessing
                ? 'bg-[#006D77] text-white hover:bg-[#005B66] shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Enviar mensaje"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(AIDoctorInput);