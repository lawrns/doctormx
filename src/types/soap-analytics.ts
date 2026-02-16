// SOAP Analytics Type Definitions
// Comprehensive event tracking for Phase 1 UX improvements

export type IntakeStep =
  | 'welcome'
  | 'chief-complaint'
  | 'symptoms'
  | 'duration'
  | 'severity'
  | 'onset'
  | 'associated'
  | 'factors'
  | 'history'
  | 'consulting'
  | 'results';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ABTestVariant = 'A' | 'B' | 'C' | 'D' | 'control';

// ============================================================================
// FUNNEL EVENTS (10 events)
// ============================================================================

export interface ConsultationStartedEvent {
  event_type: 'consultation_started';
  user_id: string;
  timestamp: Date;
  device_type: DeviceType;
  referrer: string;
  ab_test_variant: string;
  user_age_group?: 'child' | 'teen' | 'adult' | 'senior';
}

export interface StepViewedEvent {
  event_type: 'step_viewed';
  user_id: string;
  step: IntakeStep;
  time_since_start_ms: number;
  form_completion_percent: number;
  ab_test_variant: string;
}

export interface StepCompletedEvent {
  event_type: 'step_completed';
  user_id: string;
  step: IntakeStep;
  time_on_step_ms: number;
  interactions: number;
  used_autocomplete: boolean;
  ab_test_variant: string;
}

export interface StepAbandonedEvent {
  event_type: 'step_abandoned';
  user_id: string;
  step: IntakeStep;
  time_on_step_ms: number;
  form_completion_percent: number;
  last_interaction: string;
  ab_test_variant: string;
}

export interface ConsultationSubmittedEvent {
  event_type: 'consultation_submitted';
  user_id: string;
  total_time_ms: number;
  steps_revisited: number;
  used_autocomplete: boolean;
  severity_adjustments: number;
  ab_test_variant: string;
}

export interface ProcessingStartedEvent {
  event_type: 'processing_started';
  user_id: string;
  timestamp: Date;
  specialist_count: number;
  ab_test_variant: string;
}

export interface ProcessingCompletedEvent {
  event_type: 'processing_completed';
  user_id: string;
  total_time_ms: number;
  sse_events_received: number;
  sse_errors: number;
  ab_test_variant: string;
}

export interface ResultsViewedEvent {
  event_type: 'results_viewed';
  user_id: string;
  time_to_results_ms: number;
  specialist_agreement: boolean;
  urgency_level: 'low' | 'medium' | 'high';
  ab_test_variant: string;
}

export interface ConsultationCompletedEvent {
  event_type: 'consultation_completed';
  user_id: string;
  total_time_ms: number;
  satisfaction_rating?: number;
  would_repeat: boolean;
  ab_test_variant: string;
}

export interface ConsultationSharedEvent {
  event_type: 'consultation_shared';
  user_id: string;
  method: 'link' | 'email' | 'whatsapp';
  recipient_type: 'doctor' | 'family' | 'friend';
  ab_test_variant: string;
}

// ============================================================================
// ENGAGEMENT EVENTS (15 events)
// ============================================================================

export interface SymptomAutocompleteOpenedEvent {
  event_type: 'symptom_autocomplete_opened';
  user_id: string;
  query_length: number;
  ab_test_variant: string;
}

export interface SymptomAutocompleteSelectedEvent {
  event_type: 'symptom_autocomplete_selected';
  user_id: string;
  suggestion_index: number;
  suggestion_text: string;
  query_length: number;
  ab_test_variant: string;
}

export interface SymptomManualInputEvent {
  event_type: 'symptom_manual_input';
  user_id: string;
  text_length: number;
  ab_test_variant: string;
}

export interface SeveritySliderMovedEvent {
  event_type: 'severity_slider_moved';
  user_id: string;
  from_value: number;
  to_value: number;
  total_moves: number;
  ab_test_variant: string;
}

export interface SeveritySubmittedEvent {
  event_type: 'severity_submitted';
  user_id: string;
  value: number;
  time_spent_ms: number;
  adjustments: number;
  ab_test_variant: string;
}

export interface StepForwardEvent {
  event_type: 'step_forward';
  user_id: string;
  from_step: IntakeStep;
  to_step: IntakeStep;
  ab_test_variant: string;
}

export interface StepBackwardEvent {
  event_type: 'step_backward';
  user_id: string;
  from_step: IntakeStep;
  to_step: IntakeStep;
  reason: 'edit' | 'review';
  ab_test_variant: string;
}

export interface AnimationStartedEvent {
  event_type: 'animation_started';
  user_id: string;
  animation_type: 'confetti' | 'transition' | 'micro' | 'docu_state';
  ab_test_variant: string;
}

export interface AnimationCompletedEvent {
  event_type: 'animation_completed';
  user_id: string;
  animation_type: string;
  duration_ms: number;
  user_interacted: boolean;
  average_fps: number;
  ab_test_variant: string;
}

export interface CelebrationViewedEvent {
  event_type: 'celebration_viewed';
  user_id: string;
  celebration_type: 'milestone' | 'completion';
  time_on_screen_ms: number;
  ab_test_variant: string;
}

export interface CelebrationConfettiTriggeredEvent {
  event_type: 'celebration_confetti_triggered';
  user_id: string;
  particles_count: number;
  user_clicked: boolean;
  ab_test_variant: string;
}

export interface EncouragementDisplayedEvent {
  event_type: 'encouragement_displayed';
  user_id: string;
  message_type: 'progress' | 'struggle' | 'completion' | 'milestone';
  message_text: string;
  ab_test_variant: string;
}

export interface EncouragementDismissedEvent {
  event_type: 'encouragement_dismissed';
  user_id: string;
  time_displayed_ms: number;
  dismissal_method: 'auto' | 'user_action';
  ab_test_variant: string;
}

export interface ProgressBarViewedEvent {
  event_type: 'progress_bar_viewed';
  user_id: string;
  current_percent: number;
  total_steps: number;
  current_step: IntakeStep;
  ab_test_variant: string;
}

export interface ProgressMilestoneReachedEvent {
  event_type: 'progress_milestone_reached';
  user_id: string;
  milestone: 'welcome_complete' | 'symptoms_complete' | 'body_selected' | 'specialists_consulted';
  milestone_percent: number;
  ab_test_variant: string;
}

// ============================================================================
// SATISFACTION EVENTS (12 events)
// ============================================================================

export interface SatisfactionRatingGivenEvent {
  event_type: 'satisfaction_rating_given';
  user_id: string;
  rating: number; // 1-5
  time_since_completion_ms: number;
  prompt_type: 'inline' | 'email' | 'push';
  ab_test_variant: string;
}

export interface FeedbackSubmittedEvent {
  event_type: 'feedback_submitted';
  user_id: string;
  category: 'ease' | 'speed' | 'clarity' | 'character' | 'autocomplete' | 'other';
  sentiment: Sentiment;
  text_length: number;
  feedback_text?: string;
  ab_test_variant: string;
}

export interface FeatureHelpfulEvent {
  event_type: 'feature_helpful';
  user_id: string;
  feature: 'autocomplete' | 'severity_slider' | 'progress_bar' | 'celebration' | 'docu_character' | 'sse_updates';
  helpful: boolean;
  ab_test_variant: string;
}

export interface RepeatConsultationStartedEvent {
  event_type: 'repeat_consultation_started';
  user_id: string;
  days_since_previous: number;
  previous_completion_successful: boolean;
  previous_rating?: number;
  ab_test_variant: string;
}

export interface ReferralLinkCopiedEvent {
  event_type: 'referral_link_copied';
  user_id: string;
  consultation_id: string;
  ab_test_variant: string;
}

export interface ReferralEmailSentEvent {
  event_type: 'referral_email_sent';
  user_id: string;
  recipient_email: string;
  recipient_type: 'doctor' | 'family' | 'friend';
  consultation_id: string;
  ab_test_variant: string;
}

export interface SentimentDetectedEvent {
  event_type: 'sentiment_detected';
  user_id: string;
  sentiment: 'confident' | 'anxious' | 'frustrated' | 'relieved' | 'happy' | 'confused';
  trigger: 'processing_wait' | 'complex_question' | 'error' | 'milestone' | 'completion';
  confidence_score: number;
  ab_test_variant: string;
}

export interface CompletionEmotionRecordedEvent {
  event_type: 'completion_emotion_recorded';
  user_id: string;
  emotion: 'relieved' | 'anxious' | 'confident' | 'uncertain' | 'happy' | 'frustrated';
  urgency_level: 'low' | 'medium' | 'high';
  specialist_agreement: boolean;
  ab_test_variant: string;
}

export interface HelpfulButtonClickedEvent {
  event_type: 'helpful_button_clicked';
  user_id: string;
  element: 'encouragement_message' | 'docu_dialogue' | 'tooltip' | 'example';
  helpful: boolean;
  ab_test_variant: string;
}

export interface NotHelpfulButtonClickedEvent {
  event_type: 'not_helpful_button_clicked';
  user_id: string;
  element: 'encouragement_message' | 'docu_dialogue' | 'tooltip' | 'example';
  reason?: string;
  ab_test_variant: string;
}

export interface NudgeDismissedEvent {
  event_type: 'nudge_dismissed';
  user_id: string;
  nudge_type: 'completion_reminder' | 'feature_discovery' | 'feedback_request';
  time_displayed_ms: number;
  ab_test_variant: string;
}

export interface NudgeAcceptedEvent {
  event_type: 'nudge_accepted';
  user_id: string;
  nudge_type: 'completion_reminder' | 'feature_discovery' | 'feedback_request';
  time_to_accept_ms: number;
  ab_test_variant: string;
}

// ============================================================================
// TECHNICAL EVENTS (10 events)
// ============================================================================

export interface PageLoadCompletedEvent {
  event_type: 'page_load_completed';
  user_id?: string;
  time_to_interactive_ms: number;
  dom_content_loaded_ms: number;
  resources_loaded_count: number;
  total_page_size_bytes: number;
  device_type: DeviceType;
  network_type: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
}

export interface StepRenderedEvent {
  event_type: 'step_rendered';
  user_id: string;
  step: IntakeStep;
  render_time_ms: number;
  component_count: number;
  ab_test_variant: string;
}

export interface AnimationPerformanceEvent {
  event_type: 'animation_performance';
  user_id: string;
  animation_type: string;
  average_fps: number;
  dropped_frames: number;
  duration_ms: number;
  device_type: DeviceType;
  ab_test_variant: string;
}

export interface SseConnectionEstablishedEvent {
  event_type: 'sse_connection_established';
  user_id: string;
  time_to_connect_ms: number;
  retry_count: number;
  consultation_id: string;
  ab_test_variant: string;
}

export interface SseEventReceivedEvent {
  event_type: 'sse_event_received';
  user_id: string;
  sse_event_type: 'phase_complete' | 'specialist_done' | 'error' | 'consensus';
  latency_ms: number;
  event_number: number;
  consultation_id: string;
  ab_test_variant: string;
}

export interface SseErrorEvent {
  event_type: 'sse_error';
  user_id: string;
  error_type: 'connection_lost' | 'timeout' | 'parse_error' | 'server_error';
  time_since_start_ms: number;
  events_received_before_error: number;
  consultation_id: string;
  ab_test_variant: string;
}

export interface SseReconnectAttemptedEvent {
  event_type: 'sse_reconnect_attempted';
  user_id: string;
  attempt_number: number;
  time_since_error_ms: number;
  consultation_id: string;
  ab_test_variant: string;
}

export interface ErrorOccurredEvent {
  event_type: 'error_occurred';
  user_id: string;
  error_type: string;
  error_message?: string;
  step: IntakeStep;
  user_message_shown: boolean;
  recoverable: boolean;
  stack_trace?: string;
  ab_test_variant: string;
}

export interface ErrorRecoveredEvent {
  event_type: 'error_recovered';
  user_id: string;
  error_type: string;
  recovery_method: 'retry' | 'fallback' | 'refresh' | 'user_action';
  time_to_recovery_ms: number;
  ab_test_variant: string;
}

export interface ClientSessionEndedEvent {
  event_type: 'client_session_ended';
  user_id: string;
  session_duration_ms: number;
  total_errors: number;
  total_steps_completed: number;
  completion_successful: boolean;
  device_type: DeviceType;
  ab_test_variant: string;
}

// ============================================================================
// UNION TYPE
// ============================================================================

export type SoapAnalyticsEvent =
  // Funnel Events
  | ConsultationStartedEvent
  | StepViewedEvent
  | StepCompletedEvent
  | StepAbandonedEvent
  | ConsultationSubmittedEvent
  | ProcessingStartedEvent
  | ProcessingCompletedEvent
  | ResultsViewedEvent
  | ConsultationCompletedEvent
  | ConsultationSharedEvent
  // Engagement Events
  | SymptomAutocompleteOpenedEvent
  | SymptomAutocompleteSelectedEvent
  | SymptomManualInputEvent
  | SeveritySliderMovedEvent
  | SeveritySubmittedEvent
  | StepForwardEvent
  | StepBackwardEvent
  | AnimationStartedEvent
  | AnimationCompletedEvent
  | CelebrationViewedEvent
  | CelebrationConfettiTriggeredEvent
  | EncouragementDisplayedEvent
  | EncouragementDismissedEvent
  | ProgressBarViewedEvent
  | ProgressMilestoneReachedEvent
  // Satisfaction Events
  | SatisfactionRatingGivenEvent
  | FeedbackSubmittedEvent
  | FeatureHelpfulEvent
  | RepeatConsultationStartedEvent
  | ReferralLinkCopiedEvent
  | ReferralEmailSentEvent
  | SentimentDetectedEvent
  | CompletionEmotionRecordedEvent
  | HelpfulButtonClickedEvent
  | NotHelpfulButtonClickedEvent
  | NudgeDismissedEvent
  | NudgeAcceptedEvent
  // Technical Events
  | PageLoadCompletedEvent
  | StepRenderedEvent
  | AnimationPerformanceEvent
  | SseConnectionEstablishedEvent
  | SseEventReceivedEvent
  | SseErrorEvent
  | SseReconnectAttemptedEvent
  | ErrorOccurredEvent
  | ErrorRecoveredEvent
  | ClientSessionEndedEvent;

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface FormData {
  chiefComplaint: string;
  symptomsDescription: string;
  symptomDuration: string;
  symptomSeverity: number;
  onsetType: 'sudden' | 'gradual' | null;
  associatedSymptoms: string;
  aggravatingFactors: string;
  relievingFactors: string;
  medicalHistory: string;
}

export interface AnalyticsContext {
  userId: string;
  abTestVariant: string;
  deviceType: DeviceType;
  startTime: Date;
  currentStep: IntakeStep;
  stepStartTime: number;
}

export interface StepMetrics {
  step: IntakeStep;
  enteredAt: number;
  completedAt?: number;
  interactions: number;
  autocompleteUsed: boolean;
  severityAdjustments: number;
}
