'use client'

import { Gift, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type ConnectReferralBannerProps = {
  referralCode: string
}

export function ConnectReferralBanner({ referralCode }: ConnectReferralBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (referralCode) {
      setVisible(true)
    }
  }, [referralCode])

  if (!visible || !referralCode) return null

  return (
    <section className="bg-[#f4f7fb] pb-0 pt-6">
      <div className="editorial-shell">
        <div className="flex items-start gap-3 rounded-[10px] border border-primary/20 bg-primary/5 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
            <Gift className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Código de referido aplicado: {referralCode}
            </p>
            <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
              Tu código de referido te da 50% de descuento en tu primer mes al completar tu registro y verificación.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="shrink-0 rounded-[6px] p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            aria-label="Cerrar banner de referido"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
