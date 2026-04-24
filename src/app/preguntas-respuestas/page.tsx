'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  MessageCircleQuestion,
  Stethoscope,
  Send,
  Eye,
  ThumbsUp,
  ArrowRight,
  Clock,
  Shield,
  Users,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

interface Specialty {
  id: string
  name: string
  slug: string
}

interface ExpertAnswer {
  id: string
  answer: string
  is_featured: boolean
  helpful_count: number
  created_at: string
  doctor?: {
    full_name: string
    photo_url: string | null
  } | null
}

interface ExpertQuestion {
  id: string
  question: string
  display_name: string | null
  status: string
  is_anonymous: boolean
  view_count: number
  created_at: string
  specialty?: {
    id: string
    name: string
    slug: string
  } | null
  answers?: ExpertAnswer[]
}

interface QuestionStats {
  totalAnswered: number
  totalDoctors: number
  totalQuestions: number
}

export default function ExpertQAPage() {
  const [questions, setQuestions] = useState<ExpertQuestion[]>([])
  const [featuredQA, setFeaturedQA] = useState<Array<{ question: ExpertQuestion; answer: ExpertAnswer }>>([])
  const [stats, setStats] = useState<QuestionStats>({ totalAnswered: 0, totalDoctors: 0, totalQuestions: 0 })
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [formQuestion, setFormQuestion] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formName, setFormName] = useState('')
  const [formSpecialty, setFormSpecialty] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [qaRes, featuredRes, statsRes] = await Promise.all([
          fetch('/api/expert-questions?limit=20'),
          fetch('/api/expert-questions?status=answered&limit=5'),
          fetch('/api/expert-questions?stats=true'),
        ])

        if (qaRes.ok) {
          const qaData = await qaRes.json()
          setQuestions(qaData.questions || [])
        }

        if (featuredRes.ok) {
          const featuredData = await featuredRes.json()
          // Use answered questions as featured
          const answeredQuestions = (featuredData.questions || []).filter(
            (q: ExpertQuestion) => q.answers && q.answers.length > 0
          )
          const featured = answeredQuestions.slice(0, 5).map((q: ExpertQuestion) => ({
            question: q,
            answer: q.answers![0],
          }))
          setFeaturedQA(featured)
        }

        if (statsRes.ok) {
          setStats(await statsRes.json())
        }
      } catch (err) {
        console.error('Error loading Q&A data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSubmitting(true)

    try {
      const res = await fetch('/api/expert-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formQuestion,
          email: formEmail,
          display_name: formName || undefined,
          specialty_id: formSpecialty || undefined,
          is_anonymous: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Error al enviar la pregunta')
        return
      }

      setFormSuccess(true)
      setFormQuestion('')
      setFormEmail('')
      setFormName('')
      setFormSpecialty('')
    } catch {
      setFormError('Error de conexion. Intenta de nuevo.')
    } finally {
      setFormSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const truncateAnswer = (text: string, maxLen: number = 200) => {
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen).trim() + '...'
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="text-foreground font-medium">Preguntas y Respuestas</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden public-section">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-100 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <PublicSectionHeading
              eyebrow="Consultas medicas gratuitas"
              title="Pregunta al"
              accent="Experto"
              description="Envia tu pregunta de salud y recibe respuestas de medicos certificados. Completamente gratuito y confidencial."
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.totalAnswered}+</p>
              <p className="text-sm text-muted-foreground mt-1">Preguntas respondidas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.totalDoctors}+</p>
              <p className="text-sm text-muted-foreground mt-1">Especialistas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Gratuito</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircleQuestion,
                title: '1. Escribe tu pregunta',
                description: 'Describe tu sintoma o duda de salud. Puedes hacerlo de forma anonima.',
                color: 'text-primary',
                bg: 'bg-primary/10',
              },
              {
                icon: Stethoscope,
                title: '2. Medicos revisan',
                description: 'Nuestros especialistas certificados revisan y responden tu pregunta.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: CheckCircle2,
                title: '3. Recibe tu respuesta',
                description: 'Obten orientacion medica profesional directamente en tu correo.',
                color: 'text-violet-600',
                bg: 'bg-violet-50',
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Question Form */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Haz tu pregunta</h2>

            {formSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Pregunta enviada</h3>
                <p className="text-muted-foreground mb-6">
                  Nuestro equipo de medicos la revisara. Recibiras la respuesta en tu correo electronico.
                </p>
                <Button variant="outline" onClick={() => setFormSuccess(false)}>
                  Hacer otra pregunta
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuestion} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Especialidad (opcional)
                  </label>
                  <select
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                  >
                    <option value="">Selecciona una especialidad</option>
                    <option value="dermatologia">Dermatologia</option>
                    <option value="cardiologia">Cardiologia</option>
                    <option value="psiquiatria">Psiquiatria</option>
                    <option value="nutricion">Nutricion</option>
                    <option value="pediatria">Pediatria</option>
                    <option value="medicina-general">Medicina General</option>
                    <option value="ginecologia">Ginecologia</option>
                    <option value="neurologia">Neurologia</option>
                    <option value="traumatologia">Traumatologia</option>
                    <option value="oftalmologia">Oftalmologia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Tu pregunta *
                  </label>
                  <textarea
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    placeholder="Describe tu sintoma, duda o situacion de salud con el mayor detalle posible..."
                    rows={5}
                    required
                    minLength={20}
                    maxLength={2000}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formQuestion.length}/2000 caracteres</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Nombre (opcional)
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Tu nombre o alias"
                      maxLength={50}
                      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Correo electronico *
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>Tu pregunta sera publicada de forma anonima. Tu correo solo se usa para notificarte la respuesta.</span>
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{formError}</p>
                )}

                <Button
                  type="submit"
                  disabled={formSubmitting || formQuestion.length < 20}
                  className="w-full bg-primary hover:bg-primary text-primary-foreground"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar pregunta
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* Questions Tabs */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="w-full sm:w-auto mb-8">
              <TabsTrigger value="featured" className="flex-1 sm:flex-none">
                Preguntas destacadas
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex-1 sm:flex-none">
                Preguntas recientes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="featured">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  Cargando preguntas...
                </div>
              ) : featuredQA.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircleQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aun no hay preguntas destacadas.</p>
                  <p className="text-sm mt-1">Se el primero en preguntar.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {featuredQA.map(({ question, answer }, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
                        {/* Question */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <MessageCircleQuestion className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {question.specialty && (
                                <Badge variant="secondary" className="text-xs">
                                  {question.specialty.name}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="w-3 h-3" />{question.view_count} vistas
                              </span>
                            </div>
                            <p className="text-foreground leading-relaxed">{question.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.display_name || 'Anonimo'} - {formatDate(question.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Answer */}
                        {answer && (
                          <div className="ml-13 pl-10 border-l-2 border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Stethoscope className="w-3 h-3 text-emerald-600" />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {answer.doctor?.full_name || 'Doctor especialista'}
                              </span>
                              {answer.is_featured && (
                                <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                  Destacada
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                              {truncateAnswer(answer.answer, 300)}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />{answer.helpful_count} personas encontraron util esta respuesta
                              </span>
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <div className="mt-4 pt-4 border-t border-border flex justify-end">
                          <Link href={`/preguntas-respuestas/${question.id}`}>
                            <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-primary/10">
                              Leer respuesta completa <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  Cargando preguntas...
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircleQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay preguntas recientes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <Card className="p-5 bg-card border-border hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              {q.specialty && (
                                <Badge variant="secondary" className="text-xs">{q.specialty.name}</Badge>
                              )}
                              {q.status === 'answered' && (
                                <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                  Respondida
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="w-3 h-3" />{q.view_count}
                              </span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed line-clamp-2">{q.question}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>{q.display_name || 'Anonimo'}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />{formatDate(q.created_at)}
                              </span>
                            </div>
                          </div>
                          {q.answers && q.answers.length > 0 && (
                            <div className="shrink-0">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              </div>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/preguntas-respuestas/${q.id}`}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                        >
                          Ver detalle <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="public-section relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <PublicSectionHeading
              eyebrow="Consulta personalizada"
              title="Necesitas atencion"
              accent="medica inmediata?"
              description="Agenda una consulta en linea con un doctor certificado. Atencion rapida, segura y profesional."
              theme="dark"
            />
            <Link href="/doctors">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(59,130,246,0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary transition-all flex items-center gap-3 mx-auto shadow-xl shadow-primary/20 mt-8"
              >
                <Users className="w-5 h-5" />
                Buscar un especialista
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
