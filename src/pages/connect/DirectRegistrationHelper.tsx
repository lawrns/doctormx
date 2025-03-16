import React, { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';

interface DirectRegistrationHelperProps {
  formData: {
    name: string;
    email: string;
    password: string;
    specialty: string;
    [key: string]: any;
  };
  onSuccess: () => void;
  onError: (error: any) => void;
}

/**
 * This component provides a direct way to register users by
 * directly creating them in Supabase with a minimal set of information.
 */
const DirectRegistrationHelper: React.FC<DirectRegistrationHelperProps> = ({ 
  formData, 
  onSuccess, 
  onError 
}) => {
  const { supabase } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const handleDirectRegistration = async () => {
    setIsSubmitting(true);
    setError(null);
    setProgress('Iniciando proceso de registro alternativo...');
    
    try {
      // 1. Create auth user account
      setProgress('Creando cuenta de usuario...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            is_doctor: true
          }
        }
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        setError(`Error de autenticación: ${authError.message}`);
        onError(authError);
        return;
      }
      
      if (!authData.user) {
        setError('No se pudo crear la cuenta de usuario');
        onError(new Error('No user data returned'));
        return;
      }
      
      setProgress('Cuenta de usuario creada. Creando perfil de médico...');
      
      // 2. Create a minimal doctor profile
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: authData.user.id,
          name: formData.name,
          specialty: formData.specialty,
          verification_status: 'pending',
          is_premium: true,
          premium_until: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        
      if (doctorError) {
        console.error('Doctor profile creation error:', doctorError);
        setError(`Error al crear perfil médico: ${doctorError.message}`);
        onError(doctorError);
        return;
      }
      
      setProgress('Registro completado con éxito!');
      onSuccess();
    } catch (error: any) {
      console.error('Direct registration error:', error);
      setError(error.message || 'Error desconocido durante el registro');
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 mt-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Método de Registro Alternativo</h3>
      <p className="text-sm text-blue-700 mb-4">
        Si estás teniendo problemas con el registro regular, prueba este método alternativo simplificado.
      </p>
      
      {progress && !error && (
        <div className="p-3 rounded-lg mb-4 bg-blue-100 text-blue-800">
          {progress}
        </div>
      )}
      
      {error && (
        <div className="p-3 rounded-lg mb-4 bg-red-100 text-red-800">
          {error}
        </div>
      )}
      
      <button 
        onClick={handleDirectRegistration}
        disabled={isSubmitting}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
      >
        {isSubmitting ? 'Procesando...' : 'Intentar registro alternativo'}
      </button>
    </div>
  );
};

export default DirectRegistrationHelper;