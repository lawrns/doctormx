'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Gift,
  Users,
  CheckCircle,
  Copy,
  Share2,
  Mail,
  ArrowLeft,
  TrendingUp,
  Zap,
} from 'lucide-react'

interface ReferralSummary {
  code: string
  shareUrl: string
  totalRedeemed: number
  totalRewarded: number
  creditsCents: number
  freeConsultsRemaining: number
}

function ReferralsContent() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/patient-referrals')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.summary) {
          setSummary(data.summary)
        } else {
          setError(data.error || 'Error al cargar datos de referidos')
        }
      })
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false))
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const whatsappMessage = encodeURIComponent(
    `¡Únete a Doctor.mx! La plataforma de telemedicina con IA. ` +
    `Usa mi código ${summary?.code || ''} y obtén una consulta gratis. ` +
    `${summary?.shareUrl || ''}`
  )

  const emailSubject = encodeURIComponent('Únete a Doctor.mx con mi código')
  const emailBody = encodeURIComponent(
    `¡Hola!\n\nTe invito a Doctor.mx, la plataforma de telemedicina que estoy usando. ` +
    `Regístrate con mi código ${summary?.code || ''} y obtén una consulta gratis.\n\n` +
    `${summary?.shareUrl || ''}\n\nSaludos.`
  )

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Panel
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Comparte y gana consultas gratis
          </h1>
          <p className="text-muted-foreground text-sm">
            Por cada persona que se registre con tu código, ganas una consulta gratis
          </p>
        </div>
      </div>

      {/* Referral Code Card */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700">
                <Share2 className="h-3.5 w-3.5" />
                Tu código de referido
              </div>

              <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-card/80 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Código
                </p>
                <p className="mt-1 font-mono text-3xl font-bold tracking-[0.25em] text-foreground">
                  {summary?.code || '—'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground break-all">
                  {summary?.shareUrl || ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => copyToClipboard(summary?.shareUrl || '')}
                  variant="outline"
                  className="border-emerald-200 hover:bg-emerald-50"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar enlace
                    </>
                  )}
                </Button>
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
                <Button asChild variant="outline">
                  <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Compartir por email
                  </a>
                </Button>
              </div>
            </div>

            {/* Rewards preview */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-card p-5 min-w-[220px]">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                <Gift className="h-3.5 w-3.5" />
                Recompensas
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Tú recibes
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    1 consulta gratis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Por cada persona que se registre con tu código.
                  </p>
                </div>
                <div className="rounded-2xl bg-card/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Tu amigo recibe
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    1 consulta gratis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Al registrarse con tu código.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">
              {summary?.totalRedeemed || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Has referido <span className="font-medium text-foreground">personas</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">
              {summary?.freeConsultsRemaining || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Consultas gratis <span className="font-medium text-foreground">ganadas</span>
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">
              {summary?.totalRewarded || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Recompensas <span className="font-medium text-foreground">otorgadas</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pro tip */}
      <Card className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Tip: Maximiza tus consultas gratis</p>
              <p className="text-sm text-muted-foreground mt-1">
                Comparte tu código en grupos de WhatsApp, redes sociales, o con familiares.
                Cada persona que se registre te da una consulta gratis con IA. Sin límite mensual para pacientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReferralsContent
