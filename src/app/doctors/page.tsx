import { discoverDoctors, getAvailableSpecialties } from '@/lib/discovery'
import { formatDoctorName } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/ui/input'
import { User, LogOut, ArrowLeft } from 'lucide-react'
import { SortSelect } from '@/components/SortSelect'

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    specialty?: string
    search?: string
    sortBy?: 'rating' | 'price' | 'experience'
    sortOrder?: 'asc' | 'desc'
    appointmentType?: 'all' | 'video' | 'in_person'
  }>
}) {
  const params = await searchParams

  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    profile = data
  }

  const [doctors, specialties] = await Promise.all([
    discoverDoctors({
      specialtySlug: params.specialty,
      searchQuery: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      appointmentType: params.appointmentType as 'all' | 'video' | 'in_person' | undefined,
    }),
    getAvailableSpecialties(),
  ])

  const buildQueryString = (newParams: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params.specialty) searchParams.set('specialty', params.specialty)
    if (params.search) searchParams.set('search', params.search)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    if (params.appointmentType) searchParams.set('appointmentType', params.appointmentType)

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value)
      } else {
        searchParams.delete(key)
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
            Doctores Verificados
          </h1>
          <p className="text-lg text-neutral-600">
            Todos nuestros doctores están verificados con cédula profesional
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 border-neutral-200">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <form className="flex-1" action="/doctors" method="GET">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  type="search"
                  name="search"
                  placeholder="Buscar por nombre del doctor..."
                  defaultValue={params.search}
                  className="pl-10 w-full"
                />
              </div>
              {params.specialty && <input type="hidden" name="specialty" value={params.specialty} />}
              {params.sortBy && <input type="hidden" name="sortBy" value={params.sortBy} />}
              {params.sortOrder && <input type="hidden" name="sortOrder" value={params.sortOrder} />}
            </form>

            {/* Sort Dropdown */}
            <div className="flex gap-2">
              <SortSelect
                defaultValue={params.sortBy || 'rating'}
                currentParams={{
                  specialty: params.specialty,
                  search: params.search,
                  sortOrder: params.sortOrder
                }}
              />

              <Link
                href={`/doctors${buildQueryString({ sortOrder: params.sortOrder === 'asc' ? undefined : 'asc' })}`}
                className="inline-flex"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className={params.sortOrder === 'asc' ? 'bg-primary-50' : ''}
                  title={params.sortOrder === 'asc' ? 'Orden descendente' : 'Orden ascendente'}
                >
                  {params.sortOrder === 'asc' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Appointment Type Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href={`/doctors${buildQueryString({ appointmentType: undefined })}`}>
              <Badge
                variant={!params.appointmentType || params.appointmentType === 'all' ? "default" : "outline"}
                className={`px-4 py-2 text-sm cursor-pointer ${!params.appointmentType || params.appointmentType === 'all' ? 'bg-primary-500 hover:bg-primary-600' : 'hover:bg-neutral-100'}`}
              >
                Todas
              </Badge>
            </Link>
            <Link href={`/doctors${buildQueryString({ appointmentType: 'video' })}`}>
              <Badge
                variant={params.appointmentType === 'video' ? "default" : "outline"}
                className={`px-4 py-2 text-sm cursor-pointer ${params.appointmentType === 'video' ? 'bg-primary-500 hover:bg-primary-600' : 'hover:bg-neutral-100'}`}
              >
                Videoconsulta disponible
              </Badge>
            </Link>
            <Link href={`/doctors${buildQueryString({ appointmentType: 'in_person' })}`}>
              <Badge
                variant={params.appointmentType === 'in_person' ? "default" : "outline"}
                className={`px-4 py-2 text-sm cursor-pointer ${params.appointmentType === 'in_person' ? 'bg-primary-500 hover:bg-primary-600' : 'hover:bg-neutral-100'}`}
              >
                Consulta presencial
              </Badge>
            </Link>
          </div>

          {/* Specialty Filter */}
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrar por especialidad
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link href={`/doctors${buildQueryString({ specialty: undefined })}`}>
              <Badge
                variant={!params.specialty ? "default" : "outline"}
                className={`px-4 py-2 text-sm cursor-pointer ${!params.specialty ? 'bg-primary-500 hover:bg-primary-600' : 'hover:bg-neutral-100'}`}
              >
                Todas
              </Badge>
            </Link>
            {specialties.map((specialty: { id: string; slug: string; name: string }) => (
              <Link key={specialty.id} href={`/doctors${buildQueryString({ specialty: specialty.slug })}`}>
                <Badge
                  variant={params.specialty === specialty.slug ? "default" : "outline"}
                  className={`px-4 py-2 text-sm cursor-pointer ${params.specialty === specialty.slug ? 'bg-primary-500 hover:bg-primary-600' : 'hover:bg-neutral-100'}`}
                >
                  {specialty.name}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-neutral-600">
          <span className="font-medium text-neutral-900">{(doctors as typeof doctors[]).length}</span> doctor{(doctors as typeof doctors[]).length !== 1 ? 'es' : ''} encontrado{(doctors as typeof doctors[]).length !== 1 ? 's' : ''}
        </div>

        {/* Doctors Grid */}
        {(doctors as typeof doctors[]).length === 0 ? (
          <Card className="text-center py-16 border-neutral-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No encontramos doctores</h3>
            <p className="text-neutral-500 max-w-sm mx-auto mb-6">
              Intenta con otra especialidad o término de búsqueda. También puedes consultar con Dr. Simeon mientras tanto.
            </p>
            <Link href="/app/second-opinion">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Consultar con Dr. Simeon IA
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/doctors/${doctor.id}`}
                className="group"
              >
                <Card className="p-6 border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all h-full">
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl overflow-hidden">
                        {doctor.profile?.photo_url ? (
                          <Image
                            src={doctor.profile.photo_url}
                            alt={doctor.profile.full_name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 text-lg truncate group-hover:text-primary-500 transition-colors">
                        {formatDoctorName(doctor.profile?.full_name)}
                      </h3>
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs mt-1">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verificado
                      </Badge>
                    </div>
                  </div>

                  {/* Specialties */}
                  {doctor.specialties && doctor.specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-primary-500 font-medium">
                        {doctor.specialties.map((s: { id: string; name: string }) => s.name).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Info */}
                  <div className="space-y-2 text-sm text-neutral-600">
                    {doctor.city && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {doctor.city}, {doctor.state}
                      </p>
                    )}
                    {doctor.years_experience && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {doctor.years_experience} años de experiencia
                      </p>
                    )}
                    {doctor.rating_avg > 0 && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium text-neutral-900">{doctor.rating_avg.toFixed(1)}</span>
                        <span className="text-neutral-400">({doctor.rating_count} reseñas)</span>
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-neutral-900">
                          ${(doctor.price_cents / 100).toLocaleString('es-MX')} <span className="text-sm font-normal text-neutral-500">{doctor.currency}</span>
                        </p>
                        <p className="text-sm text-neutral-400">por consulta</p>
                      </div>
                      <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                        Ver perfil
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-neutral-900">Doctor.mx</span>
            </div>
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
