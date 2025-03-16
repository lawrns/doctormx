import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, AlertCircle } from 'lucide-react';

function PrivacidadPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Última actualización: 1 de enero de 2025
            </p>
          </div>
          
          <div className="p-6 prose prose-blue max-w-none">
            <p>
              En Doctor.mx, accesible desde https://doctor.mx, una de nuestras principales prioridades es la privacidad de nuestros visitantes y usuarios. Esta Política de Privacidad documenta los tipos de información que recopilamos y registramos en Doctor.mx y cómo la utilizamos.
            </p>
            
            <p>
              Si tienes preguntas adicionales o requieres más información sobre nuestra Política de Privacidad, no dudes en contactarnos a través de nuestro formulario de contacto.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Información que recopilamos</h2>
            
            <p>
              Recopilamos información personal que nos proporcionas directamente cuando:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Te registras en nuestra plataforma</li>
              <li>Completas tu perfil</li>
              <li>Agendas una cita médica</li>
              <li>Participas en encuestas o cuestionarios</li>
              <li>Te comunicas con nuestro equipo de soporte</li>
            </ul>
            
            <p>
              La información personal que podemos recopilar incluye:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Fecha de nacimiento</li>
              <li>Género</li>
              <li>Dirección postal</li>
              <li>Información médica relevante para tus citas</li>
              <li>Información de pago (procesada de forma segura a través de nuestros proveedores de pago)</li>
            </ul>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Información médica:</strong> Tratamos la información médica con el más alto nivel de confidencialidad y seguridad, cumpliendo con todas las regulaciones aplicables de protección de datos de salud.
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Cómo utilizamos tu información</h2>
            
            <p>
              Utilizamos la información que recopilamos para:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Procesar y gestionar tus citas médicas</li>
              <li>Facilitar la comunicación entre pacientes y médicos</li>
              <li>Enviar notificaciones sobre tus citas y recordatorios</li>
              <li>Responder a tus consultas y solicitudes</li>
              <li>Personalizar tu experiencia en nuestra plataforma</li>
              <li>Procesar pagos y facturación</li>
              <li>Enviar información sobre nuevos servicios o funcionalidades (si has dado tu consentimiento)</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Cookies y tecnologías de seguimiento</h2>
            
            <p>
              Doctor.mx utiliza cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web.
            </p>
            
            <p>
              Utilizamos cookies para:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Mantener tu sesión activa mientras navegas por nuestra plataforma</li>
              <li>Recordar tus preferencias y configuraciones</li>
              <li>Entender cómo interactúas con nuestro sitio para mejorarlo</li>
              <li>Personalizar el contenido que ves</li>
              <li>Analizar el tráfico y el rendimiento del sitio</li>
            </ul>
            
            <p>
              Puedes gestionar tus preferencias de cookies a través de la configuración de tu navegador. Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad de nuestra plataforma.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Compartir información</h2>
            
            <p>
              Podemos compartir tu información personal en las siguientes circunstancias:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Con profesionales de la salud:</strong> Compartimos tu información con los médicos y profesionales de la salud con los que agendas citas para facilitar la atención médica.</li>
              <li><strong>Proveedores de servicios:</strong> Trabajamos con empresas que nos ayudan a operar nuestra plataforma y proporcionar servicios (como procesamiento de pagos, almacenamiento en la nube, análisis de datos).</li>
              <li><strong>Cumplimiento legal:</strong> Podemos divulgar información cuando sea requerido por ley o en respuesta a procesos legales válidos.</li>
              <li><strong>Protección de derechos:</strong> Podemos compartir información para proteger nuestros derechos, privacidad, seguridad o propiedad, así como los de nuestros usuarios.</li>
              <li><strong>Con tu consentimiento:</strong> Compartiremos tu información personal con terceros cuando nos hayas dado tu consentimiento para hacerlo.</li>
            </ul>
            
            <p>
              No vendemos ni alquilamos tu información personal a terceros para fines de marketing.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Seguridad de la información</h2>
            
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger la información personal que recopilamos. Estas medidas incluyen:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Encriptación de datos sensibles</li>
              <li>Acceso restringido a la información personal</li>
              <li>Monitoreo de sistemas para detectar vulnerabilidades</li>
              <li>Evaluaciones regulares de seguridad</li>
              <li>Capacitación de personal en prácticas de privacidad y seguridad</li>
            </ul>
            
            <p>
              Sin embargo, ningún sistema de seguridad es completamente impenetrable. No podemos garantizar la seguridad absoluta de tu información.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Tus derechos</h2>
            
            <p>
              Dependiendo de tu ubicación, puedes tener ciertos derechos relacionados con tu información personal, que incluyen:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Acceder a la información personal que tenemos sobre ti</li>
              <li>Corregir información inexacta o incompleta</li>
              <li>Eliminar tu información personal en ciertas circunstancias</li>
              <li>Restringir u oponerte al procesamiento de tu información</li>
              <li>Solicitar la portabilidad de tus datos</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
            
            <p>
              Para ejercer estos derechos, contáctanos a través de nuestro formulario de contacto o enviando un correo electrónico a privacidad@doctor.mx.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Cambios a esta política</h2>
            
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas de información o por otros motivos operativos, legales o regulatorios. Te notificaremos sobre cambios significativos a través de un aviso en nuestro sitio web o por correo electrónico.
            </p>
            
            <p>
              Te recomendamos revisar esta política regularmente para estar informado sobre cómo protegemos tu información.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Contacto</h2>
            
            <p>
              Si tienes preguntas, comentarios o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, contáctanos en:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <p><strong>Doctor.mx</strong></p>
              <p>Av. Paseo de la Reforma 222</p>
              <p>Col. Juárez, Cuauhtémoc</p>
              <p>06600, Ciudad de México</p>
              <p>Correo electrónico: privacidad@doctor.mx</p>
              <p>Teléfono: +52 55 1234 5678</p>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Protegemos tu privacidad</span>
              </div>
              <div>
                <Link to="/contacto" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  ¿Preguntas? Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-6">
          <Link to="/terminos" className="text-blue-600 hover:text-blue-800 flex items-center">
            <FileText size={16} className="mr-1" />
            Términos y condiciones
          </Link>
          <Link to="/ayuda" className="text-blue-600 hover:text-blue-800 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            Centro de ayuda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacidadPage;