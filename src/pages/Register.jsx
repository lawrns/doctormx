import React, { useState } from 'react';
import { signUpUser } from '../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast } from '../lib/toast.js';

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 group">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-medical-500 text-white shadow-sm transition-all duration-200 group-hover:shadow-brand group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
        </svg>
      </span>
      <span className="text-xl font-semibold tracking-tight text-ink-primary transition-colors duration-200 group-hover:text-brand-600">doctor.mx</span>
    </a>
  )
}

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    
    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    // Validar full_name
    if (!formData.full_name) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Registrando usuario con Supabase:', formData);
      
      const { data, error } = await signUpUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });
      
      if (error) {
        console.error('Error de Supabase:', error);
        
        // Manejar errores específicos de Supabase
        if (error.message.includes('User already registered')) {
          showErrorToast('Este email ya está registrado. Intenta iniciar sesión.');
        } else if (error.message.includes('Password should be at least')) {
          showErrorToast('La contraseña debe tener al menos 6 caracteres.');
        } else if (error.message.includes('Invalid email')) {
          showErrorToast('El formato del email no es válido.');
        } else {
          showErrorToast(`Error al registrar: ${error.message}`);
        }
        return;
      }
      
      console.log('Usuario registrado exitosamente:', data);
      
      // Mostrar mensaje de éxito
      showSuccessToast('¡Registro exitoso! Ahora puedes iniciar sesión con tu cuenta.');
      
      // Redirigir al login
      navigate('/login');
      
    } catch (error) {
      console.error('Error inesperado:', error);
      showErrorToast('Error inesperado al registrar usuario. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/50">
        <div className="mx-auto flex max-w-container items-center justify-between px-4 sm:px-6 py-4 sm:py-6 md:px-8">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand/3 rounded-full blur-3xl"></div>
          </div>
          
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-ink-primary">
              Registro de Usuario
            </h2>
            <p className="mt-2 text-center text-sm text-ink-secondary">
              Crea tu cuenta para acceder a doctor.mx
            </p>
          </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-card p-8 space-y-6">
            {/* Campo Nombre Completo */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-ink-primary mb-2">
                Nombre Completo 
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border ${
                  errors.full_name ? 'border-red-300' : 'border-gray-200'
                } placeholder-ink-muted text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 sm:text-sm`}
                placeholder="Tu nombre completo"
                value={formData.full_name}
                onChange={handleChange}
              />
              {errors.full_name && (
                <p className="mt-2 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-primary mb-2">
                Email 
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border ${
                  errors.email ? 'border-red-300' : 'border-gray-200'
                } placeholder-ink-muted text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 sm:text-sm`}
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-primary mb-2">
                Contraseña 
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border ${
                  errors.password ? 'border-red-300' : 'border-gray-200'
                } placeholder-ink-muted text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 sm:text-sm`}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-bold rounded-xl text-white shadow-cta ${
                isSubmitting
                  ? 'bg-ink-muted cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand'
              } transition-all duration-200 transform hover:scale-[1.02]`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                'Registrar Usuario'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-ink-secondary">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="font-medium text-brand hover:text-brand-dark transition-colors duration-200">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;