/**
 * Example component showing Sentry span instrumentation
 * for user interactions and button clicks
 */

import * as Sentry from "@sentry/react";

export function SentryTestButton() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span?.setAttribute("config", value);
        span?.setAttribute("metric", metric);

        // Simulate some work
        console.log("Button clicked - work performed");
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleTestButtonClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Test Sentry
    </button>
  );
}
