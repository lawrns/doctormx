import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface VoiceInputProcessorProps {
  onVoiceInput: (audioData: ArrayBuffer, transcript: string) => void;
  language?: string;
  dialect?: string;
}

export default function VoiceInputProcessor({ 
  onVoiceInput, 
  language = 'es-MX', 
  dialect = 'mexican' 
}: VoiceInputProcessorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Set up audio level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Monitor audio levels
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average);
        }
      };

      intervalRef.current = setInterval(updateAudioLevel, 100);

      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        if (transcript) {
          onVoiceInput(arrayBuffer, transcript);
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      // Set up Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }
          
          setTranscript(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        recognitionRef.current.start();
      }

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timeIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  }, [language, onVoiceInput]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      
      // Process the recording
      setTimeout(() => {
        setIsProcessing(false);
        setTranscript('');
        setAudioLevel(0);
        setRecordingTime(0);
      }, 2000);
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioLevelColor = (level: number) => {
    if (level < 30) return 'bg-green-500';
    if (level < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Entrada por Voz
            </h3>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            🇲🇽 Español Mexicano
          </div>
        </div>

        {/* Recording Status */}
        {(isRecording || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Audio Level Visualizer */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-600" />
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${getAudioLevelColor(audioLevel)} transition-all duration-150`}
                  style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                />
              </div>
            </div>

            {/* Recording Timer */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {isRecording ? 'Grabando...' : 'Procesando...'}
                </span>
              </div>
              
              {isRecording && (
                <span className="text-gray-600 dark:text-gray-300">
                  {formatTime(recordingTime)}
                </span>
              )}
            </div>

            {/* Live Transcript */}
            {transcript && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Transcripción en vivo:
                </div>
                <div className="text-gray-900 dark:text-white">
                  {transcript}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        {!isRecording && !isProcessing && (
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <div>💡 <strong>Consejos para mejor reconocimiento:</strong></div>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Habla claramente y a ritmo normal</li>
              <li>Describe síntomas específicos</li>
              <li>Menciona duración y severidad</li>
              <li>Incluye contexto relevante</li>
            </ul>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3">
          {!isRecording && !isProcessing && (
            <Button
              onClick={startRecording}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Iniciar Grabación
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
              size="lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Detener Grabación
            </Button>
          )}

          {isProcessing && (
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span>Procesando audio y texto...</span>
            </div>
          )}
        </div>

        {/* Voice Processing Features */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Cancelación de eco</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Reducción de ruido</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>IA médica contextual</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Términos médicos MX</span>
          </div>
        </div>
      </div>
    </Card>
  );
}