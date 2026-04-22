import { notFound } from 'next/navigation'
import { BookingWidget } from '@/components/BookingWidget'
import { getWidgetContext } from '@/lib/widget'

export const dynamic = 'force-dynamic'

function WidgetUnavailable() {
  return (
    <div className="min-h-[100dvh] bg-[#f4f5f8] px-4 py-10 text-slate-950">
      <main className="mx-auto max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_24px_60px_rgba(15,37,95,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Doctor.mx</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
          Reservas no disponibles
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Este consultorio no tiene el widget activo en este momento.
        </p>
      </main>
    </div>
  )
}

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = await params
  const context = await getWidgetContext(doctorId, { publicOnly: true })

  if (!context) {
    const draftContext = await getWidgetContext(doctorId)
    if (!draftContext) notFound()
    return <WidgetUnavailable />
  }

  return <BookingWidget doctor={context.doctor} config={context.config} />
}
