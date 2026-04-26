import { requireRole } from '@/lib/auth'
import DoctorLayout from '@/components/DoctorLayout'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Eyebrow } from '@/components/editorial'
import {
  Gift,
  Share2,
  Users,
  CheckCircle,
  Clock,
  Copy,
  Trophy,
  ArrowRight,
  Mail,
  HelpCircle,
  UserPlus,
  TrendingUp,
  Star,
} from 'lucide-react'
import Link from 'next/link'

async function DoctorReferralsContent() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  const isPending = !doctor || doctor.status !== 'approved'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/referrals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Programa de referidos</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              El programa de referidos estará disponible una vez que tu perfil sea verificado.
            </p>
          </div>
        ) : (
          <ReferralsDashboard doctorId={user.id} />
        )}
      </div>
    </DoctorLayout>
  )
}

async function ReferralsDashboard({ doctorId }: { doctorId: string }) {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx'
  const supabaseModule = await import('@/lib/supabase/server')
  const supabase = await supabaseModule.createClient()

  const { data: codeData } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('doctor_id', doctorId)
    .single()

  const code = codeData?.code || ''
  const shareUrl = `${BASE_URL}/connect?ref=${code}`
  const registerUrl = `${BASE_URL}/auth/register?ref=${code}`

  const { data: referrals } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_doctor_id', doctorId)

  const total = referrals?.length || 0
  const converted = referrals?.filter((r: { status: string }) => r.status === 'converted').length || 0
  const pending = referrals?.filter((r: { status: string }) => r.status === 'pending').length || 0
  const expired = referrals?.filter((r: { status: string }) => r.status === 'expired').length || 0

  const { data: rewards } = await supabase
    .from('referral_rewards')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(5)

  const whatsappMessage = encodeURIComponent(
    `Te recomiendo Doctor.mx para tu consultorio. Regístrate con mi código ${code} y obtén 50% de descuento en tu primer mes. ${registerUrl}`
  )
  const emailSubject = encodeURIComponent('Únete a Doctor.mx con mi código de referido')
  const emailBody = encodeURIComponent(
    `Hola,\n\nTe recomiendo Doctor.mx, la plataforma de telemedicina para médicos en México. ` +
    `Regístrate con mi código ${code} y obtén 50% de descuento en tu primer mes.\n\n` +
    `Enlace: ${registerUrl}\n\nSaludos.`
  )

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <Eyebrow className="mb-0">Programa de referidos</Eyebrow>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Invita colegas y gana meses gratis
          </h1>
        </div>
      </div>

      {/* Referral Code Hero Card */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Share2 className="h-3.5 w-3.5" />
                Tu código de referido
              </div>

              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/80 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Código
                </p>
                <p className="mt-1 font-mono text-3xl font-bold tracking-[0.25em] text-foreground">
                  {code}
                </p>
                <p className="mt-2 text-sm text-muted-foreground break-all">{shareUrl}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <CopyButton text={shareUrl} />
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                >
                  <a
                    href={`https://wa.me/?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Compartir por WhatsApp
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                >
                  <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Compartir por email
                  </a>
                </Button>
              </div>
            </div>

            {/* Rewards preview */}
            <div className="rounded-2xl border border-primary/20 bg-card/95 p-5 min-w-[240px]">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Trophy className="h-3.5 w-3.5" />
                Recompensas
              </div>
              <div className="mt-4 space-y-3">
                <RewardMilestone count={1} label="1 mes gratis" active={converted >= 1} />
                <RewardMilestone count={3} label="2 meses gratis" active={converted >= 3} />
                <RewardMilestone count={5} label="Upgrade a Pro 1 mes" active={converted >= 5} />
                <RewardMilestone count={10} label="6 meses gratis" active={converted >= 10} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatBox
          icon={<Users className="w-5 h-5" />}
          value={total}
          label="Has referido"
          unit="médicos"
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatBox
          icon={<CheckCircle className="w-5 h-5" />}
          value={converted}
          label="Conversiones"
          unit="registrados"
          color="text-[hsl(var(--trust))]"
          bgColor="bg-[hsl(var(--trust)/0.10)]"
        />
        <StatBox
          icon={<Clock className="w-5 h-5" />}
          value={pending}
          label="Pendientes"
          unit="por confirmar"
          color="text-amber"
          bgColor="bg-amber/10"
        />
        <StatBox
          icon={<TrendingUp className="w-5 h-5" />}
          value={rewards?.length || 0}
          label="Recompensas"
          unit="ganadas"
          color="text-purple-600"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Leaderboard Teaser + How it works */}
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <CardTitle className="font-display text-lg font-semibold">
                  Top 10 referidores del mes
                </CardTitle>
              </div>
              <Badge variant="secondary">Mayo 2026</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Los 3 primeros lugares ganan 3 meses gratis.
            </p>
          </CardHeader>
          <CardContent>
            <LeaderboardTeaser />
            <Button asChild variant="secondary" className="w-full mt-4" size="sm">
              <Link href="/doctor/referrals/leaderboard">
                Ver ranking completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <CardTitle className="font-display text-lg font-semibold">
                ¿Cómo funciona?
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <HowItWorksStep
                step="1"
                icon={<UserPlus className="w-5 h-5" />}
                title="Comparte tu código"
                description="Envía tu código o enlace de referido a colegas médicos por WhatsApp, email o redes sociales."
              />
              <HowItWorksStep
                step="2"
                icon={<CheckCircle className="w-5 h-5" />}
                title="Ellos se registran"
                description="Cuando un colega se registra en Doctor.mx usando tu código, queda vinculado a tu cuenta."
              />
              <HowItWorksStep
                step="3"
                icon={<Gift className="w-5 h-5" />}
                title="Tú ganas recompensas"
                description="Por cada colega que completa su registro y se suscribe, ganas meses gratis en tu plan."
              />
              <HowItWorksStep
                step="4"
                icon={<Star className="w-5 h-5" />}
                title="Escala en el ranking"
                description="Los 3 médicos con más referidos cada mes reciben 3 meses gratis adicionales."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Rewards */}
      {rewards && rewards.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <CardTitle className="font-display text-lg font-semibold">
                Tus recompensas ganadas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rewards.map((reward: { id: string; description: string; reward_type: string; reward_value: number; created_at: string }) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{reward.description}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(reward.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function CopyButton({ text }: { text: string }) {
  return (
    <CopyButtonClient text={text} />
  )
}

function CopyButtonClient({ text }: { text: string }) {
  'use client'
  return (
    <Button
      variant="outline"
      onClick={() => {
        navigator.clipboard.writeText(text)
        const btn = document.activeElement as HTMLElement
        if (btn) {
          const original = btn.textContent
          btn.textContent = '¡Copiado!'
          setTimeout(() => { btn.textContent = original }, 2000)
        }
      }}
    >
      <Copy className="w-4 h-4 mr-2" />
      Copiar enlace
    </Button>
  )
}

function StatBox({
  icon,
  value,
  label,
  unit,
  color,
  bgColor,
}: {
  icon: React.ReactNode
  value: number
  label: string
  unit: string
  color: string
  bgColor: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
            <span className={color}>{icon}</span>
          </div>
        </div>
        <p className="font-display text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {label} <span className="font-medium text-foreground">{unit}</span>
        </p>
      </CardContent>
    </Card>
  )
}

function RewardMilestone({
  count,
  label,
  active,
}: {
  count: number
  label: string
  active: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-xl ${
        active ? 'bg-primary/5' : 'bg-secondary/50'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {active ? <CheckCircle className="w-4 h-4" /> : count}
      </div>
      <span className={active ? 'font-medium text-foreground' : 'text-muted-foreground'}>
        {label}
      </span>
      {active && <Badge className="ml-auto bg-primary/10 text-primary">Ganado</Badge>}
    </div>
  )
}

function HowItWorksStep({
  step,
  icon,
  title,
  description,
}: {
  step: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <span className="font-mono text-sm font-bold">{step}</span>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary">{icon}</span>
          <p className="font-semibold text-foreground">{title}</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

async function LeaderboardTeaser() {
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

  const topIds = [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (topIds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p>Aún no hay referidos este mes. ¡Sé el primero!</p>
      </div>
    )
  }

  const doctorIds = topIds.map(([id]) => id)
  const { data: doctors } = await db.from('doctors')
    .select('id, profile:profiles!doctors_id_fkey(full_name)')
    .in('id', doctorIds)

  const nameMap = new Map<string, string>()
  if (doctors) {
    for (const doc of doctors) {
      const profile = Array.isArray(doc.profile) ? doc.profile[0] : doc.profile
      nameMap.set(doc.id, profile?.full_name || 'Dr. Anónimo')
    }
  }

  return (
    <div className="space-y-2">
      {topIds.map(([id, count], index) => (
        <div
          key={id}
          className={`flex items-center justify-between p-3 rounded-xl ${
            index === 0 ? 'bg-amber-500/10 border border-amber-200' : 'bg-secondary/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0
                  ? 'bg-amber-500 text-white'
                  : index === 1
                    ? 'bg-slate-400 text-white'
                    : 'bg-amber-700 text-white'
              }`}
            >
              {index + 1}
            </div>
            <span className="font-medium text-foreground">
              {nameMap.get(id) || 'Dr. Anónimo'}
            </span>
          </div>
          <Badge variant="secondary">{count} referidos</Badge>
        </div>
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export default function DoctorReferralsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DoctorReferralsContent />
    </Suspense>
  )
}
