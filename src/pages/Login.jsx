import React, { useState } from 'react';
import { signInUser } from '../lib/supabase.js';
import { useNavigate, useLocation } from 'react-router-dom';
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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener la ruta de origen si existe
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
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
      console.log('Iniciando sesión con Supabase:', formData.email);
      
      const { data, error } = await signInUser({
        email: formData.email,
        password: formData.password
      });
      
      if (error) {
        console.error('Error de Supabase:', error);
        
        // Manejar errores específicos de Supabase
        if (error.message.includes('Invalid login credentials')) {
          showErrorToast('Email o contraseña incorrectos.');
        } else if (error.message.includes('Email not confirmed')) {
          showErrorToast('Por favor confirma tu email antes de iniciar sesión.');
        } else {
          showErrorToast(`Error al iniciar sesión: ${error.message}`);
        }
        return;
      }
      
      console.log('Sesión iniciada exitosamente:', data);
      
      // Mostrar mensaje de éxito
      showSuccessToast('¡Bienvenido! Sesión iniciada correctamente.');
      
      // Redirigir al usuario según su origen
      // Si viene de una ruta protegida, redirigir ahí; si no, a la landing page
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Error inesperado:', error);
      showErrorToast('Error inesperado al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-sm border-b border-ink-border">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4 md:px-8">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-6 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-ink-primary mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-ink-secondary">
              Accede a tu cuenta de doctor.mx
            </p>
          </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-card border border-ink-border p-8 space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink-primary mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-ink-border'
                } placeholder-ink-muted text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200`}
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
              <label htmlFor="password" className="block text-sm font-semibold text-ink-primary mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-ink-border'
                } placeholder-ink-muted text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200`}
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3.5 px-4 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-ink-secondary">
              ¿No tienes cuenta?{' '}
              <a href="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                Regístrate aquí
              </a>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;