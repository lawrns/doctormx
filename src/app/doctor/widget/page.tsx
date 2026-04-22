import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { requireRole } from '@/lib/auth'
import { getWidgetContext } from '@/lib/widget'
import { WidgetSettingsClient } from './WidgetSettingsClient'

function getBaseUrl(host: string | null, proto: string | null) {
  const resolvedHost = host || 'doctor.mx'
  const protocol = proto || (resolvedHost.includes('localhost') ? 'http' : 'https')
  return `${protocol}://${resolvedHost}`
}

export default async function DoctorWidgetPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  if (!doctor || doctor.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  const context = await getWidgetContext(user.id)
  if (!context) {
    redirect('/doctor/onboarding')
  }

  const isPending = doctor.status === 'pending' || doctor.status === 'rejected'
  const requestHeaders = await headers()
  const baseUrl = getBaseUrl(
    requestHeaders.get('x-forwarded-host') || requestHeaders.get('host'),
    requestHeaders.get('x-forwarded-proto')
  )

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/widget">
      <WidgetSettingsClient
        doctor={context.doctor}
        initialConfig={context.config}
        widgetUrl={`${baseUrl}/widget/${user.id}`}
      />
    </DoctorLayout>
  )
}
