import { CheckCircle, Zap, CreditCard, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { PatientShell } from '@/components/PatientShell'
import { getPatientSubscription, getPatientPlans, checkConsultationQuota, type PatientPlan } from '@/lib/patient-subscriptions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/editorial'
import Link from 'next/link'

export default async function SuscripcionPage() {
  const { user, profile } = await requireRole('patient')
  const subscription = await getPatientSubscription(user.id)
  const quota = await checkConsultationQuota(user.id)
  const plans = subscription ? null : await getPatientPlans()

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString('es-MX')}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <PatientShell profile={{ full_name: profile.full_name }} currentPath="/app/suscripcion">
      <div className="space-y-8">
        <div>
          <Eyebrow className="mb-2">Suscripcion</Eyebrow>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Tu plan de salud
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona tu suscripcion y consulta el uso de tus beneficios.
          </p>
        </div>

        {subscription ? (
          <>
            {/* Current Plan */}
            <Card className="rounded-2xl border border-[hsl(var(--interactive)/0.2)] shadow-lg overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-border bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-lg font-semibold text-foreground">
                        {subscription.plan?.name || 'Plan activo'}
                      </CardTitle>
                      <Badge variant="success" className="mt-1">
                        Activo
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {subscription.plan ? formatPrice(subscription.plan.price_cents) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">MXN / mes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Consultas este mes</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.consultations_used} de {subscription.consultations_total}
                    </p>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${subscription.consultations_total > 0
                          ? Math.min(100, (subscription.consultations_used / subscription.consultations_total) * 100)
                          : 0}%`,
                      }}
                    />
                  </div>
                  {subscription.consultations_used >= subscription.consultations_total && (
                    <div className="flex items-center gap-2 mt-3 text-amber-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Has alcanzado tu limite de consultas este mes.
                    </div>
                  )}
                </div>

                {/* Period */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Periodo actual:{' '}
                  {formatDate(subscription.current_period_start)} —{' '}
                  {formatDate(subscription.current_period_end)}
                </div>

                {/* Features */}
                {subscription.plan?.features && subscription.plan.features.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Beneficios incluidos</p>
                    <ul className="space-y-2">
                      {subscription.plan.features.map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/app/appointments">
                <Card className="rounded-2xl border border-border hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Agendar consulta</p>
                      <p className="text-sm text-muted-foreground">Usa tus consultas incluidas</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/app/historial">
                <Card className="rounded-2xl border border-border hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Historial medico</p>
                      <p className="text-sm text-muted-foreground">Tus consultas anteriores</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* No active subscription - show plans */}
            <div className="grid gap-6 sm:grid-cols-2">
              {plans?.map((plan: PatientPlan) => (
                <Card
                  key={plan.id}
                  className={`rounded-2xl border overflow-hidden ${
                    plan.id === 'familia'
                      ? 'border-[hsl(var(--interactive)/0.4)] shadow-lg'
                      : 'border-border'
                  }`}
                >
                  {plan.id === 'familia' && (
                    <div className="px-6 py-1.5 bg-primary text-primary-foreground text-center text-xs font-medium">
                      Recomendado
                    </div>
                  )}
                  <CardHeader className="px-6 py-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display text-lg font-semibold text-foreground">
                          {plan.name}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-3xl font-bold text-foreground">
                        {formatPrice(plan.price_cents)}
                      </span>
                      <span className="text-sm text-muted-foreground">MXN / mes</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-4">
                    <ul className="space-y-2">
                      {plan.features?.map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-[hsl(var(--trust))] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/app/suscripcion/contratar?plan=${plan.id}`}>
                      <Button className="w-full" variant={plan.id === 'familia' ? 'primary' : 'secondary'}>
                        {plan.id === 'familia' ? 'Contratar Familia' : 'Contratar Cuidado Continuo'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Per-consultation option */}
            <Card className="rounded-2xl border border-border">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Consulta individual</p>
                  <p className="text-sm text-muted-foreground">
                    Paga por consulta sin suscripcion mensual.
                  </p>
                </div>
                <Link href="/doctors">
                  <Button variant="secondary">
                    Buscar doctores
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PatientShell>
  )
}
