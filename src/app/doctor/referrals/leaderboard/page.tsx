import { requireRole } from '@/lib/auth'
import DoctorLayout from '@/components/DoctorLayout'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Eyebrow } from '@/components/editorial'
import { Trophy, ArrowLeft, Users, Star } from 'lucide-react'
import Link from 'next/link'

async function LeaderboardContent() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  const isPending = !doctor || doctor.status !== 'approved'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/referrals/leaderboard">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Ranking de referidos</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              El ranking estará disponible una vez que tu perfil sea verificado.
            </p>
          </div>
        ) : (
          <LeaderboardView doctorId={user.id} />
        )}
      </div>
    </DoctorLayout>
  )
}

async function LeaderboardView({ doctorId }: { doctorId: string }) {
  const supabaseModule = await import('@/lib/supabase/server')
  const db = await supabaseModule.createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: allReferrals } = await db
    .from('referrals')
    .select('referrer_doctor_id')
    .eq('status', 'converted')
    .gte('converted_at', startOfMonth.toISOString())

  const countMap = new Map<string, number>()
  for (const ref of allReferrals || []) {
    countMap.set(ref.referrer_doctor_id, (countMap.get(ref.referrer_doctor_id) || 0) + 1)
  }

  const allSorted = [...countMap.entries()].sort((a, b) => b[1] - a[1])
  const top10 = allSorted.slice(0, 10)

  const currentDoctorCount = countMap.get(doctorId) || 0
  const currentDoctorRank = allSorted.findIndex(([id]) => id === doctorId) + 1 || null

  const allDoctorIds = [...new Set([...top10.map(([id]) => id), doctorId])]
  const { data: doctors } = await db
    .from('doctors')
    .select('id, specialty, profile:profiles!doctors_id_fkey(full_name, photo_url)')
    .in('id', allDoctorIds)

  const doctorMap = new Map<string, { specialty: string; full_name: string; photo_url: string | null }>()
  if (doctors) {
    for (const doc of doctors) {
      const profile = Array.isArray(doc.profile) ? doc.profile[0] : doc.profile
      doctorMap.set(doc.id, {
        specialty: doc.specialty || 'Medicina General',
        full_name: profile?.full_name || 'Dr. Anónimo',
        photo_url: profile?.photo_url || null,
      })
    }
  }

  const top3Reward = 'Los 3 primeros lugares reciben 3 meses gratis'

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/doctor/referrals">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Referidos
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <Eyebrow className="mb-0">Ranking de referidos</Eyebrow>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Top 10 referidores del mes
          </h1>
        </div>
      </div>

      {/* Reward banner */}
      <Card className="mb-6 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Premio mensual</p>
              <p className="text-sm text-muted-foreground">{top3Reward}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current doctor position */}
      {currentDoctorRank && currentDoctorCount > 0 && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tu posición este mes</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  #{currentDoctorRank}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tus referidos</p>
                <p className="font-display text-2xl font-bold text-primary">
                  {currentDoctorCount}
                </p>
              </div>
            </div>
            {currentDoctorRank <= 3 && (
              <Badge className="mt-3 bg-amber-500 text-white">
                ¡Estás en el top 3! Sigue así para ganar 3 meses gratis.
              </Badge>
            )}
            {currentDoctorRank > 10 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Necesitas {Math.max(1, (countMap.get(top10[top10.length - 1]?.[0] || '') || 0) - currentDoctorCount + 1)} referidos más para entrar al top 10.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {!currentDoctorRank || currentDoctorCount === 0 ? (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Aún no tienes referidos este mes</p>
            <p className="text-sm text-muted-foreground mt-1">
              Comparte tu código de referido para aparecer en el ranking.
            </p>
            <Button asChild className="mt-4">
              <Link href="/doctor/referrals">Ir a mis referidos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Leaderboard table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Ranking Mayo 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          {top10.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm">Aún no hay referidos este mes. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-[48px_1fr_auto_auto] gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>#</span>
                <span>Doctor</span>
                <span className="hidden sm:block">Especialidad</span>
                <span className="text-right">Referidos</span>
              </div>

              {top10.map(([id, count], index) => {
                const info = doctorMap.get(id)
                const isCurrent = id === doctorId
                const rank = index + 1

                return (
                  <div
                    key={id}
                    className={`grid grid-cols-[48px_1fr_auto_auto] gap-3 items-center px-3 py-3 rounded-xl transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 border border-primary/20'
                        : rank <= 3
                          ? 'bg-amber-500/5'
                          : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          rank === 1
                            ? 'bg-amber-500 text-white'
                            : rank === 2
                              ? 'bg-slate-400 text-white'
                              : rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {rank}
                      </div>
                    </div>
                    <div>
                      <p className={`font-semibold text-foreground ${isCurrent ? 'text-primary' : ''}`}>
                        {index < 3 ? info?.full_name || `Top ${rank}` : 'Dr. Anónimo'}
                        {isCurrent && (
                          <span className="ml-2 text-xs text-primary font-normal">(tú)</span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {info?.specialty || '—'}
                    </span>
                    <div className="text-right">
                      <Badge variant={rank <= 3 ? 'default' : 'secondary'} className={rank <= 3 ? 'bg-amber-500' : ''}>
                        {count}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-6">
        El ranking se actualiza diariamente. Los premios se otorgan el primer día del mes siguiente.
      </p>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LeaderboardContent />
    </Suspense>
  )
}
