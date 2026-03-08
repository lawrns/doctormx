export type SupportAudience = 'visitor' | 'patient' | 'doctor' | 'admin'

export type SupportRouteType =
  | 'landing'
  | 'doctor-directory'
  | 'specialties'
  | 'for-doctors'
  | 'help'
  | 'contact'
  | 'legal'
  | 'ai-consult'
  | 'patient-dashboard'
  | 'patient-chat'
  | 'patient-appointments'
  | 'patient-second-opinion'
  | 'doctor-dashboard'
  | 'doctor-chat'
  | 'doctor-availability'
  | 'doctor-analytics'
  | 'doctor-finances'
  | 'doctor-onboarding'
  | 'unknown'

export interface SupportLink {
  label: string
  href: string
  description?: string
  minimizeOnClick?: boolean
}

export interface SupportPageContext {
  pathname: string
  routeType: SupportRouteType
  audience: SupportAudience
  pageTitle: string
  pageSummary: string
  knownActions: string[]
  suggestedLinks: SupportLink[]
}

export interface SupportMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SupportChatRequest {
  message: string
  pathname: string
  history?: SupportMessage[]
}

export interface SupportChatResponse {
  message: string
  suggestions?: string[]
  links?: SupportLink[]
  escalate?: boolean
  meta: {
    provider: string
    model: string
    latencyMs: number
    costUSD?: number
  }
}
