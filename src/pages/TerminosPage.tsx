import { Link } from 'react-router-dom';
import { FileText, Shield, AlertCircle } from 'lucide-react';

function TerminosPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Última actualización: 1 de enero de 2025
            </p>
          </div>
          
          <div className="p-6 prose prose-blue max-w-none">
            <p>
              Bienvenido a Doctor.mx. Estos Términos y Condiciones rigen tu uso de nuestra plataforma, accesible desde https://doctor.mx, y todos los servicios relacionados. Al acceder o utilizar nuestra plataforma, aceptas estar legalmente obligado por estos términos. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestra plataforma.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Importante:</strong> Doctor.mx no proporciona asesoramiento médico. La plataforma facilita la conexión entre pacientes y profesionales de la salud. Cualquier información médica proporcionada a través de nuestra plataforma debe ser considerada como información general y no como un sustituto del consejo médico profesional.
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Definiciones</h2>
            
            <ul className="list-disc pl-6 mb-4">
              <li><strong>"Plataforma"</strong> se refiere al sitio web y aplicación móvil de Doctor.mx.</li>
              <li><strong>"Usuario"</strong> se refiere a cualquier persona que acceda o utilice la Plataforma.</li>
              <li><strong>"Paciente"</strong> se refiere a un Usuario que busca servicios médicos a través de la Plataforma.</li>
              <li><strong>"Profesional de la salud"</strong> se refiere a médicos, especialistas y otros proveedores de servicios de salud registrados en la Plataforma.</li>
              <li><strong>"Servicios"</strong> se refiere a todos los servicios ofrecidos a través de la Plataforma, incluyendo pero no limitado a la búsqueda de profesionales de la salud, agendamiento de citas, telemedicina y gestión de información médica.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Registro y cuentas de usuario</h2>
            
            <p>
              Para utilizar ciertos servicios de nuestra Plataforma, deberás crear una cuenta. Al registrarte, aceptas:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Proporcionar información precisa, actualizada y completa.</li>
              <li>Mantener la confidencialidad de tu contraseña y ser responsable de todas las actividades que ocurran bajo tu cuenta.</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.</li>
              <li>No crear más de una cuenta personal ni crear una cuenta para otra persona sin autorización.</li>
              <li>No transferir tu cuenta a ninguna otra persona sin nuestro consentimiento previo por escrito.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Uso de la plataforma</h2>
            
            <p>
              Al utilizar nuestra Plataforma, aceptas:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Utilizar la Plataforma de acuerdo con estos Términos y todas las leyes y regulaciones aplicables.</li>
              <li>No utilizar la Plataforma para fines ilegales o no autorizados.</li>
              <li>No intentar acceder, utilizar o manipular los sistemas, servidores o bases de datos de Doctor.mx de manera no autorizada.</li>
              <li>No interferir con el funcionamiento adecuado de la Plataforma.</li>
              <li>No recopilar información de otros usuarios sin su consentimiento.</li>
              <li>No utilizar la Plataforma para transmitir virus, malware u otro código malicioso.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Servicios médicos</h2>
            
            <p>
              Doctor.mx facilita la conexión entre Pacientes y Profesionales de la salud, pero no proporciona servicios médicos directamente. Al utilizar nuestra Plataforma:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Reconoces que los Profesionales de la salud son independientes y no son empleados o agentes de Doctor.mx.</li>
              <li>Entiendes que cualquier relación médico-paciente se establece directamente entre tú y el Profesional de la salud.</li>
              <li>Aceptas que Doctor.mx no es responsable de la calidad, adecuación o resultados de los servicios médicos proporcionados por los Profesionales de la salud.</li>
              <li>Reconoces que la telemedicina puede no ser adecuada para todas las condiciones médicas y que algunas situaciones pueden requerir atención presencial.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Citas y cancelaciones</h2>
            
            <p>
              Al agendar una cita a través de nuestra Plataforma:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Te comprometes a asistir a la cita en la fecha y hora programadas o a cancelarla con al menos 24 horas de anticipación.</li>
              <li>Entiendes que las cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a cargos según la política del Profesional de la salud.</li>
              <li>Reconoces que los Profesionales de la salud pueden necesitar reprogramar o cancelar citas en circunstancias excepcionales.</li>
              <li>Aceptas que Doctor.mx no es responsable por citas perdidas, canceladas o reprogramadas.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Pagos y facturación</h2>
            
            <p>
              Al utilizar servicios de pago en nuestra Plataforma:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Aceptas pagar todas las tarifas aplicables por los servicios que recibas.</li>
              <li>Autorizas a Doctor.mx a procesar los pagos utilizando los métodos de pago que proporciones.</li>
              <li>Entiendes que las tarifas por servicios médicos son establecidas por los Profesionales de la salud, no por Doctor.mx.</li>
              <li>Reconoces que algunos servicios pueden estar cubiertos por seguros médicos, pero es tu responsabilidad verificar la cobertura con tu aseguradora.</li>
              <li>Aceptas que todos los pagos procesados son finales, sujetos a nuestra política de reembolsos.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Propiedad intelectual</h2>
            
            <p>
              La Plataforma y todo su contenido, características y funcionalidades son propiedad de Doctor.mx o de sus licenciantes y están protegidos por leyes de propiedad intelectual. No puedes:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Modificar, copiar, distribuir, transmitir, mostrar, ejecutar, reproducir, publicar, licenciar, crear trabajos derivados, transferir o vender cualquier información obtenida de la Plataforma sin nuestro consentimiento previo por escrito.</li>
              <li>Utilizar nuestras marcas comerciales, logotipos u otros materiales protegidos sin nuestra autorización expresa.</li>
              <li>Eliminar avisos de derechos de autor, marcas comerciales u otros avisos de propiedad de cualquier contenido de la Plataforma.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Privacidad</h2>
            
            <p>
              Tu privacidad es importante para nosotros. Nuestra <Link to="/privacidad" className="text-blue-600 hover:text-blue-800">Política de Privacidad</Link> describe cómo recopilamos, utilizamos y protegemos tu información personal. Al utilizar nuestra Plataforma, aceptas nuestras prácticas de privacidad.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Limitación de responsabilidad</h2>
            
            <p>
              En la máxima medida permitida por la ley:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Doctor.mx proporciona la Plataforma "tal cual" y "según disponibilidad", sin garantías de ningún tipo.</li>
              <li>No garantizamos que la Plataforma sea ininterrumpida, oportuna, segura o libre de errores.</li>
              <li>No somos responsables de la precisión, confiabilidad, disponibilidad o idoneidad de la información o servicios obtenidos a través de la Plataforma.</li>
              <li>No seremos responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de ganancias, datos o uso.</li>
              <li>Nuestra responsabilidad total hacia ti por cualquier reclamo relacionado con estos Términos o la Plataforma no excederá la cantidad que hayas pagado a Doctor.mx en los 12 meses anteriores al reclamo.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Indemnización</h2>
            
            <p>
              Aceptas indemnizar, defender y eximir de responsabilidad a Doctor.mx y sus directores, funcionarios, empleados y agentes de cualquier reclamo, responsabilidad, daño, pérdida y gasto (incluidos honorarios y costos legales razonables) que surjan de o estén relacionados con:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Tu uso de la Plataforma.</li>
              <li>Tu violación de estos Términos.</li>
              <li>Tu violación de los derechos de terceros, incluidos los Profesionales de la salud.</li>
              <li>Tu conducta en relación con la Plataforma.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">11. Modificaciones</h2>
            
            <p>
              Podemos modificar estos Términos en cualquier momento a nuestra discreción. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la Plataforma. Tu uso continuado de la Plataforma después de cualquier modificación constituye tu aceptación de los Términos modificados. Es tu responsabilidad revisar regularmente estos Términos.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">12. Terminación</h2>
            
            <p>
              Podemos, a nuestra discreción, suspender o terminar tu acceso a la Plataforma en cualquier momento y por cualquier motivo, incluida la violación de estos Términos. Tras la terminación:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Tu derecho a utilizar la Plataforma cesará inmediatamente.</li>
              <li>Podemos eliminar o desactivar tu cuenta y toda la información relacionada.</li>
              <li>Todas las disposiciones de estos Términos que por su naturaleza deberían sobrevivir a la terminación sobrevivirán, incluidas las disposiciones de propiedad, exenciones de garantía, indemnización y limitaciones de responsabilidad.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">13. Disposiciones generales</h2>
            
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Ley aplicable:</strong> Estos Términos se regirán e interpretarán de acuerdo con las leyes de México, sin tener en cuenta sus principios de conflicto de leyes.</li>
              <li><strong>Resolución de disputas:</strong> Cualquier disputa que surja de o esté relacionada con estos Términos o la Plataforma se resolverá mediante arbitraje vinculante en la Ciudad de México, de acuerdo con las reglas de la Cámara Nacional de Comercio.</li>
              <li><strong>Divisibilidad:</strong> Si alguna disposición de estos Términos se considera inválida o inaplicable, dicha disposición se interpretará de manera consistente con la ley aplicable para reflejar, en la medida de lo posible, las intenciones originales de las partes, y las disposiciones restantes permanecerán en pleno vigor y efecto.</li>
              <li><strong>Renuncia:</strong> Ninguna renuncia a cualquier término de estos Términos se considerará una renuncia adicional o continua de dicho término o cualquier otro término.</li>
              <li><strong>Acuerdo completo:</strong> Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre tú y Doctor.mx con respecto a tu uso de la Plataforma.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">14. Contacto</h2>
            
            <p>
              Si tienes preguntas o comentarios sobre estos Términos, contáctanos en:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <p><strong>Doctor.mx</strong></p>
              <p>Av. Paseo de la Reforma 222</p>
              <p>Col. Juárez, Cuauhtémoc</p>
              <p>06600, Ciudad de México</p>
              <p>Correo electrónico: legal@doctor.mx</p>
              <p>Teléfono: +52 55 1234 5678</p>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Protegemos tus derechos</span>
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
          <Link to="/privacidad" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Shield size={16} className="mr-1" />
            Política de privacidad
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

export default TerminosPage;