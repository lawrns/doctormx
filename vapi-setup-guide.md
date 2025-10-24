# VAPI Assistant Setup Guide

## Step 1: Set up Environment Variables

Create a `.env` file in the project root with:

```bash
VAPI_API_KEY=your_vapi_api_key_here
FROM_NUMBER=+525555555555
```

**Important:** 
- Replace `your_vapi_api_key_here` with your actual VAPI API key
- Replace `+525555555555` with your registered VAPI phone number

## Step 2: Run the Setup Script

```bash
node setup-vapi-assistant.js
```

## What the Script Does

1. **Creates the Spanish AI Assistant** with the Doctor.mx script
2. **Makes calls to three doctors:**
   - José (+526144067062)
   - Óscar (+526141189516) 
   - Isaac (+526141115056)
3. **Waits 20 seconds between calls** for natural pacing

## Assistant Features

- **Voice:** Elliot (Spanish)
- **Language:** es-MX (Mexican Spanish)
- **Model:** GPT-4o-mini
- **Transcriber:** Whisper
- **Script:** Professional Doctor.mx founder program pitch

## Manual Commands (Alternative)

If you prefer to use the VAPI CLI directly:

```bash
# Create assistant
vapi assistants:create \
  --name "Asistente Doctor.mx" \
  --provider vapi \
  --voice Elliot \
  --language es-MX \
  --model gpt-4o-mini \
  --transcriber whisper \
  --description "Asistente telefónico de Doctor.mx para contactar doctores en México y ofrecerles el plan fundador." \
  --instructions 'Eres un asistente de voz profesional...'

# Make calls
export VAPI_API_KEY="YOUR_VAPI_KEY_HERE"
export ASSISTANT_ID="Asistente Doctor.mx"
export FROM_NUMBER="+525555555555"

vapi calls:create --to "+526144067062" --from "$FROM_NUMBER" --assistant "$ASSISTANT_ID"
vapi calls:create --to "+526141189516" --from "$FROM_NUMBER" --assistant "$ASSISTANT_ID"
vapi calls:create --to "+526141115056" --from "$FROM_NUMBER" --assistant "$ASSISTANT_ID"
```

## Troubleshooting

- **Missing API Key:** Make sure VAPI_API_KEY is set in your .env file
- **Invalid Phone Number:** Ensure FROM_NUMBER is registered with VAPI
- **Call Failures:** Check VAPI dashboard for call logs and errors





