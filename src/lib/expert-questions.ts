import { createServiceClient } from '@/lib/supabase/server'

const PUBLIC_QUESTION_STATUSES = ['approved', 'answered', 'closed']

export interface ExpertQuestion {
  id: string
  patient_id?: string | null
  specialty_id: string | null
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

export interface ExpertAnswer {
  id: string
  question_id: string
  doctor_id: string
  answer: string
  is_featured: boolean
  helpful_count: number
  created_at: string
  doctor?: {
    id?: string
    full_name: string
    photo_url: string | null
  } | null
}

export interface CreateQuestionData {
  question: string
  email: string
  display_name?: string
  specialty_id?: string
  is_anonymous?: boolean
  patient_id?: string
}

export interface CreateAnswerData {
  question_id: string
  doctor_id: string
  answer: string
  is_featured?: boolean
}

function sanitizeQuestion(question: any): ExpertQuestion {
  return {
    id: question.id,
    patient_id: question.patient_id ?? null,
    specialty_id: question.specialty_id ?? null,
    question: question.question,
    display_name: question.is_anonymous ? null : question.display_name,
    status: question.status,
    is_anonymous: question.is_anonymous,
    view_count: question.view_count || 0,
    created_at: question.created_at,
    specialty: question.specialty || null,
    answers: (question.answers || []).map(sanitizeAnswer),
  }
}

function sanitizeAnswer(answer: any): ExpertAnswer {
  return {
    id: answer.id,
    question_id: answer.question_id,
    doctor_id: answer.doctor_id,
    answer: answer.answer,
    is_featured: Boolean(answer.is_featured),
    helpful_count: answer.helpful_count || 0,
    created_at: answer.created_at,
    doctor: answer.doctor
      ? {
          id: answer.doctor.id,
          full_name: answer.doctor.full_name,
          photo_url: answer.doctor.photo_url,
        }
      : null,
  }
}

export async function resolveSpecialtyId(value?: string | null): Promise<string | null> {
  if (!value) return null

  const supabase = createServiceClient()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  const query = supabase
    .from('specialties')
    .select('id')

  const { data } = await (isUuid ? query.eq('id', value) : query.eq('slug', value)).maybeSingle()

  return data?.id || null
}

export async function getPublicQuestions(options?: {
  specialtyId?: string
  limit?: number
  offset?: number
}): Promise<ExpertQuestion[]> {
  const supabase = createServiceClient()
  const limit = Math.min(Math.max(options?.limit || 20, 1), 50)
  const offset = Math.max(options?.offset || 0, 0)

  let query = supabase
    .from('expert_questions')
    .select(`
      id,
      patient_id,
      specialty_id,
      question,
      display_name,
      status,
      is_anonymous,
      view_count,
      created_at,
      specialty:specialties(id, name, slug),
      answers:expert_answers(
        id,
        question_id,
        doctor_id,
        answer,
        is_featured,
        helpful_count,
        created_at,
        doctor:profiles!expert_answers_doctor_id_fkey(id, full_name, photo_url)
      )
    `)
    .in('status', PUBLIC_QUESTION_STATUSES)

  if (options?.specialtyId) {
    query = query.eq('specialty_id', options.specialtyId)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching expert questions:', error)
    return []
  }

  return (data || []).map(sanitizeQuestion)
}

export async function getPublicQuestionById(id: string): Promise<ExpertQuestion | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('expert_questions')
    .select(`
      id,
      patient_id,
      specialty_id,
      question,
      display_name,
      status,
      is_anonymous,
      view_count,
      created_at,
      specialty:specialties(id, name, slug),
      answers:expert_answers(
        id,
        question_id,
        doctor_id,
        answer,
        is_featured,
        helpful_count,
        created_at,
        doctor:profiles!expert_answers_doctor_id_fkey(id, full_name, photo_url)
      )
    `)
    .eq('id', id)
    .in('status', PUBLIC_QUESTION_STATUSES)
    .maybeSingle()

  if (error) {
    console.error('Error fetching expert question:', error)
    return null
  }

  return data ? sanitizeQuestion(data) : null
}

export async function getModerationQuestionById(id: string): Promise<ExpertQuestion | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('expert_questions')
    .select(`
      id,
      patient_id,
      specialty_id,
      question,
      display_name,
      status,
      is_anonymous,
      view_count,
      created_at,
      specialty:specialties(id, name, slug),
      answers:expert_answers(
        id,
        question_id,
        doctor_id,
        answer,
        is_featured,
        helpful_count,
        created_at,
        doctor:profiles!expert_answers_doctor_id_fkey(id, full_name, photo_url)
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching moderation question:', error)
    return null
  }

  return data ? sanitizeQuestion(data) : null
}

export async function getModerationQuestions(options?: {
  status?: string
  specialtyId?: string
  limit?: number
}): Promise<ExpertQuestion[]> {
  const supabase = createServiceClient()
  const limit = Math.min(Math.max(options?.limit || 50, 1), 100)

  let query = supabase
    .from('expert_questions')
    .select(`
      id,
      patient_id,
      specialty_id,
      question,
      display_name,
      status,
      is_anonymous,
      view_count,
      created_at,
      specialty:specialties(id, name, slug),
      answers:expert_answers(
        id,
        question_id,
        doctor_id,
        answer,
        is_featured,
        helpful_count,
        created_at,
        doctor:profiles!expert_answers_doctor_id_fkey(id, full_name, photo_url)
      )
    `)

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.specialtyId) {
    query = query.eq('specialty_id', options.specialtyId)
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

  if (error) {
    console.error('Error fetching moderation questions:', error)
    return []
  }

  return (data || []).map(sanitizeQuestion)
}

export async function createQuestion(data: CreateQuestionData): Promise<ExpertQuestion> {
  const supabase = createServiceClient()

  const { data: question, error } = await supabase
    .from('expert_questions')
    .insert({
      question: data.question,
      email: data.email,
      display_name: data.display_name || null,
      specialty_id: data.specialty_id || null,
      is_anonymous: data.is_anonymous !== false,
      patient_id: data.patient_id || null,
      status: 'pending',
    })
    .select(`
      id,
      patient_id,
      specialty_id,
      question,
      display_name,
      status,
      is_anonymous,
      view_count,
      created_at,
      specialty:specialties(id, name, slug)
    `)
    .single()

  if (error) {
    console.error('Error creating expert question:', error)
    throw error
  }

  return sanitizeQuestion({ ...question, answers: [] })
}

export async function createAnswer(data: CreateAnswerData): Promise<ExpertAnswer> {
  const supabase = createServiceClient()

  const { data: answer, error } = await supabase
    .from('expert_answers')
    .insert({
      question_id: data.question_id,
      doctor_id: data.doctor_id,
      answer: data.answer,
      is_featured: data.is_featured || false,
    })
    .select(`
      id,
      question_id,
      doctor_id,
      answer,
      is_featured,
      helpful_count,
      created_at,
      doctor:profiles!expert_answers_doctor_id_fkey(id, full_name, photo_url)
    `)
    .single()

  if (error) {
    console.error('Error creating expert answer:', error)
    throw error
  }

  await supabase
    .from('expert_questions')
    .update({ status: 'answered' })
    .eq('id', data.question_id)
    .in('status', ['approved', 'answered'])

  return sanitizeAnswer(answer)
}

export async function getDoctorAnsweredQuestions(doctorId: string, limit = 5): Promise<ExpertQuestion[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('expert_questions')
    .select(`
      id,
      patient_id,
      specialty_id,
      question,
      display_name,
      status,
      is_anonymous,
      view_count,
      created_at,
      specialty:specialties(id, name, slug),
      answers:expert_answers!inner(
        id,
        question_id,
        doctor_id,
        answer,
        is_featured,
        helpful_count,
        created_at,
        doctor:profiles!expert_answers_doctor_id_fkey(id, full_name, photo_url)
      )
    `)
    .in('status', PUBLIC_QUESTION_STATUSES)
    .eq('expert_answers.doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching doctor answers:', error)
    return []
  }

  return (data || []).map(sanitizeQuestion)
}

export async function incrementViewCount(id: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.rpc('increment_expert_question_views', { question_id: id })
  if (error) {
    console.error('Error incrementing expert question views:', error)
  }
}

export async function getQuestionStats(): Promise<{
  totalAnswered: number
  totalDoctors: number
  totalQuestions: number
}> {
  const supabase = createServiceClient()

  const [questionsResult, answeredResult, doctorsResult] = await Promise.all([
    supabase
      .from('expert_questions')
      .select('id', { count: 'exact', head: true })
      .in('status', PUBLIC_QUESTION_STATUSES),
    supabase
      .from('expert_questions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['answered', 'closed']),
    supabase
      .from('expert_answers')
      .select('doctor_id, question:expert_questions!inner(status)')
      .in('question.status', PUBLIC_QUESTION_STATUSES)
      .limit(1000),
  ])

  const uniqueDoctors = new Set((doctorsResult.data || []).map((d: any) => d.doctor_id))

  return {
    totalQuestions: questionsResult.count || 0,
    totalAnswered: answeredResult.count || 0,
    totalDoctors: uniqueDoctors.size,
  }
}

export const getQuestions = getPublicQuestions
export const getQuestionById = getPublicQuestionById
