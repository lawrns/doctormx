'use client';

import * as React from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Leaf,
  Package,
  Pill,
  ShoppingBag,
  Stethoscope,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TreatmentPlan } from '@/lib/soap/types';

interface TreatmentPlanDisplayProps {
  plan: TreatmentPlan;
  className?: string;
}

const urgencyMeta = {
  emergency: {
    label: 'Atención inmediata',
    tone: 'border-destructive/20 bg-destructive/5 text-destructive',
  },
  urgent: {
    label: 'Cita en 24-48 horas',
    tone: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  },
  moderate: {
    label: 'Cita en 1-2 semanas',
    tone: 'border-border bg-muted/60 text-foreground',
  },
  routine: {
    label: 'Cita programada',
    tone: 'border-border bg-muted/40 text-foreground',
  },
  'self-care': {
    label: 'Monitoreo en casa',
    tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  },
} as const;

function findAvailableProducts(medicationName: string) {
  const mockProducts = {
    Tempra: [
      {
        id: 'tempra-500mg',
        name: 'Tempra 500mg',
        price: 45.5,
        pharmacy: 'Farmacias Guadalajara',
        delivery: '2-4 horas',
      },
      {
        id: 'tempra-650mg',
        name: 'Tempra 650mg',
        price: 52.3,
        pharmacy: 'Farmacias del Ahorro',
        delivery: '1-2 horas',
      },
    ],
    Advil: [
      {
        id: 'advil-200mg',
        name: 'Advil 200mg (12 tabletas)',
        price: 38.9,
        pharmacy: 'Farmacias Similares',
        delivery: '1 hora',
      },
    ],
    Tabcin: [
      {
        id: 'tabcin-original',
        name: 'Tabcin Original',
        price: 28.75,
        pharmacy: 'Farmacias Benavides',
        delivery: '2 horas',
      },
      {
        id: 'tabcin-plus',
        name: 'Tabcin Plus',
        price: 35.2,
        pharmacy: 'Farmacias San Pablo',
        delivery: '2-4 horas',
      },
    ],
    'Pepto-Bismol': [
      {
        id: 'pepto-liquido',
        name: 'Pepto-Bismol Líquido 118ml',
        price: 42.5,
        pharmacy: 'Farmacias Yza',
        delivery: '1-2 horas',
      },
    ],
  };

  return mockProducts[medicationName as keyof typeof mockProducts] || [];
}

export function TreatmentPlanDisplay({
  plan,
  className,
}: TreatmentPlanDisplayProps) {
  const [selectedPharmacy, setSelectedPharmacy] = React.useState<Record<string, string>>({});
  const [showOrderConfirmation, setShowOrderConfirmation] = React.useState<string | null>(null);

  const handleOrderMedication = (medicationName: string, productId: string) => {
    setSelectedPharmacy((prev) => ({ ...prev, [medicationName]: productId }));
    setShowOrderConfirmation(productId);
    window.setTimeout(() => setShowOrderConfirmation(null), 2600);
  };

  return (
    <Card className={cn('overflow-hidden rounded-xl border-border/70 shadow-sm', className)}>
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">
                Plan de tratamiento
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              La propuesta se presenta en bloques compactos para que el siguiente paso se entienda rápido sin saturar la pantalla.
            </p>
          </div>

          {plan.referralUrgency ? (
            <Badge
              variant="outline"
              className={cn(
                'rounded-lg border px-2.5 py-1 text-[11px] font-medium',
                urgencyMeta[plan.referralUrgency].tone
              )}
            >
              <Clock className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {urgencyMeta[plan.referralUrgency].label}
            </Badge>
          ) : null}
        </div>

        <div className="divide-y divide-border/60 rounded-xl border border-border/70">
          {plan.selfCareInstructions?.length ? (
            <PlanSection
              icon={Leaf}
              title="Autocuidado"
              items={plan.selfCareInstructions}
            />
          ) : null}

          {plan.recommendations?.length ? (
            <PlanSection
              icon={CheckCircle2}
              title="Recomendaciones médicas"
              items={plan.recommendations}
            />
          ) : null}

          {plan.suggestedMedications?.length ? (
            <div className="px-4 py-5 md:px-5">
              <SectionHeader
                icon={Pill}
                title="Medicamentos sugeridos"
                description="Opciones de venta libre con advertencias visibles y una acción secundaria, no un escaparate."
              />

              <div className="mt-4 space-y-3">
                {plan.suggestedMedications.map((medication) => {
                  const availableProducts = findAvailableProducts(medication.name);

                  return (
                    <article
                      key={medication.name}
                      className="rounded-xl border border-border/70 bg-muted/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            {medication.name}
                          </h4>
                          {medication.genericName ? (
                            <p className="text-xs text-muted-foreground">
                              Genérico: {medication.genericName}
                            </p>
                          ) : null}
                        </div>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <InfoLine label="Dosis" value={medication.dosage} />
                        <InfoLine label="Frecuencia" value={medication.frequency} />
                        <InfoLine label="Duración" value={medication.duration} />
                        <InfoLine
                          label="Vía"
                          value={
                            medication.route === 'oral'
                              ? 'Oral'
                              : medication.route === 'topical'
                                ? 'Tópica'
                                : medication.route === 'injection'
                                  ? 'Inyección'
                                  : 'Otra'
                          }
                        />
                      </div>

                      {medication.warnings.length ? (
                        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                          <p className="font-medium">Advertencias</p>
                          <ul className="mt-1 space-y-1">
                            {medication.warnings.map((warning, index) => (
                              <li key={`${warning}-${index}`}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="mt-4 border-t border-border/60 pt-4">
                        {availableProducts.length ? (
                          <>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              Disponible para ordenar
                            </div>

                            <div className="mt-3 space-y-2">
                              {availableProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className={cn(
                                    'flex flex-col gap-3 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between',
                                    selectedPharmacy[medication.name] === product.id
                                      ? 'border-primary/20 bg-primary/5'
                                      : 'border-border/70 bg-background'
                                  )}
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {product.pharmacy} · Entrega {product.delivery}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <p className="text-sm font-semibold text-foreground">
                                      ${product.price.toFixed(2)}
                                    </p>
                                    <button
                                      onClick={() => handleOrderMedication(medication.name, product.id)}
                                      className={cn(
                                        'inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                        selectedPharmacy[medication.name] === product.id
                                          ? 'border-primary/20 bg-primary text-primary-foreground'
                                          : 'border-border/70 bg-background text-foreground hover:bg-muted/60'
                                      )}
                                    >
                                      {selectedPharmacy[medication.name] === product.id ? 'Ordenado' : 'Ordenar'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {showOrderConfirmation && availableProducts.some((product) => product.id === showOrderConfirmation) ? (
                              <p className="mt-3 text-xs text-emerald-700">
                                Producto ordenado. La confirmación de entrega llegará con las instrucciones.
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Este medicamento puede estar disponible en farmacias locales. Confirma con el farmacéutico antes de tomarlo.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {plan.referralNeeded && plan.referralSpecialty ? (
            <PlanSection
              icon={Stethoscope}
              title="Referencia"
              items={[
                `${getSpecialtyLabel(plan.referralSpecialty)} · ${plan.followUpTiming}`,
              ]}
              note="La derivación se presenta como un siguiente paso claro, no como un bloque visual separado."
            />
          ) : null}

          {plan.returnPrecautions?.length ? (
            <div className="px-4 py-5 md:px-5">
              <SectionHeader
                icon={AlertTriangle}
                title="Señales de alarma"
                description="Busca atención inmediata si aparece cualquiera de estas señales."
              />
              <ul className="mt-4 space-y-2">
                {plan.returnPrecautions.map((precaution, index) => (
                  <li
                    key={`${precaution}-${index}`}
                    className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-foreground"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                    <span>{precaution}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {plan.patientEducation?.length ? (
            <PlanSection
              icon={BookOpen}
              title="Información educativa"
              items={plan.patientEducation}
              note="Lectura auxiliar para el paciente, con el mismo peso visual que el resto del plan."
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function PlanSection({
  icon: Icon,
  title,
  items,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  note?: string;
}) {
  return (
    <div className="px-4 py-5 md:px-5">
      <SectionHeader
        icon={Icon}
        title={title}
        description={note}
      />

      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm text-foreground"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="leading-relaxed text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

function getSpecialtyLabel(specialty: string): string {
  const labels: Record<string, string> = {
    'general-practitioner': 'Médico General',
    dermatologist: 'Dermatólogo/a',
    internist: 'Internista',
    psychiatrist: 'Psiquiatra',
    cardiologist: 'Cardiólogo/a',
    neurologist: 'Neurólogo/a',
    orthopedist: 'Ortopedista',
    oncologist: 'Oncólogo/a',
    pediatrician: 'Pediatra',
    gynecologist: 'Ginecólogo/a',
  };

  return labels[specialty] || specialty;
}
