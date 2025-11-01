import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DashboardBanner = () => {
  const { user } = useAuth();

  if (user?.isEmailVerified) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Verifica tu correo electrónico
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Puedes usar la plataforma ahora mismo, pero verifica tu correo para acceder a todas las funciones y recibir notificaciones importantes.
            </p>
            <button
              onClick={() => supabase.auth.resend({ type: 'signup', email: user.email })}
              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Reenviar email de verificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBanner;
