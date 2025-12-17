import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'

export default async function DoctorFinancesPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca completó onboarding
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  // Si doctor es null (cache) o no está aprobado, mostrar como pending
  const isPending = !doctor || doctor.status !== 'approved'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/finances">
      <div className="max-w-6xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Finanzas</h2>
        <p className="text-gray-600 mb-8">Gestiona tus pagos y transacciones</p>

        {isPending ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-900">
              Esta sección estará disponible una vez que tu perfil sea aprobado.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen financiero */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="text-sm text-gray-600 mb-1">Ingresos este mes</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="text-sm text-gray-600 mb-1">Pendiente de cobro</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <p className="text-sm text-gray-600 mb-1">Total cobrado</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
            </div>

            {/* Transacciones */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transacciones recientes</h3>
              <p className="text-gray-500 text-center py-12">No hay transacciones registradas</p>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
