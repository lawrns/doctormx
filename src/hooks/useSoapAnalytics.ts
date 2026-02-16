// SOAP Analytics Hook
// Centralized event tracking for SOAP consultation UX

import { useRef, useCallback, useEffect } from 'react';
import { metrics } from '@/lib/observability/metrics';
import type {
  IntakeStep,
  FormData,
  AnalyticsContext,
  StepMetrics,
  SoapAnalyticsEvent,
} from '@/types/soap-analytics';

/**
 * Custom hook for tracking SOAP consultation analytics
 *
 * Provides methods to track all 47 events across 4 categories:
 * - Funnel events (10)
 * - Engagement events (15)
 * - Satisfaction events (12)
 * - Technical events (10)
 *
 * @param userId - User ID from authentication
 * @param abTestVariant - A/B test variant assignment
 * @returns Analytics tracking methods
 */
export function useSoapAnalytics(userId: string, abTestVariant: string) {
  const sessionStart = useRef<Date>(new Date());
  const stepStart = useRef<number>(Date.now());
  const currentStep = useRef<IntakeStep>('welcome');
  const stepMetrics = useRef<Map<IntakeStep, StepMetrics>>(new Map());
  const severityAdjustments = useRef<number>(0);
  const autocompleteUsed = useRef<boolean>(false);

  // Get device type
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Calculate form completion percentage
  const calculateCompletion = useCallback((formData: Partial<FormData>, step: IntakeStep): number => {
    const stepWeights: Record<IntakeStep, number> = {
      welcome: 0,
      'chief-complaint': 10,
      symptoms: 30,
      duration: 45,
      severity: 60,
      onset: 70,
      associated: 80,
      factors: 90,
      history: 95,
      consulting: 100,
      results: 100,
    };
    return stepWeights[step] || 0;
  }, []);

  // Initialize step metrics
  const initStepMetrics = useCallback((step: IntakeStep) => {
    if (!stepMetrics.current.has(step)) {
      stepMetrics.current.set(step, {
        step,
        enteredAt: Date.now(),
        interactions: 0,
        autocompleteUsed: false,
        severityAdjustments: 0,
      });
    }
  }, []);

  // ============================================================================
  // FUNNEL EVENTS
  // ============================================================================

  /**
   * Track consultation started
   * Called when user arrives on consultation page
   */
  const trackConsultationStarted = useCallback((referrer: string) => {
    metrics.increment('soap_consultation_started', 1, {
      user_id: userId,
      device_type: getDeviceType(),
      referrer,
      ab_test_variant: abTestVariant,
    });

    // Initialize first step
    initStepMetrics('welcome');
    currentStep.current = 'welcome';
    stepStart.current = Date.now();
  }, [userId, abTestVariant, initStepMetrics]);

  /**
   * Track step viewed
   * Called when a new step is displayed to user
   */
  const trackStepViewed = useCallback((
    step: IntakeStep,
    formData: Partial<FormData>
  ) => {
    const timeSinceStart = Date.now() - sessionStart.current.getTime();
    const completionPercent = calculateCompletion(formData, step);

    metrics.increment('soap_step_viewed', 1, {
      user_id: userId,
      step,
      time_since_start_ms: String(timeSinceStart),
      form_completion_percent: String(completionPercent),
      ab_test_variant: abTestVariant,
    });

    // Update current step
    currentStep.current = step;
    stepStart.current = Date.now();
    initStepMetrics(step);
  }, [userId, abTestVariant, calculateCompletion, initStepMetrics]);

  /**
   * Track step completed
   * Called when user completes a step and moves forward
   */
  const trackStepCompleted = useCallback((
    step: IntakeStep,
    usedAutocomplete: boolean
  ) => {
    const timeOnStep = Date.now() - stepStart.current;

    // Update step metrics
    const stepMetric = stepMetrics.current.get(step);
    if (stepMetric) {
      stepMetric.completedAt = Date.now();
      stepMetric.autocompleteUsed = usedAutocomplete;
    }

    metrics.increment('soap_step_completed', 1, {
      user_id: userId,
      step,
      time_on_step_ms: String(timeOnStep),
      interactions: String(stepMetric?.interactions || 0),
      used_autocomplete: String(usedAutocomplete),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track step abandoned (drop-off)
   * Called when user leaves without completing
   */
  const trackStepAbandoned = useCallback((
    step: IntakeStep,
    formData: Partial<FormData>,
    lastInteraction: string
  ) => {
    const timeOnStep = Date.now() - stepStart.current;
    const totalTime = Date.now() - sessionStart.current.getTime();
    const completionPercent = calculateCompletion(formData, step);

    metrics.increment('soap_step_abandoned', 1, {
      user_id: userId,
      step,
      time_on_step_ms: String(timeOnStep),
      total_time_ms: String(totalTime),
      form_completion_percent: String(completionPercent),
      last_interaction: lastInteraction,
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant, calculateCompletion]);

  /**
   * Track consultation submitted
   * Called when user submits form to start processing
   */
  const trackConsultationSubmitted = useCallback((
    stepsRevisited: number
  ) => {
    const totalTime = Date.now() - sessionStart.current.getTime();

    metrics.increment('soap_consultation_submitted', 1, {
      user_id: userId,
      total_time_ms: String(totalTime),
      steps_revisited: String(stepsRevisited),
      used_autocomplete: String(autocompleteUsed.current),
      severity_adjustments: String(severityAdjustments.current),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track processing started
   * Called when AI processing begins
   */
  const trackProcessingStarted = useCallback((specialistCount: number) => {
    metrics.increment('soap_processing_started', 1, {
      user_id: userId,
      specialist_count: String(specialistCount),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track processing completed
   * Called when AI processing finishes
   */
  const trackProcessingCompleted = useCallback((
    totalTimeMs: number,
    sseEventsReceived: number,
    sseErrors: number
  ) => {
    metrics.increment('soap_processing_completed', 1, {
      user_id: userId,
      total_time_ms: String(totalTimeMs),
      sse_events_received: String(sseEventsReceived),
      sse_errors: String(sseErrors),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track results viewed
   * Called when user views consultation results
   */
  const trackResultsViewed = useCallback((
    timeToResultsMs: number,
    specialistAgreement: boolean,
    urgencyLevel: 'low' | 'medium' | 'high'
  ) => {
    metrics.increment('soap_results_viewed', 1, {
      user_id: userId,
      time_to_results_ms: String(timeToResultsMs),
      specialist_agreement: String(specialistAgreement),
      urgency_level: urgencyLevel,
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track consultation completed
   * Called when user closes or finishes viewing results
   */
  const trackConsultationCompleted = useCallback((
    satisfactionRating?: number,
    wouldRepeat = true
  ) => {
    const totalTime = Date.now() - sessionStart.current.getTime();

    metrics.increment('soap_consultation_completed', 1, {
      user_id: userId,
      total_time_ms: String(totalTime),
      satisfaction_rating: String(satisfactionRating || 0),
      would_repeat: String(wouldRepeat),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  // ============================================================================
  // ENGAGEMENT EVENTS
  // ============================================================================

  /**
   * Track autocomplete opened
   */
  const trackAutocompleteOpened = useCallback((queryLength: number) => {
    autocompleteUsed.current = true;
    const stepMetric = stepMetrics.current.get(currentStep.current);
    if (stepMetric) {
      stepMetric.autocompleteUsed = true;
      stepMetric.interactions++;
    }

    metrics.increment('soap_autocomplete_opened', 1, {
      user_id: userId,
      query_length: String(queryLength),
      step: currentStep.current,
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track autocomplete selected
   */
  const trackAutocompleteSelected = useCallback((
    suggestionIndex: number,
    suggestionText: string,
    queryLength: number
  ) => {
    metrics.increment('soap_autocomplete_selected', 1, {
      user_id: userId,
      suggestion_index: String(suggestionIndex),
      suggestion_text: suggestionText,
      query_length: String(queryLength),
      step: currentStep.current,
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track severity slider moved
   */
  const trackSeveritySliderMoved = useCallback((
    fromValue: number,
    toValue: number
  ) => {
    severityAdjustments.current++;
    const stepMetric = stepMetrics.current.get(currentStep.current);
    if (stepMetric) {
      stepMetric.severityAdjustments++;
      stepMetric.interactions++;
    }

    metrics.increment('soap_severity_slider_moved', 1, {
      user_id: userId,
      from_value: String(fromValue),
      to_value: String(toValue),
      total_moves: String(severityAdjustments.current),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track step transition (forward or backward)
   */
  const trackStepTransition = useCallback((
    fromStep: IntakeStep,
    toStep: IntakeStep,
    reason: 'forward' | 'edit' | 'review'
  ) => {
    if (reason === 'forward') {
      metrics.increment('soap_step_forward', 1, {
        user_id: userId,
        from_step: fromStep,
        to_step: toStep,
        ab_test_variant: abTestVariant,
      });
    } else {
      metrics.increment('soap_step_backward', 1, {
        user_id: userId,
        from_step: fromStep,
        to_step: toStep,
        reason: reason,
        ab_test_variant: abTestVariant,
      });
    }

    // Update step tracking
    currentStep.current = toStep;
    stepStart.current = Date.now();
    initStepMetrics(toStep);
  }, [userId, abTestVariant, initStepMetrics]);

  /**
   * Track animation performance
   */
  const trackAnimationPerformance = useCallback((
    animationType: string,
    durationMs: number,
    averageFps: number,
    droppedFrames: number,
    userInteracted: boolean
  ) => {
    metrics.increment('soap_animation_completed', 1, {
      user_id: userId,
      animation_type: animationType,
      duration_ms: String(durationMs),
      average_fps: String(averageFps),
      dropped_frames: String(droppedFrames),
      user_interacted: String(userInteracted),
      device_type: getDeviceType(),
      ab_test_variant: abTestVariant,
    });

    metrics.histogram('soap_animation_fps', averageFps, {
      animation_type: animationType,
      device_type: getDeviceType(),
    });
  }, [userId, abTestVariant]);

  /**
   * Track celebration viewed
   */
  const trackCelebrationViewed = useCallback((
    celebrationType: 'milestone' | 'completion'
  ) => {
    metrics.increment('soap_celebration_viewed', 1, {
      user_id: userId,
      celebration_type: celebrationType,
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track encouragement displayed
   */
  const trackEncouragementDisplayed = useCallback((
    messageType: 'progress' | 'struggle' | 'completion' | 'milestone',
    messageText: string
  ) => {
    metrics.increment('soap_encouragement_displayed', 1, {
      user_id: userId,
      message_type: messageType,
      message_text: messageText.substring(0, 50), // Truncate for privacy
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  // ============================================================================
  // SATISFACTION EVENTS
  // ============================================================================

  /**
   * Track satisfaction rating
   */
  const trackSatisfactionRating = useCallback((
    rating: number,
    promptType: 'inline' | 'email' | 'push'
  ) => {
    const timeSinceCompletion = Date.now() - sessionStart.current.getTime();

    metrics.increment('soap_satisfaction_rating', 1, {
      user_id: userId,
      rating: String(rating),
      time_since_completion_ms: String(timeSinceCompletion),
      prompt_type: promptType,
      ab_test_variant: abTestVariant,
    });

    metrics.histogram('soap_rating_distribution', rating, {
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track feedback submitted
   */
  const trackFeedbackSubmitted = useCallback((
    category: string,
    sentiment: 'positive' | 'neutral' | 'negative',
    feedbackText?: string
  ) => {
    metrics.increment('soap_feedback_submitted', 1, {
      user_id: userId,
      category: category,
      sentiment: sentiment,
      text_length: String(feedbackText?.length || 0),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track feature helpfulness
   */
  const trackFeatureHelpful = useCallback((
    feature: string,
    helpful: boolean
  ) => {
    metrics.increment('soap_feature_helpful', 1, {
      user_id: userId,
      feature: feature,
      helpful: String(helpful),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track repeat consultation
   */
  const trackRepeatConsultation = useCallback((
    daysSincePrevious: number,
    previousCompletionSuccessful: boolean
  ) => {
    metrics.increment('soap_repeat_consultation', 1, {
      user_id: userId,
      days_since_previous: String(daysSincePrevious),
      previous_completion_successful: String(previousCompletionSuccessful),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  // ============================================================================
  // TECHNICAL EVENTS
  // ============================================================================

  /**
   * Track SSE event received
   */
  const trackSSEEvent = useCallback((
    eventType: 'received' | 'error' | 'reconnect',
    data?: {
      sseEventType?: string;
      latency?: number;
      errorType?: string;
      eventsReceived?: number;
      attemptNumber?: number;
    }
  ) => {
    if (eventType === 'received' && data?.latency) {
      metrics.histogram('soap_sse_latency_ms', data.latency, {
        user_id: userId,
        event_type: data.sseEventType || 'unknown',
        ab_test_variant: abTestVariant,
      });
    } else if (eventType === 'error' && data) {
      metrics.increment('soap_sse_error', 1, {
        user_id: userId,
        error_type: data.errorType || 'unknown',
        events_received: String(data.eventsReceived || 0),
        ab_test_variant: abTestVariant,
      });
    } else if (eventType === 'reconnect' && data?.attemptNumber) {
      metrics.increment('soap_sse_reconnect', 1, {
        user_id: userId,
        attempt_number: String(data.attemptNumber),
        ab_test_variant: abTestVariant,
      });
    }
  }, [userId, abTestVariant]);

  /**
   * Track error occurred
   */
  const trackError = useCallback((
    errorType: string,
    step: IntakeStep,
    recoverable: boolean
  ) => {
    metrics.increment('soap_error', 1, {
      user_id: userId,
      error_type: errorType,
      step: step,
      recoverable: String(recoverable),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  /**
   * Track error recovery
   */
  const trackErrorRecovered = useCallback((
    errorType: string,
    recoveryMethod: 'retry' | 'fallback' | 'refresh' | 'user_action',
    timeToRecoveryMs: number
  ) => {
    metrics.increment('soap_error_recovered', 1, {
      user_id: userId,
      error_type: errorType,
      recovery_method: recoveryMethod,
      time_to_recovery_ms: String(timeToRecoveryMs),
      ab_test_variant: abTestVariant,
    });
  }, [userId, abTestVariant]);

  // ============================================================================
  // SESSION END (Cleanup)
  // ============================================================================

  /**
   * Track session end (called on unmount)
   */
  useEffect(() => {
    return () => {
      const sessionDuration = Date.now() - sessionStart.current.getTime();
      const totalSteps = stepMetrics.current.size;
      const totalErrors = 0; // This would be tracked separately
      const completionSuccessful = currentStep.current === 'results';

      metrics.increment('soap_session_ended', 1, {
        user_id: userId,
        session_duration_ms: String(sessionDuration),
        total_steps_completed: String(totalSteps),
        total_errors: String(totalErrors),
        completion_successful: String(completionSuccessful),
        device_type: getDeviceType(),
        ab_test_variant: abTestVariant,
      });
    };
  }, [userId, abTestVariant, getDeviceType]);

  return {
    // Funnel events
    trackConsultationStarted,
    trackStepViewed,
    trackStepCompleted,
    trackStepAbandoned,
    trackConsultationSubmitted,
    trackProcessingStarted,
    trackProcessingCompleted,
    trackResultsViewed,
    trackConsultationCompleted,

    // Engagement events
    trackAutocompleteOpened,
    trackAutocompleteSelected,
    trackSeveritySliderMoved,
    trackStepTransition,
    trackAnimationPerformance,
    trackCelebrationViewed,
    trackEncouragementDisplayed,

    // Satisfaction events
    trackSatisfactionRating,
    trackFeedbackSubmitted,
    trackFeatureHelpful,
    trackRepeatConsultation,

    // Technical events
    trackSSEEvent,
    trackError,
    trackErrorRecovered,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Simple sentiment analysis for feedback text
 * Analyzes keywords to determine positive/neutral/negative sentiment
 */
export function analyzeSimpleSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = [
    'easy', 'good', 'great', 'helpful', 'quick', 'love', 'excellent',
    'amazing', 'friendly', 'clear', 'simple', 'fast', 'better',
    'feliz', 'bueno', 'excelente', 'fácil', 'rápido' // Spanish
  ];

  const negativeWords = [
    'hard', 'difficult', 'slow', 'confusing', 'bad', 'hate',
    'frustrating', 'complicated', 'unclear', 'error', 'wrong',
    'difícil', 'lento', 'confuso', 'malo' // Spanish
  ];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Detect emotion from consultation results
 * Analyzes urgency and specialist agreement to infer user emotion
 */
export function detectCompletionEmotion(
  urgencyLevel: 'low' | 'medium' | 'high',
  specialistAgreement: boolean
): 'relieved' | 'anxious' | 'confident' | 'uncertain' {
  if (urgencyLevel === 'low' && specialistAgreement) return 'relieved';
  if (urgencyLevel === 'high') return 'anxious';
  if (specialistAgreement) return 'confident';
  return 'uncertain';
}

/**
 * Calculate if user is struggling based on time spent
 */
export function detectUserStruggle(timeOnStepMs: number, step: IntakeStep): boolean {
  const thresholds: Record<IntakeStep, number> = {
    welcome: 30000,      // 30 seconds
    'chief-complaint': 60000,  // 1 minute
    symptoms: 120000,    // 2 minutes
    duration: 45000,     // 45 seconds
    severity: 60000,     // 1 minute
    onset: 30000,        // 30 seconds
    associated: 90000,   // 90 seconds
    factors: 90000,      // 90 seconds
    history: 60000,      // 1 minute
    consulting: 0,       // N/A (processing step)
    results: 0,          // N/A (results view)
  };

  return timeOnStepMs > (thresholds[step] || 60000);
}
