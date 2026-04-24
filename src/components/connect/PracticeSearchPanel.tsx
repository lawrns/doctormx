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

  return (
    <Card variant="preview" density="comfortable" className={cn('shadow-[var(--card-shadow)]', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
            Reclamar perfil
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#071a4e]">
            Busca tu práctica médica
          </h2>
        </div>
        <Badge variant="info" className="bg-[#e8f3ff] text-[#0d72d6]">
          IA asistiva
        </Badge>
      </div>

      <form onSubmit={handleSearch} className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0d72d6]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej. Dra. Ana López Polanco"
            className="h-12 rounded-[8px] border-[#cfdcf1] bg-[#f8fbff] pl-9 text-[#071a4e] placeholder:text-[#7d89a7]"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-12 rounded-[8px]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar
        </Button>
      </form>

      {provider === 'directory_mock' && results.length > 0 && (
        <p className="mt-3 rounded-[6px] border border-[#d8e3f6] bg-[#f8fbff] px-3 py-2 text-xs leading-5 text-[#5c6783]">
          Sin Google Places configurado en este entorno: mostramos resultados determinísticos de demostración sin presentarlos como datos en vivo.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-[6px] border border-[#ffd2c6] bg-[#fff7f4] px-3 py-2 text-sm text-[#b93720]">
          {error}
        </p>
      )}

      {loading && (
        <div className="mt-5 space-y-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-[76px] animate-pulse rounded-[8px] border border-[#e2eaf8] bg-[#f4f8ff]" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-5 divide-y divide-[#e6edf8] overflow-hidden rounded-[8px] border border-[#d8e3f6]">
          {results.map((result) => {
            const active = selected?.id === result.id

            return (
              <button
                key={result.id}
                type="button"
                onClick={() => void selectPractice(result)}
                className={cn(
                  'grid w-full gap-3 bg-white p-3 text-left transition-colors hover:bg-[#f8fbff] sm:grid-cols-[1fr_auto] sm:items-center',
                  active && 'bg-[#f2f7ff]'
                )}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#e8f3ff] text-[#0d72d6]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold tracking-[-0.02em] text-[#071a4e]">{result.name}</p>
                      {result.source === 'directory' && <BadgeCheck className="h-4 w-4 text-[#0d72d6]" />}
                    </div>
                    <p className="mt-1 text-sm text-[#5c6783]">
                      {result.address || [result.city, result.state].filter(Boolean).join(', ') || 'Dirección pendiente'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{sourceLabel(result)}</Badge>
                      <Badge variant={result.claimStatus === 'claimed' ? 'secondary' : 'info'}>
                        {claimLabel(result)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0d72d6] sm:justify-end">
                  Preparar perfil
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {!loading && query && results.length === 0 && !error && (
        <div className="mt-5 rounded-[8px] border border-dashed border-[#cfdcf1] bg-[#f8fbff] p-5">
          <p className="font-semibold text-[#071a4e]">No encontramos una práctica con ese nombre.</p>
          <p className="mt-1 text-sm leading-6 text-[#5c6783]">
            Puedes ajustar la búsqueda o crear un perfil desde cero con campos guiados.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/auth/register?role=doctor&connect=1')}
          >
            Crear perfil desde cero
          </Button>
        </div>
      )}

      {(selected || enriching) && (
        <Card variant="preview" density="compact" tone="tint" className="mt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
                Borrador con IA
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#071a4e]">
                {selected?.name || 'Preparando perfil'}
              </h3>
            </div>
            {enriching ? (
              <Badge variant="info"><Loader2 className="h-3 w-3 animate-spin" /> Analizando</Badge>
            ) : (
              <Badge variant="info"><Sparkles className="h-3 w-3" /> Sugerido</Badge>
            )}
          </div>

          {enriching ? (
            <div className="mt-4 grid gap-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#dce9ff]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#dce9ff]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#dce9ff]" />
            </div>
          ) : draft ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['Especialidad', specialty || 'Por confirmar'],
                  ['Dirección', selected?.address || 'Por completar'],
                  ['Faltantes', `${draft.missingFields.length} campos`],
                ].map(([label, value]) => (
                  <Card key={label} variant="stat" density="compact">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5c6783]">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#071a4e]">{value}</p>
                  </Card>
                ))}
              </div>
              {(services || bio) && (
                <Card variant="default" density="compact" className="mt-3 text-sm leading-6 text-[#5c6783]">
                  <p className="font-semibold text-[#071a4e]">Texto preparado</p>
                  <p className="mt-1">{bio || services}</p>
                </Card>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  disabled={!safeDraftReady || isPending || selected?.claimStatus === 'claimed' || selected?.claimStatus === 'claim_pending'}
                  onClick={continueSelectedFlow}
                >
                  {selected?.source === 'directory' && selected.claimStatus === 'unclaimed'
                    ? 'Reclamar este perfil'
                    : 'Continuar con perfil IA'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 text-xs leading-5 text-[#5c6783]">
                  <ShieldCheck className="h-4 w-4 text-[#0d72d6]" />
                  Cédula y credenciales no se verifican por IA.
                </div>
              </div>
              {(selected?.claimStatus === 'claimed' || selected?.claimStatus === 'claim_pending') && (
                <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-[#5c6783]">
                  <CheckCircle2 className="h-4 w-4 text-[#0d72d6]" />
                  Este perfil ya tiene un reclamo registrado. Puedes crear un perfil nuevo si representas otra sede o práctica.
                </p>
              )}
            </>
          ) : null}
        </Card>
      )}
    </Card>
  )
}
