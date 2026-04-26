'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupportPresenceOrb } from '@/components/support/SupportPresenceOrb';
import { cn } from '@/lib/utils';

interface ConversationalWelcomeProps {
  onStart: () => void;
  userName?: string;
  className?: string;
}

const welcomeMessages = [
  {
    icon: HeartPulse,
    title: 'Una pregunta a la vez',
    description: 'Primero ordenamos el motivo principal, duración e intensidad.',
  },
  {
    icon: ShieldCheck,
    title: 'Alertas primero',
    description: 'Si aparece una señal de alarma, la ruta cambia a atención urgente.',
  },
  {
    icon: Clock,
    title: 'Resumen útil',
    description: 'Al final tendrás contexto claro para compartir con un doctor.',
  },
];

export function ConversationalWelcome({
  onStart,
  userName,
  className,
}: ConversationalWelcomeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className={cn('mx-auto w-full max-w-3xl', className)}
    >
      <div className="border-b border-border pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
          className="flex flex-col gap-6 sm:flex-row sm:items-center"
        >
          <SupportPresenceOrb size="lg" imageClassName="object-cover object-top" />
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--trust))]">
              Preconsulta clínica
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {userName ? `Hola, ${userName}. Soy Dr. Simeon.` : 'Hola. Soy Dr. Simeon.'}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Te ayudaré a ordenar lo que sientes y detectar señales de alarma. No diagnostico; preparo el caso para que un doctor pueda revisarlo mejor.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-0 divide-y divide-border border-b border-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {welcomeMessages.map((message, index) => (
          <motion.div
            key={message.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.4 + index * 0.1,
              duration: 0.4,
            }}
            className="px-0 py-5 md:px-5"
          >
            <div className="flex items-start gap-3">
              <message.icon className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--trust))]" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{message.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{message.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.7 }}
        className="mt-6 rounded-xl border border-border bg-card px-4 py-4"
      >
        <div className="flex items-start gap-3">
          <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--trust))]" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">Primera pregunta</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Cuéntame qué te molesta y desde cuándo. Después iré paso a paso.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.8 }}
        className="mt-4 rounded-lg border border-[hsl(var(--danger))]/20 bg-[hsl(var(--danger))]/5 px-4 py-3"
      >
        <p className="text-sm leading-6 text-foreground">
          Si tienes dolor de pecho, falta de aire intensa, pérdida de fuerza, confusión o sangrado importante, llama al 911.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.9 }}
        className="pt-6"
      >
        <Button
          onClick={onStart}
          size="lg"
          className="w-full rounded-lg bg-ink text-primary-foreground shadow-none transition-colors hover:bg-ink/90 active:scale-[0.98]"
        >
          Comenzar preconsulta
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
