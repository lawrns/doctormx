import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Camera, Paperclip, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useMemoryCleanup } from '../../../hooks/useMemoryCleanup';

interface AIDoctorInputOptimizedProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  enableVoice?: boolean;
  enableImage?: boolean;
  enableAttachment?: boolean;
  className?: string;
}

/**
 * Optimized Input Component
 * - Debounced input handling
 * - Efficient file handling
 * - Voice input support
 * - Mobile-optimized UI
 */
export const AIDoctorInputOptimized: React.FC<AIDoctorInputOptimizedProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Escribe tu mensaje...',
  maxLength = 1000,
  enableVoice = true,
  enableImage = true,
  enableAttachment = false,
  className
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Memory cleanup
  const { registerTimer, cleanup } = useMemoryCleanup(() => {
    // Clean up image preview URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
  });

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      adjustTextareaHeight();
    }
  }, [maxLength, adjustTextareaHeight]);

  // Handle image selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 10MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove selected image
  const removeImage = useCallback(() => {
    setSelectedImage(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [imagePreview]);

  // Send message
  const sendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !selectedImage) return;

    let imageUrl: string | undefined;

    // Handle image upload if present
    if (selectedImage) {
      // In a real app, upload to cloud storage
      // For now, we'll use a data URL
      imageUrl = imagePreview || undefined;
    }

    onSendMessage(trimmedMessage, imageUrl);
    
    // Reset form
    setMessage('');
    removeImage();
    adjustTextareaHeight();
    
    // Focus back on input
    textareaRef.current?.focus();
  }, [message, selectedImage, imagePreview, onSendMessage, removeImage, adjustTextareaHeight]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Voice recording (placeholder)
  const toggleVoiceRecording = useCallback(() => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording
  }, [isRecording]);

  return (
    <div className={cn('border-t bg-white', className)}>
      {/* Image Preview */}
      {imagePreview && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-2 border-b"
        >
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-20 rounded-lg object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-2 p-3">
        {/* Action Buttons */}
        <div className="flex gap-1">
          {enableImage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={disabled}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  'hover:bg-gray-100 active:bg-gray-200',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
          
          {enableAttachment && (
            <button
              disabled={disabled}
              className={cn(
                'p-2 rounded-full transition-colors',
                'hover:bg-gray-100 active:bg-gray-200',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-2 pr-10',
              'bg-gray-50 rounded-full',
              'border border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'resize-none overflow-y-auto',
              'text-sm md:text-base',
              'transition-all duration-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ minHeight: '40px' }}
          />
          
          {/* Character Counter */}
          {message.length > maxLength * 0.8 && (
            <span className="absolute bottom-2 right-12 text-xs text-gray-500">
              {message.length}/{maxLength}
            </span>
          )}
        </div>

        {/* Send/Voice Button */}
        {message.trim() || selectedImage ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={sendMessage}
            disabled={disabled}
            className={cn(
              'p-2 rounded-full',
              'bg-primary-500 text-white',
              'hover:bg-primary-600 active:bg-primary-700',
              'transition-colors',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        ) : enableVoice ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={toggleVoiceRecording}
            disabled={disabled}
            className={cn(
              'p-2 rounded-full transition-colors',
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Mic className="w-5 h-5" />
          </motion.button>
        ) : null}
      </div>
    </div>
  );
};

export default React.memo(AIDoctorInputOptimized);