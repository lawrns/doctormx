/**
 * API utilities with Sentry tracing
 * Demonstrates custom span instrumentation for HTTP requests
 */

import * as Sentry from "@sentry/react";

const API_BASE = "/.netlify/functions";

/**
 * Fetch user data with automatic tracing
 * Example of custom span instrumentation in API calls
 */
export async function fetchUserData(userId: string) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async (span) => {
      const response = await fetch(`${API_BASE}/user?id=${userId}`);
      const data = await response.json();

      // Add response metadata to span
      span?.setAttribute("http.status_code", response.status);
      span?.setAttribute("user.id", userId);

      return data;
    }
  );
}

/**
 * OpenAI API call with detailed tracing
 */
export async function fetchAICompletion(message: string, history?: string[]) {
  return Sentry.startSpan(
    {
      op: "ai.openai",
      name: "OpenAI Chat Completion",
    },
    async (span) => {
      const startTime = Date.now();

      try {
        const response = await fetch(`${API_BASE}/standard-model`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history }),
        });

        const duration = Date.now() - startTime;
        const data = await response.json();

        // Add AI-specific attributes to span
        span?.setAttribute("ai.model", "gpt-3.5-turbo");
        span?.setAttribute("ai.duration_ms", duration);
        span?.setAttribute("ai.message_length", message.length);
        span?.setAttribute("ai.has_history", !!history);

        if (!response.ok) {
          throw new Error(data.error ?? "AI request failed");
        }

        return data;
      } catch (error) {
        span?.setAttribute("error", true);
        Sentry.captureException(error, {
          tags: { api: "openai", endpoint: "standard-model" },
        });
        throw error;
      }
    }
  );
}

/**
 * Doctor symptoms analysis with tracing
 */
export async function analyzeSymptoms(symptoms: string, context?: { instructions?: string }) {
  return Sentry.startSpan(
    {
      op: "doctor.analysis",
      name: "Symptom Analysis",
    },
    async (span) => {
      try {
        const response = await fetch(`${API_BASE}/standard-model`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: symptoms,
            customInstructions: context?.instructions,
          }),
        });

        const data = await response.json();

        // Add medical context to span
        span?.setAttribute("doctor.symptoms_length", symptoms.length);
        span?.setAttribute("doctor.response_length", data.text?.length ?? 0);

        return data;
      } catch (error) {
        span?.setAttribute("error", true);
        Sentry.captureException(error, {
          tags: { feature: "doctor-symptoms" },
          extra: { symptoms: symptoms.substring(0, 100) },
        });
        throw error;
      }
    }
  );
}

/**
 * WhatsApp message send with tracing
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  return Sentry.startSpan(
    {
      op: "whatsapp.send",
      name: "WhatsApp Message Send",
    },
    async (span) => {
      try {
        const response = await fetch(`${API_BASE}/whatsapp/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, message }),
        });

        span?.setAttribute("whatsapp.recipient", to);
        span?.setAttribute("whatsapp.message_length", message.length);

        return await response.json();
      } catch (error) {
        span?.setAttribute("error", true);
        Sentry.captureException(error, {
          tags: { integration: "whatsapp" },
        });
        throw error;
      }
    }
  );
}
