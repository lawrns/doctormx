'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { saveConnectDraft } from '@/lib/connect/session-draft'
import type { ConnectPracticeSearchResult, ConnectProfileDraft } from '@/lib/connect/types'

type PracticeSearchPanelProps = {
  className?: string
}

type SearchPayload = {
  results?: ConnectPracticeSearchResult[]
  provider?: 'directory_google' | 'directory_mock'
  error?: string
}

type EnrichPayload = {
  draft?: ConnectProfileDraft
  error?: string
}

function sourceLabel(result: ConnectPracticeSearchResult): string {
  if (result.source === 'directory') return 'Perfil Doctor.mx'
  if (result.source === 'google_places') return 'Google Places'
  return 'Resultado demo'
}

function claimLabel(result: ConnectPracticeSearchResult): string {
  if (result.claimStatus === 'unclaimed') return 'Listo para reclamar'
  if (result.claimStatus === 'claim_pending') return 'Reclamo en revisión'
  if (result.claimStatus === 'claimed') return 'Ya reclamado'
  return 'Perfil nuevo'
}

function getField(draft: ConnectProfileDraft | null, key: string): string | null {
  return draft?.fields.find((field) => field.key === key)?.value || null
}

function buildMetaLine(result: ConnectPracticeSearchResult): string {
  const location = result.address || [result.city, result.state].filter(Boolean).join(', ') || 'Dirección pendiente'
  const rating =
    typeof result.rating === 'number'
      ? `${result.rating.toFixed(1)} (${result.reviewCount || 0} reseñas)`
      : null

  return [location, rating, result.phone].filter(Boolean).join(' · ')
}

export function PracticeSearchPanel({ className }: PracticeSearchPanelProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ConnectPracticeSearchResult[]>([])
  const [selected, setSelected] = useState<ConnectPracticeSearchResult | null>(null)
  const [draft, setDraft] = useState<ConnectProfileDraft | null>(null)
  const [provider, setProvider] = useState<'directory_google' | 'directory_mock' | null>(null)
  const [loading, setLoading] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setError('Escribe el nombre de tu práctica, clínica o consultorio.')
      return
    }

    setLoading(true)
    setError('')
    setSelected(null)
    setDraft(null)

    try {
      const response = await fetch(`/api/connect/practices?q=${encodeURIComponent(trimmed)}`)
      const payload = (await response.json()) as SearchPayload

      if (!response.ok) {
        throw new Error(payload.error || 'No pudimos buscar prácticas.')
      }

      setResults(payload.results || [])
      setProvider(payload.provider || null)
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'No pudimos buscar prácticas.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function selectPractice(result: ConnectPracticeSearchResult) {
    setSelected(result)
    setDraft(null)
    setError('')
    setEnriching(true)

    try {
      const response = await fetch('/api/connect/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practice: result }),
      })
      const payload = (await response.json()) as EnrichPayload

      if (!response.ok || !payload.draft) {
        throw new Error(payload.error || 'No pudimos preparar el borrador.')
      }

      setDraft(payload.draft)
    } catch (enrichError) {
      setError(enrichError instanceof Error ? enrichError.message : 'No pudimos preparar el borrador.')
    } finally {
      setEnriching(false)
    }
  }

  function continueSelectedFlow() {
    if (!selected || !draft) return

    if (selected.source === 'directory' && selected.claimStatus === 'unclaimed') {
      const profileId = selected.directoryProfileId || selected.id.replace(/^directory:/, '')
      startTransition(() => router.push(`/claim/${profileId}`))
      return
    }

    saveConnectDraft(draft)
    startTransition(() => router.push('/auth/register?role=doctor&connect=1'))
  }

  const safeDraftReady = Boolean(draft && selected)
  const specialty = getField(draft, 'specialty')
  const services = getField(draft, 'services')
  const bio = getField(draft, 'bio')
  const canContinue =
    safeDraftReady &&
    !isPending &&
    selected?.claimStatus !== 'claimed' &&
    selected?.claimStatus !== 'claim_pending'

  return (
    <Card
      variant="preview"
      density="compact"
      className={cn(
        'overflow-hidden rounded-xl border-primary/20 bg-card shadow-card',
        className
      )}
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            Reclamar perfil
          </p>
          <h2 className="mt-1 text-[18px] font-semibold leading-6 tracking-[-0.01em] text-foreground">
            Busca tu práctica médica
          </h2>
        </div>
        <Badge variant="info" className="rounded-md bg-surface-tint text-[10px] text-primary">
          IA asistiva
        </Badge>
      </div>

      <form onSubmit={handleSearch} className="mt-4 grid min-w-0 gap-2 sm:grid-cols-[1fr_auto]">
        <label className="min-w-0">
          <span className="sr-only">Nombre de práctica o consultorio</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. Dra. Ana López, Polanco"
              className="h-10 rounded-lg border-border bg-muted/30 pl-9 text-foreground placeholder:text-muted-foreground"
            />
          </span>
        </label>
        <Button type="submit" disabled={loading} size="sm" className="h-10 rounded-lg">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar
        </Button>
      </form>

      {provider === 'directory_mock' && results.length > 0 && (
        <p className="mt-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-[12px] leading-5 text-muted-foreground">
          Sin Google Places configurado en este entorno: mostramos resultados determinísticos de demostración sin presentarlos como datos en vivo.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] leading-5 text-destructive">
          {error}
        </p>
      )}

      {loading && (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {[0, 1, 2].map((item) => (
            <div key={item} className="grid gap-2 p-3">
              <div className="h-4 w-3/5 animate-pulse rounded bg-primary/10" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-primary/5" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-primary/5" />
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-4 max-h-[310px] divide-y divide-border overflow-auto rounded-xl border border-border bg-card">
          {results.map((result) => {
            const active = selected?.id === result.id

            return (
              <button
                key={result.id}
                type="button"
                onClick={() => void selectPractice(result)}
                className={cn(
                  'grid w-full min-w-0 gap-2 p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center',
                  active && 'bg-primary/5 shadow-[inset_3px_0_0_hsl(var(--primary))]'
                )}
                aria-label={`Preparar perfil para ${result.name}`}
              >
                <div className="flex min-w-0 gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-tint text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <p className="min-w-0 truncate text-[15px] font-semibold leading-5 tracking-[-0.02em] text-foreground">
                        {result.name}
                      </p>
                      {result.source === 'directory' && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </div>
                    <p className="mt-1 flex min-w-0 items-start gap-1.5 text-[13px] leading-5 text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                      <span className="min-w-0 break-words">{buildMetaLine(result)}</span>
                    </p>
                    <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
                      <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[9px] normal-case tracking-[0.04em]">
                        {sourceLabel(result)}
                      </Badge>
                      <Badge
                        variant={result.claimStatus === 'claimed' ? 'secondary' : 'info'}
                        className="rounded-md px-2 py-0.5 text-[9px] normal-case tracking-[0.04em]"
                      >
                        {claimLabel(result)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-primary sm:justify-end">
                  Preparar
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {!loading && query && results.length === 0 && !error && (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-4">
          <p className="text-[15px] font-semibold leading-5 text-foreground">No encontramos una práctica con ese nombre.</p>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            Puedes ajustar la búsqueda o crear un perfil desde cero con campos guiados.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-9 rounded-lg"
            onClick={() => router.push('/auth/register?role=doctor&connect=1')}
          >
            Crear perfil desde cero
          </Button>
        </div>
      )}

      {(selected || enriching) && (
        <div className="sticky bottom-0 mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 shadow-card">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
                Borrador con IA
              </p>
              <h3 className="mt-1 truncate text-[15px] font-semibold leading-5 tracking-[-0.02em] text-foreground">
                {selected?.name || 'Preparando perfil'}
              </h3>
            </div>
            {enriching ? (
              <Badge variant="info" className="rounded-md px-2 py-0.5 text-[9px] normal-case tracking-[0.04em]">
                <Loader2 className="h-3 w-3 animate-spin" /> Analizando
              </Badge>
            ) : (
              <Badge variant="info" className="rounded-md px-2 py-0.5 text-[9px] normal-case tracking-[0.04em]">
                <Sparkles className="h-3 w-3" /> Sugerido
              </Badge>
            )}
          </div>

          {enriching ? (
            <div className="mt-3 grid gap-2">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-primary/10" />
              <div className="h-3.5 w-full animate-pulse rounded bg-primary/10" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-primary/10" />
            </div>
          ) : draft ? (
            <>
              <div className="mt-3 grid gap-2 text-[12px] leading-5 text-muted-foreground sm:grid-cols-3">
                <p>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground/70">Especialidad</span>
                  <span className="font-semibold text-foreground">{specialty || 'Por confirmar'}</span>
                </p>
                <p>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground/70">Ubicación</span>
                  <span className="font-semibold text-foreground">{selected?.city || selected?.state || 'Por completar'}</span>
                </p>
                <p>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground/70">Faltantes</span>
                  <span className="font-semibold text-foreground">{draft.missingFields.length} campos</span>
                </p>
              </div>

              {(services || bio) && (
                <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
                  <span className="font-semibold text-foreground">Texto preparado: </span>
                  {bio || services}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!canContinue}
                  onClick={continueSelectedFlow}
                  className="h-9 rounded-lg"
                >
                  {selected?.source === 'directory' && selected.claimStatus === 'unclaimed'
                    ? 'Reclamar este perfil'
                    : 'Continuar con perfil IA'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <div className="flex min-w-0 items-center gap-1.5 text-[12px] leading-5 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>Cédula y credenciales no se verifican por IA.</span>
                </div>
              </div>

              {(selected?.claimStatus === 'claimed' || selected?.claimStatus === 'claim_pending') && (
                <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-5 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Este perfil ya tiene un reclamo registrado. Puedes crear un perfil nuevo si representas otra sede o práctica.
                </p>
              )}
            </>
          ) : null}
        </div>
      )}
    </Card>
  )
}
