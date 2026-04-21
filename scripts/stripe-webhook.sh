#!/bin/bash
# Forward Stripe webhooks to local development server
# Run this in a separate terminal while developing

echo "Starting Stripe webhook forwarding to http://localhost:3000/api/webhooks/stripe"
echo "Press Ctrl+C to stop"

stripe listen \
  --forward-to localhost:3000/api/webhooks/stripe \
  --events payment_intent.succeeded,payment_intent.payment_failed,invoice.payment_succeeded,customer.subscription.deleted,transfer.created
