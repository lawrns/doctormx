import { requireRole } from '@/lib/auth'
import { AdminShell } from '@/components/AdminShell'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'

type Specialty = {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export default async function AdminSpecialtiesPage() {
  const { profile, supabase } = await requireRole('admin')

  let specialties: Specialty[] = []
  try {
    const { data } = await supabase
      .from('specialties')
      .select('*')
      .order('name')
    specialties = (data || []) as Specialty[]
  } catch (err) {
    console.error('Failed to load specialties:', err)
  }

  return (
    <AdminShell profile={{ full_name: profile.full_name }} currentPath="/admin/specialties">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Especialidades</h1>
        <p className="text-muted-foreground">Gestiona las especialidades médicas del directorio.</p>
      </div>

      {specialties.length === 0 ? (
        <EmptyState
          iconName="search"
          title="No hay especialidades"
          description="No se encontraron especialidades en el catálogo."
        />
      ) : (
        <div className="rounded-lg border bg-card shadow">
          <div className="grid grid-cols-[2fr_1fr_2fr_auto] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Nombre</span>
            <span>Slug</span>
            <span>Descripción</span>
            <span>Creado</span>
          </div>
          {specialties.map((specialty) => (
            <div key={specialty.id} className="grid grid-cols-[2fr_1fr_2fr_auto] gap-4 border-b px-5 py-4 last:border-b-0 items-center">
              <span className="font-medium text-foreground">{specialty.name}</span>
              <Badge variant="outline" className="w-fit">{specialty.slug}</Badge>
              <span className="text-sm text-muted-foreground truncate">
                {specialty.description || 'Sin descripción'}
              </span>
              <span className="text-sm text-muted-foreground">
                {new Date(specialty.created_at).toLocaleDateString('es-MX')}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
