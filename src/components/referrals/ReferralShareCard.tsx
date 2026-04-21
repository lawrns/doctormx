'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { Check, Copy, Gift, QrCode, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppShare } from '@/components/WhatsAppShare'
import { formatCurrency } from '@/lib/utils'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'

export interface ReferralShareCardProps {
  code: string
  shareUrl: string
  freeConsultsRemaining: number
  creditsCents: number
  onContinue?: () => void
  continueLabel?: string
  patientName?: string
}

export function ReferralShareCard({
  code,
  shareUrl,
  freeConsultsRemaining,
  creditsCents,
  onContinue,
  continueLabel = 'Continuar a mi panel',
  patientName,
}: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    QRCode.toDataURL(shareUrl, {
      width: 172,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl)
        }
      })
      .catch((error) => {
        console.error('[ReferralShareCard] QR generation failed:', error)
      })

    return () => {
      cancelled = true
    }
  }, [shareUrl])

  const shareMessage = patientName
    ? `Soy ${patientName} y me registré en Doctor.mx. Usa mi código ${code} para obtener una consulta con IA gratis:`
    : `Únete a Doctor.mx con mi código ${code} para obtener una consulta con IA gratis:`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      void trackClientEvent(ANALYTICS_EVENTS.REFERRAL_CODE_SHARED, {
        method: 'copy-link',
        code,
        shareUrl,
      })
      window.setTimeout(() => setCopied(false), 2500)
    } catch (error) {
      console.error('[ReferralShareCard] Copy failed:', error)
    }
  }

  const handleContinue = () => {
    onContinue?.()
  }

  return (
    <section
      data-testid="referral-share-card"
      className="overflow-hidden rounded-[1.75rem] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,253,244,0.92))] shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
    >
      <div className="relative px-6 pb-6 pt-6 sm:px-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            <Gift className="h-3.5 w-3.5" />
            Código listo
          </div>

          <div className="mt-4 space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Tu red de referidos está activa
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Comparte este código por WhatsApp, copia el enlace o deja que otros lo escaneen.
              {freeConsultsRemaining > 0 ? ` Tienes ${freeConsultsRemaining} consulta${freeConsultsRemaining === 1 ? '' : 's'} gratis disponible${freeConsultsRemaining === 1 ? '' : 's'}.` : ''}
              {creditsCents > 0 ? ` También tienes ${formatCurrency(creditsCents)} en crédito activo.` : ''}
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-[1.35rem] border border-border bg-card/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                  Tu enlace
                </div>
                <div className="mt-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Código
                  </div>
                  <div className="mt-1 font-mono text-2xl font-semibold tracking-[0.25em] text-foreground">
                    {code}
                  </div>
                  <p className="mt-2 break-all text-sm text-muted-foreground">{shareUrl}</p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <WhatsAppShare
                    title="Compartir por WhatsApp"
                    message={`${shareMessage} `}
                    url={shareUrl}
                    onShare={() => {
                      void trackClientEvent(ANALYTICS_EVENTS.REFERRAL_CODE_SHARED, {
                        method: 'whatsapp',
                        code,
                        shareUrl,
                      })
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void copyLink()}
                    className="h-12 rounded-2xl border-emerald-200 bg-card text-emerald-900 hover:bg-emerald-50"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-emerald-600" />
                        Enlace copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar enlace
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-border bg-card/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                  Código QR
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-[172px] w-[172px] items-center justify-center rounded-[1.25rem] border border-border bg-card p-3">
                    {qrDataUrl ? (
                      <Image
                        src={qrDataUrl}
                        alt={`Código QR para compartir el referido ${code}`}
                        width={172}
                        height={172}
                        unoptimized
                        className="h-full w-full rounded-xl object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="rounded-2xl bg-secondary p-3">
                          <QrCode className="h-7 w-7" />
                        </div>
                        <span className="text-xs">Generando QR…</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Comparte en 3 formatos</p>
                    <p>WhatsApp para pacientes.</p>
                    <p>Copiar enlace para redes o email.</p>
                    <p>QR para impresiones, story o escritorio.</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-[1.35rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(255,255,255,0.98))] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                <Gift className="h-3.5 w-3.5" />
                Recompensas
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-card/90 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Tú recibes
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    1 consulta IA gratis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {creditsCents > 0
                      ? `+ ${formatCurrency(creditsCents)} en crédito para tu siguiente consulta pagada.`
                      : 'Tu crédito se acumula cuando alguien completa su alta con tu código.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-card/90 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Tu amigo recibe
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    1 consulta IA gratis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sin código oculto, sin fricción y listo para compartir en familia.
                  </p>
                </div>
              </div>

              {onContinue ? (
                <Button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))] text-white shadow-[0_16px_34px_rgba(14,165,233,0.26)] hover:translate-y-[-1px]"
                >
                  {continueLabel}
                </Button>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
