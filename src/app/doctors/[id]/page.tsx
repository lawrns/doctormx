import { getDoctorProfile } from '@/lib/discovery'
import { getDoctorReviews, getDoctorRatingSummary } from '@/lib/reviews'
import { formatCurrency, formatDoctorName, formatLanguageName } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { DoctorReviews } from '@/components/DoctorReviews'
import { ArrowLeft } from 'lucide-react'

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const doctor = await getDoctorProfile(id)

  if (!doctor) {
    notFound()
  }

  // Cast doctor to proper type to avoid type errors from getDoctorProfile returning {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = doctor as any

  const [reviews, ratingSummary] = await Promise.all([
    getDoctorReviews(id, { limit: 10 }),
    getDoctorRatingSummary(id).then(result => result || null),
  ])

  const totalConsultations = ratingSummary?.rating_count || 0
  const averageRating = doc.rating_avg || ratingSummary?.rating_avg || 0

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/ai-consulta" className="flex items-center gap-1.5 text-neutral-600 hover:text-primary-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Volver</span>
            </Link>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-neutral-900">Doctor.mx</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Info Card */}
            <div className="bg-white rounded-2xl shadow-card border border-border p-8 animate-fade-in-up">
              <div className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl overflow-hidden">
                    {doc.profile?.photo_url ? (
                      <Image
                        src={doc.profile.photo_url}
                        alt={doc.profile.full_name}
                        width={112}
                        height={112}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-info-100">
                        <svg className="w-14 h-14 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-ink-primary mb-3">
                    {formatDoctorName(doc.profile?.full_name)}
                  </h1>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 bg-success-100 text-success-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </span>
                    {doc.specialties?.map((s: { id: string; name: string }) => (
                      <span
                        key={s.id}
                        className="bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 text-sm text-ink-secondary">
                    {doc.years_experience && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><span className="font-semibold text-ink-primary">{doc.years_experience}</span> años de experiencia</span>
                      </div>
                    )}
                    {doc.rating_avg > 0 && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span><span className="font-semibold text-ink-primary">{doc.rating_avg.toFixed(1)}</span> ({doc.rating_count} reseñas)</span>
                      </div>
                    )}
                    {doc.city && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{doc.city}, {doc.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {doc.bio && (
              <div className="bg-white rounded-2xl shadow-card border border-border p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h2 className="text-xl font-bold text-ink-primary mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sobre el Doctor
                </h2>
                <p className="text-ink-secondary whitespace-pre-line leading-relaxed">{doc.bio}</p>
              </div>
            )}

            {/* Languages */}
            {doc.languages && doc.languages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-border p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-xl font-bold text-ink-primary mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Idiomas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {doc.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="bg-secondary-100 text-ink-secondary px-4 py-2 rounded-xl text-sm font-medium"
                    >
                      {formatLanguageName(lang)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <DoctorReviews
                reviews={reviews}
                totalReviews={totalConsultations}
                averageRating={averageRating}
              />
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-border p-6 sticky top-24 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="mb-6">
                <p className="text-sm text-ink-muted mb-1">Precio de consulta</p>
                <p className="text-4xl font-bold text-ink-primary">
                  {formatCurrency(doc.price_cents, doc.currency)}
                </p>
              </div>

              <Link
                href={`/book/${doc.id}`}
                className="w-full bg-primary-500 text-white py-4 rounded-xl hover:bg-primary-600 transition-all font-semibold text-center block shadow-primary-glow hover:shadow-lg btn-press"
              >
                Agendar Consulta
              </Link>

              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Consulta por videollamada</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>Pago seguro en línea</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span>Receta electrónica</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Doctor verificado</span>
                </div>
              </div>

              {/* AI Pre-consultation badge */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">Pre-consulta con IA</p>
                    <p className="text-xs text-ink-muted">Dr. Simeon prepara tu caso</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-elevated py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-ink-primary">Doctor.mx</span>
            </div>
            <p className="text-ink-muted text-sm">
              © 2025 Doctor.mx. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
