# SOAP UX Phase 1: Quick Reference Guide

**For Implementation Team & Stakeholders**

---

## TL;DR Summary

**What:** Redesign SOAP consultation UX to increase completion by +15%
**How:** Progressive disclosure + conversational UI + enhanced inputs + celebrations
**When:** 4-week rollout starting Week 1
**Success:** 80% completion rate (up from 65%), 4.3/5 satisfaction (up from 3.2/5)

---

## 4-Week Rollout Schedule

| Week | Features | User Exposure | Key Metric | Target |
|------|----------|---------------|------------|--------|
| **1** | Progressive disclosure, Conversational welcome | 10% | Drop-off at step 2 | <15% |
| **2** | Enhanced severity slider, Symptom autocomplete | 25% | Autocomplete usage | >40% |
| **3** | Micro-animations, Success celebrations | 50% | Positive sentiment | >60% |
| **4** | Full rollout, Optimization | 100% | **Completion rate** | **+15%** ⭐ |

---

## Success Metrics Dashboard

### Primary KPIs (The "North Star")

| Metric | Baseline | Target | Current | Status |
|--------|----------|--------|---------|--------|
| **Completion Rate** | 65% | 80% (+15%) | - | 🔵 Tracking |
| **User Satisfaction** | 3.2/5 | 4.0/5 (+25%) | - | 🔵 Tracking |
| **Avg Completion Time** | 4:12 | +10% max (4:38) | - | 🔵 Tracking |
| **Error Rate** | 2.5% | <2% | - | 🔵 Tracking |

### Secondary KPIs (Leading Indicators)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Autocomplete Usage | >40% | Shows input friction reduction |
| Severity Adjustments | <20% | Indicates clarity of input |
| Step Revisits | <15% | Reveals question comprehension |
| Positive Sentiment | >60% | Emotional connection score |
| Repeat Usage (7-day) | +20% | Long-term engagement signal |

---

## Funnel Metrics (Drop-off Tracking)

```
Welcome (100%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓ 92% ▼
Chief Complaint (92%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓ 87% ▼
Symptoms (87%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓ 83% ▼
Duration (83%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓ 80% ▼
Severity (80%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓ 78% ▼
Processing (78%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓ 75% ▼
Results (75%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓ 80% ▼
TARGET: 80% Overall Completion ⭐
```

**Action Thresholds:**
- 🔴 **Critical:** Drop-off >20% at any step → Immediate investigation
- 🟡 **Warning:** Drop-off 15-20% → Monitor closely
- 🟢 **Healthy:** Drop-off <15% → Normal operation

---

## A/B Tests Scheduled

### Test 1: Progressive Disclosure (Week 1-2)
- **A:** Control (current all-visible form)
- **B:** 3 questions visible
- **C:** 1 question per screen
- **Winner:** Variant with highest completion rate
- **Sample:** 1,000 users per variant
- **Duration:** 2 weeks

### Test 2: Severity Slider Visuals (Week 2)
- **A:** Numeric 1-10
- **B:** Numeric + color gradient
- **C:** Emoji faces (Wong-Baker)
- **D:** Descriptive labels
- **Winner:** Fastest selection + lowest adjustment rate
- **Sample:** 500 users per variant
- **Duration:** 1 week

### Test 3: Celebration Timing (Week 3)
- **A:** No celebration
- **B:** 2 seconds
- **C:** 5 seconds
- **D:** User-triggered
- **Winner:** Highest repeat rate + positive sentiment
- **Sample:** 750 users per variant
- **Duration:** 2 weeks

### Test 4: Message Phrasing (Week 3-4)
- **A:** Clinical ("Describe symptoms")
- **B:** Conversational ("What's bothering you?")
- **C:** Warm + Docu references
- **Winner:** Lowest drop-off + highest satisfaction
- **Sample:** 800 users per variant
- **Duration:** 1 week

---

## Tech Stack Changes

### New Dependencies
```json
{
  "canvas-confetti": "^1.9.0",      // Celebration animations
  "framer-motion": "^11.0.0"        // Micro-animations
}
```

### Database Schema Additions
```sql
ALTER TABLE consultations ADD COLUMN completion_time_ms INT;
ALTER TABLE consultations ADD COLUMN ab_test_variant VARCHAR(50);
ALTER TABLE consultations ADD COLUMN drop_off_step VARCHAR(50);
ALTER TABLE consultations ADD COLUMN body_map_used BOOLEAN DEFAULT FALSE;
ALTER TABLE consultations ADD COLUMN autocomplete_used BOOLEAN DEFAULT FALSE;
ALTER TABLE consultations ADD COLUMN user_satisfaction INT CHECK (user_satisfaction BETWEEN 1 AND 5);
```

### New Files to Create (Phase 1)
```
src/components/soap/intake/
  ├── ProgressStepper.tsx           # Step progress indicator
  ├── QuestionCard.tsx              # Fade-in question wrapper
  ├── ConversationalWelcome.tsx     # Friendly greeting screen
  ├── EnhancedSeveritySlider.tsx    # Visual severity input
  └── SymptomAutocomplete.tsx       # Smart symptom suggestions

src/components/soap/shared/
  ├── SuccessCelebration.tsx        # Confetti completion screen
  └── MicroAnimations.tsx           # Transition animations

src/lib/data/
  └── symptom-database.ts           # 200+ symptoms for autocomplete

src/hooks/
  ├── useSoapAnalytics.ts          # Centralized event tracking
  ├── useKeyboardNavigation.ts     # Tab/Enter shortcuts
  └── useConfetti.ts               # Celebration trigger

src/types/
  └── soap-analytics.ts            # Event type definitions
```

---

## Event Tracking (47 Events Total)

### Funnel Events (10)
- `consultation_started`
- `step_viewed`
- `step_completed`
- `step_abandoned`
- `consultation_submitted`
- `processing_started`
- `processing_completed`
- `results_viewed`
- `consultation_completed`
- `consultation_shared`

### Engagement Events (15)
- `symptom_autocomplete_opened`
- `symptom_autocomplete_selected`
- `symptom_manual_input`
- `severity_slider_moved`
- `severity_submitted`
- `step_forward`
- `step_backward`
- `animation_started`
- `animation_completed`
- `celebration_viewed`
- `celebration_confetti_triggered`
- `encouragement_displayed`
- `encouragement_dismissed`
- `progress_bar_viewed`
- `progress_milestone_reached`

### Satisfaction Events (12)
- `satisfaction_rating_given`
- `feedback_submitted`
- `feature_helpful`
- `repeat_consultation_started`
- `referral_link_copied`
- `referral_email_sent`
- `sentiment_detected`
- `completion_emotion_recorded`
- `helpful_button_clicked`
- `not_helpful_button_clicked`
- `nudge_dismissed`
- `nudge_accepted`

### Technical Events (10)
- `page_load_completed`
- `step_rendered`
- `animation_performance`
- `sse_connection_established`
- `sse_event_received`
- `sse_error`
- `sse_reconnect_attempted`
- `error_occurred`
- `error_recovered`
- `client_session_ended`

---

## Rollback Criteria

**Immediate Rollback (Stop Deployment):**
- Error rate >5% for 5+ minutes
- SSE success rate <90% for 10+ minutes
- Critical P0 bug reported
- Performance degradation >50%

**Partial Rollback (Reduce Exposure):**
- Drop-off rate increases >20% at any step
- Negative sentiment spikes >40%
- Completion time increases >30%
- Mobile Lighthouse score drops below 70

**Monitor Closely (Yellow Flag):**
- Drop-off rate increases 10-20%
- Satisfaction drops 0.5+ points
- Autocomplete usage <25%
- Any A/B test variant underperforms control

---

## Success Criteria (Phase 1 Complete)

### Must Have (Block Phase 2)
- ✅ Completion rate: +15% over baseline (80% total)
- ✅ User satisfaction: >4/5
- ✅ Error rate: <2%
- ✅ SSE success rate: >98%
- ✅ Mobile Lighthouse: >90

### Should Have (Target for Optimization)
- ⭐ Completion rate: +18% over baseline
- ⭐ Completion time: +5% (better than +10% target)
- ⭐ Autocomplete usage: >50%
- ⭐ Positive sentiment: >70%
- ⭐ Repeat usage (7-day): +20%

### Nice to Have (Stretch Goals)
- 🚀 Completion rate: +20% over baseline
- 🚀 Time to completion: -5% (faster than baseline)
- 🚀 Zero drop-offs at first 3 steps
- 🚀 50% users rate 5/5
- 🚀 <1% error rate

---

## Phase 2 Prerequisites

**Data Requirements:**
- [ ] 1,000+ completed consultations with Phase 1
- [ ] 2+ weeks of stable metrics
- [ ] A/B test winners validated
- [ ] Error patterns documented

**Technical Requirements:**
- [ ] Analytics dashboard operational (14+ days)
- [ ] Real-time alerting configured
- [ ] Database schema finalized for Phase 2
- [ ] Performance budget established (3D load time)

**User Research:**
- [ ] 50+ user feedback responses
- [ ] 10+ user interviews
- [ ] Pain point analysis complete
- [ ] Feature prioritization validated

---

## Dashboard URLs

**Staging:** https://staging.doctory.com/analytics/soap
**Production:** https://doctory.com/admin/analytics/soap (auth required)
**A/B Tests:** https://doctory.com/admin/ab-tests

---

## Key Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| Product Lead | [Name] | Prioritization, decisions |
| Engineering Lead | [Name] | Implementation, architecture |
| Data Analyst | [Name] | Metrics, dashboards, queries |
| UX Designer | [Name] | Design validation, research |

---

## Daily Checklist (During Rollout)

**Morning (9am):**
- [ ] Check completion rate (7-day moving avg)
- [ ] Review error rate (last 24 hours)
- [ ] Scan Sentry for critical errors
- [ ] Verify SSE success rate >98%

**Afternoon (2pm):**
- [ ] Check A/B test progress (sample size)
- [ ] Review user feedback (last 12 hours)
- [ ] Monitor drop-off rates by step
- [ ] Track sentiment analysis

**Evening (5pm):**
- [ ] Summarize metrics for daily standup
- [ ] Flag any anomalies for investigation
- [ ] Update progress dashboard
- [ ] Send daily summary email to stakeholders

---

## Weekly Status Update Template

```markdown
# SOAP UX Phase 1 - Week {N} Status

## Metrics Snapshot
- Completion Rate: {XX.X}% ({+/- X.X%} vs baseline)
- Satisfaction: {X.X}/5
- Active Users: {X,XXX}
- Error Rate: {X.XX}%

## This Week's Wins
- [Feature 1] deployed to {XX}% users → [Metric] +{XX}%
- A/B test [Test Name] → Variant [X] winning by {XX}%
- User feedback: [Key insight]

## Issues & Mitigations
- [Issue] → [Action taken] → [Status]

## Next Week
- Deploy [Feature] to {XX}% users
- Launch A/B test [Test Name]
- Target: [Metric goal]

## Dashboard
[Link to live metrics]
```

---

## Emergency Contacts

**Critical Issues (P0):**
- Engineering Lead: [Phone/Slack]
- Product Lead: [Phone/Slack]
- On-Call Engineer: [Phone]

**During Business Hours:**
- General questions: #soap-ux Slack channel
- Bug reports: #soap-bugs Slack channel
- Analytics requests: #analytics Slack channel

---

## Related Documents

- **Full Framework:** `/docs/SOAP-UX-IMPLEMENTATION-FRAMEWORK.md`
- **Design Doc:** `/docs/SOAP-UX-REDESIGN.md`
- **Analytics API:** `/docs/api/soap-analytics.md`
- **A/B Testing:** `/docs/analytics/ab-testing.md`

---

**Last Updated:** 2026-01-26
**Version:** 1.0

*For questions or updates, contact the Product team.*
