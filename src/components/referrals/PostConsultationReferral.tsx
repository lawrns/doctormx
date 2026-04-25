'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Copy, CheckCircle, X } from 'lucide-react'

const STORAGE_KEY = 'post-consultation-referral-dismissed'

interface PostConsultationReferralProps {
  referralCode?: string
  shareUrl?: string
}

export function PostConsultationReferral({
  referralCode,
  shareUrl,
}: PostConsultationReferralProps) {
  const [dismissed, setDismissed] = useState(true)
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') return
    setDismissed(false)

    if (referralCode && shareUrl) {
      setCode(referralCode)
      setUrl(shareUrl)
    } else {
      fetch('/api/patient-referrals')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.summary) {
            setCode(data.summary.code)
            setUrl(data.summary.shareUrl)
          }
        })
        .catch(() => {})
    }
  }, [referralCode, shareUrl])

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {}
  }

  const whatsappMessage = encodeURIComponent(
    `¡Descubrí Doctor.mx y me encantó! Es una plataforma de telemedicina con IA. ` +
    `Regístrate con mi código ${code} y obtén una consulta gratis: ${url || ''}`
  )

  if (dismissed) return null

  return (
    <Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                ¿Te gustó tu consulta?
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Comparte Doctor.mx con amigos y familia. Por cada persona que se registre, ganas una consulta gratis.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
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
                variant="outline"
                onClick={copyLink}
                className="border-emerald-200 hover:bg-emerald-50"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    ¡Enlace copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar enlace
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
