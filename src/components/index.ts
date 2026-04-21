// Re-exportar componentes - Claridad en imports
export { StatCard, SimpleStatCard, MetricCard, EmptyMetricState } from './StatCard'
export { default as PreConsultaChat } from './PreConsultaChat'
export { default as ImageUploader, type ImageUploaderProps, type UploadResult } from './ImageUploader'

// New components
export { Badge, getAppointmentBadgeVariant, getAppointmentStatusLabel } from './Badge'
export { EmptyState } from './EmptyState'
export { Skeleton, SkeletonCard, SkeletonStatCards, SkeletonAppointmentList, SkeletonTable } from './Skeleton'
export { AppointmentCard, AppointmentCardCompact } from './AppointmentCard'
export { AppointmentFilters } from './AppointmentFilters'
export type { AppointmentData } from './AppointmentCard'

// Chat Components
export { ChatList } from './ChatList'
export { ChatInput } from './ChatInput'

// UI Components
export { ToastProvider, useToast } from './Toast'
export { Modal, ModalFooter } from './Modal'
export { LoadingButton } from './LoadingButton'
export { PublicSectionHeading } from './PublicSectionHeading'
export { Breadcrumbs, HomeIcon } from './Breadcrumbs'
export type { BreadcrumbItem } from './Breadcrumbs'
export { AppBreadcrumbs } from './AppBreadcrumbs'
export { Avatar, AvatarGroup } from './Avatar'
export { Input, Textarea } from './Input'
export { Select } from './Select'
export { Card, CardHeader, CardBody, CardFooter, StatCard as StatCardNew } from './Card'

// Review Components
export { StarRating, RatingInput } from './StarRating'
export { WriteReview } from './WriteReview'
export { DoctorReviews } from './DoctorReviews'
export { ReviewTrigger } from './ReviewTrigger'

// Clinical Copilot
export { ClinicalCopilot } from './ClinicalCopilot'

// Premium Features
export { PricingBadge, PricingBadgeCompact, FeatureLimitIndicator } from './PricingBadge'

// Pharmacy Components
export { default as PharmacySuggestions } from './PharmacySuggestions'

// Analytics Components
export { Chart, MiniSparkline } from './Chart'

// Onboarding Components
export { OnboardingChecklist, WelcomeBanner } from './OnboardingChecklist'

// FREE Healthcare Components
export { QuotaCounter, QuotaBanner } from './QuotaCounter'
export { WhatsAppShare, WhatsAppShareCard, FloatingWhatsAppShare } from './WhatsAppShare'
export { EmailCapture, EmailCaptureModal } from './EmailCapture'
export { PremiumUpgradeModal, QuotaExceededBanner } from './PremiumUpgradeModal'
