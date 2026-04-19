import { createServiceClient } from '@/lib/supabase/server'

export interface ExpertQuestion {
  id: string
  patient_id: string | null
  specialty_id: string | null
  question: string
  email: string
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

export async function getQuestions(options?: {
  status?: string
  specialtyId?: string
  limit?: number
  offset?: number
}): Promise<ExpertQuestion[]> {
  const supabase = createServiceClient()
  const limit = options?.limit || 20
  const offset = options?.offset || 0

  let query = supabase
    .from('expert_questions')
    .select(`
      *,
      specialty:specialties(id, name, slug),
      answers:expert_answers(
        id,
        question_id,
        doctor_id,
        answer,
        is_featured,
        helpful_count,
        created_at,
        doctor:profiles!expert_answers_doctor_id_fkey(full_name, photo_url)
      )
    `)

  if (options?.status) {
    query = query.eq('status', options.status)
  } else {
    query = query.in('status', ['approved', 'answered', 'closed'])
  }

  if (options?.specialtyId) {
    query = query.eq('specialty_id', options.specialtyId)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching expert questions:', error)
    return []
  }

  return (data || []) as unknown as ExpertQuestion[]
}

export async function getQuestionById(id: string): Promise<ExpertQuestion | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('expert_questions')
    .select(`
      *,
      specialty:specialties(id, name, slug),
      answers:expert_answers(
        id,
        question_id,
        doctor_id,
        answer,
        is_featured,
        helpful_count,
        created_at,
        doctor:profiles!expert_answers_doctor_id_fkey(full_name, photo_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching expert question:', error)
    return null
  }

  return data as unknown as ExpertQuestion
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
    .select()
    .single()

  if (error) {
    console.error('Error creating expert question:', error)
    throw error
  }

  return question
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
    .select()
    .single()

  if (error) {
    console.error('Error creating expert answer:', error)
    throw error
  }

  // Update question status to answered
  await supabase
    .from('expert_questions')
    .update({ status: 'answered' })
    .eq('id', data.question_id)

  return answer
}

export async function getFeaturedAnswers(limit: number = 5): Promise<Array<{
  question: ExpertQuestion
  answer: ExpertAnswer
}>> {
  const supabase = createServiceClient()

  const { data: answers, error } = await supabase
    .from('expert_answers')
    .select(`
      *,
      question:expert_questions(
        *,
        specialty:specialties(id, name, slug)
      ),
      doctor:profiles!expert_answers_doctor_id_fkey(full_name, photo_url)
    `)
    .eq('is_featured', true)
    .order('helpful_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured answers:', error)
    return []
  }

  return (answers || []).map((a: any) => ({
    question: a.question as ExpertQuestion,
    answer: {
      id: a.id,
      question_id: a.question_id,
      doctor_id: a.doctor_id,
      answer: a.answer,
      is_featured: a.is_featured,
      helpful_count: a.helpful_count,
      created_at: a.created_at,
      doctor: a.doctor,
    } as ExpertAnswer,
  }))
}

export async function incrementViewCount(id: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.rpc('increment_expert_question_views', { question_id: id })

  // If the RPC doesn't exist, do a manual increment
  if (error) {
    const { data: question } = await supabase
      .from('expert_questions')
      .select('view_count')
      .eq('id', id)
      .single()

    if (question) {
      await supabase
        .from('expert_questions')
        .update({ view_count: question.view_count + 1 })
        .eq('id', id)
    }
  }
}

export async function getQuestionStats(): Promise<{
  totalAnswered: number
  totalDoctors: number
  totalQuestions: number
}> {
  const supabase = createServiceClient()

  const [questionsResult, answeredResult, doctorsResult] = await Promise.all([
    supabase.from('expert_questions').select('id', { count: 'exact', head: true }),
    supabase.from('expert_questions').select('id', { count: 'exact', head: true }).in('status', ['answered', 'closed']),
    supabase.from('expert_answers').select('doctor_id').limit(1000),
  ])

  const uniqueDoctors = new Set((doctorsResult.data || []).map((d: any) => d.doctor_id))

  return {
    totalQuestions: questionsResult.count || 0,
    totalAnswered: answeredResult.count || 0,
    totalDoctors: uniqueDoctors.size,
  }
}
