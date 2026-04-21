'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  CheckCircle,
  X,
  Star,
  TrendingUp,
} from 'lucide-react'

const patientPlans = [
  {
    name: 'Single Consultation',
    price: 500,
    unit: 'per consultation',
    description: 'Perfect for one-time medical advice',
    features: [
      '20-minute video consultation',
      'Verified doctor',
      'Prescription if needed',
      'Consultation summary',
      '7-day follow-up messaging'
    ],
    notIncluded: [
      'Ongoing care',
      'Priority scheduling',
      'Medical records storage'
    ],
    popular: false,
    cta: 'Book Now',
    ctaLink: '/doctors'
  },
  {
    name: 'Care Plus',
    price: 299,
    unit: 'per month',
    description: 'Best value for regular healthcare needs',
    features: [
      '4 consultations per month',
      'Priority scheduling',
      'Unlimited messaging',
      'Medical records storage',
      'Prescription management',
      'Family sharing (up to 4)',
      'Preventive care reminders'
    ],
    notIncluded: [
      'Specialist consultations',
      'Lab test discounts'
    ],
    popular: true,
    cta: 'Start Free Trial',
    ctaLink: '/auth/register'
  },
  {
    name: 'Premium Care',
    price: 599,
    unit: 'per month',
    description: 'Complete healthcare solution for families',
    features: [
      'Unlimited consultations',
      'Specialist access',
      '24/7 emergency support',
      'Lab test discounts (20%)',
      'Second opinion service',
      'In-person visit discounts',
      'Health coaching',
      'Advanced analytics'
    ],
    notIncluded: [],
    popular: false,
    cta: 'Get Started',
    ctaLink: '/auth/register'
  }
]

const doctorPlans = [
  {
    name: 'Basic',
    price: 0,
    unit: 'startup',
    description: 'Start your telemedicine practice',
    features: [
      'Profile on Doctor.mx',
      'Basic scheduling tools',
      'Video consultations',
      'Prescription writing',
      'Patient reviews',
      'Mobile app access'
    ],
    notIncluded: [
      'Advanced analytics',
      'Marketing support',
      'Priority placement',
      'Custom branding'
    ],
    commission: '20% per consultation',
    cta: 'Join Free',
    ctaLink: '/auth/register'
  },
  {
    name: 'Professional',
    price: 999,
    unit: 'per month',
    description: 'Grow your practice with advanced tools',
    features: [
      'Everything in Basic',
      'Advanced analytics dashboard',
      'Patient management CRM',
      'Automated reminders',
      'Marketing support',
      'Priority placement in search',
      'Custom profile branding',
      'Batch prescription tool'
    ],
    notIncluded: [
      'Dedicated account manager',
      'API access',
      'White-label options'
    ],
    commission: '10% per consultation',
    popular: true,
    cta: 'Start Professional',
    ctaLink: '/auth/register'
  },
  {
    name: 'Enterprise',
    price: 2999,
    unit: 'per month',
    description: 'For clinics and large practices',
    features: [
      'Everything in Professional',
      'Multiple doctor accounts',
      'Dedicated account manager',
      'API access & integrations',
      'White-label options',
      'Custom workflows',
      'Staff training',
      'Priority support'
    ],
    notIncluded: [],
    commission: '5% per consultation',
    cta: 'Contact Sales',
    ctaLink: '/for-doctors'
  }
]

const faqs = [
  {
    q: 'Can I change my plan anytime?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, debit cards, SPEI transfers, and OXXO payments for your convenience.'
  },
  {
    q: 'Is there a cancellation fee?',
    a: 'No, you can cancel your subscription at any time without penalties. You\'ll continue to have access until the end of your billing period.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact our support team.'
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No transparency is our policy. The price you see is the price you pay. No setup fees, cancellation fees, or hidden charges.'
  }
]

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient')

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground mb-6">
              Precios claros y transparentes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Elige la opción que mejor se adapta a tus necesidades. Sin cargos sorpresa y con una experiencia pensada para pacientes y doctores en México.
            </p>
            
            {/* Tab Switcher */}
            <div className="inline-flex rounded-lg bg-muted p-1 mb-8">
              <Button
                onClick={() => setActiveTab('patient')}
                variant={activeTab === 'patient' ? 'default' : 'ghost'}
                className="px-6 py-2 rounded-md text-sm font-medium"
              >
                Pacientes
              </Button>
              <Button
                onClick={() => setActiveTab('doctor')}
                variant={activeTab === 'doctor' ? 'default' : 'ghost'}
                className="px-6 py-2 rounded-md text-sm font-medium"
              >
                Doctores
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Patient Pricing */}
      {activeTab === 'patient' && (
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {patientPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`relative h-full bg-card rounded-2xl border border-border shadow-dx-1 ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Más popular
                        </Badge>
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground mb-6">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground ml-2">{plan.unit}</span>
                      </div>
                      <Link href={plan.ctaLink}>
                        <Button 
                          className={`w-full mb-8 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="w-4 h-4 text-vital mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                        {plan.notIncluded.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm opacity-50">
                            <X className="w-4 h-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctor Pricing */}
      {activeTab === 'doctor' && (
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {doctorPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`relative h-full bg-card rounded-2xl border border-border shadow-dx-1 ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Mejor valor
                        </Badge>
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground mb-6">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground ml-2">{plan.unit}</span>
                      </div>
                      {plan.commission && (
                        <div className="text-sm text-muted-foreground mb-6">
                          <span className="font-medium">{plan.commission}</span>
                        </div>
                      )}
                      <Link href={plan.ctaLink}>
                        <Button 
                          className={`w-full mb-8 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="w-4 h-4 text-vital mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                        {plan.notIncluded.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm opacity-50">
                            <X className="w-4 h-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Comparison */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4">Compara beneficios</h2>
            <p className="text-lg text-muted-foreground">
              Revisa qué incluye cada opción antes de decidir.
            </p>
          </motion.div>
          
          <Card className="overflow-hidden bg-card rounded-2xl border border-border shadow-dx-1">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Beneficio
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Single
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Care Plus
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      Videoconsultas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="w-5 h-5 text-vital mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="w-5 h-5 text-vital mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="w-5 h-5 text-vital mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      Consultas al mes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-muted-foreground">
                      1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-muted-foreground">
                      4
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-muted-foreground">
                      Ilimitadas
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      Mensajería
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-muted-foreground">
                      7 días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="w-5 h-5 text-vital mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="w-5 h-5 text-vital mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      Acceso a especialistas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="w-5 h-5 text-vital mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4">Preguntas frecuentes</h2>
          </motion.div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-card rounded-2xl border border-border shadow-dx-1">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Súmate a una experiencia más simple para reservar, atender y dar seguimiento en línea.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/doctors">
                <Button size="lg" variant="secondary">
                  Encontrar un doctor
                </Button>
              </Link>
              <Link href="/for-doctors">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Unirme como doctor
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
