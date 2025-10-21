#!/bin/bash

# VAPI Assistant Calling Script
# Make sure to set your environment variables first:
# export VAPI_API_KEY="your_api_key_here"
# export FROM_NUMBER="+525555555555"

if [ -z "$VAPI_API_KEY" ]; then
    echo "❌ Error: VAPI_API_KEY environment variable is required"
    echo "Please set your VAPI API key:"
    echo "export VAPI_API_KEY=\"your_api_key_here\""
    exit 1
fi

if [ -z "$FROM_NUMBER" ]; then
    echo "❌ Error: FROM_NUMBER environment variable is required"
    echo "Please set your registered VAPI phone number:"
    echo "export FROM_NUMBER=\"+525555555555\""
    exit 1
fi

# Assistant configuration
ASSISTANT_ID="Asistente Doctor.mx"
FROM_NUMBER=${FROM_NUMBER:-"+525555555555"}

# Doctor phone numbers and names
declare -A DOCTORS
DOCTORS["+526144067062"]="José"
DOCTORS["+526141189516"]="Óscar"
DOCTORS["+526141115056"]="Isaac"

echo "🚀 VAPI Assistant Calling Script"
echo "📱 From Number: $FROM_NUMBER"
echo "🤖 Assistant: $ASSISTANT_ID"
echo ""

# First, create the assistant if it doesn't exist
echo "📋 Creating assistant..."
curl -X POST "https://api.vapi.ai/assistant" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Asistente Doctor.mx",
    "provider": "vapi",
    "voice": "Elliot",
    "language": "es-MX",
    "model": "gpt-4o-mini",
    "transcriber": "whisper",
    "description": "Asistente telefónico de Doctor.mx para contactar doctores en México y ofrecerles el plan fundador.",
    "instructions": "Eres un asistente de voz profesional, cálido y persuasivo de Doctor.mx. Tu misión es contactar a doctores en México para invitarlos al programa fundador de Doctor.mx. Habla siempre en español neutro y con tono amable, claro y entusiasta.\n\nDurante la llamada, sigue este guion estructurado con pausas naturales:\n\n---\n👋 INTRODUCCIÓN:\n\"Hola, ¿qué tal? ¿Hablo con el doctor o la doctora? Perfecto.\nLe saluda el asistente virtual de **Doctor.mx**.\nEstamos abriendo su ciudad con una plataforma que automatiza la agenda médica con inteligencia artificial.\"\n\n(📍pausa breve)\n\n---\n💡 BENEFICIO PRINCIPAL:\n\"Doctor.mx incluye un **recepcionista AI disponible las 24 horas**, que responde WhatsApp, agenda citas y confirma pacientes automáticamente.\nAsí usted puede enfocarse en su consulta y no perder pacientes por mensajes sin responder.\"\n\n(📍pausa breve)\n\n---\n💰 OFERTA ESPECIAL:\n\"Estamos ofreciendo un **precio fundador exclusivo** de $499 pesos al mes o $4,999 al año, válido solo durante los primeros 6 meses del lanzamiento en su ciudad.\nDespués, el precio se duplicará para nuevas altas, pero los fundadores conservan su tarifa para siempre.\"\n\n(📍pausa breve)\n\n---\n📊 VALOR AGREGADO:\n\"El sistema incluye perfil premium en Doctor.mx, optimización en Google Maps y recordatorios automáticos para reducir ausencias.\nAdemás, puede migrar toda su agenda actual en 48 horas.\"\n\n(📍pausa breve)\n\n---\n📞 CIERRE Y LLAMADO A LA ACCIÓN:\n\"¿Le gustaría recibir una demostración de 2 minutos por WhatsApp para conocer cómo funciona?\nSolo necesito su confirmación y le enviamos el enlace directamente.\"\n\nSi el doctor responde afirmativamente, confirma:\n\"Perfecto, le enviaremos la demo al mismo número de este contacto. Muchas gracias doctor(a) y que tenga excelente día.\"\n\nSi dice que no, responde amablemente:\n\"De acuerdo doctor(a), muchas gracias por su tiempo. Si cambia de opinión, puede visitar doctor.mx/fundadores para más información. Que tenga excelente día.\"\n\n---\nMantén tono profesional, sin prisas, y cierra siempre de forma amable."
  }'

echo ""
echo "✅ Assistant created successfully!"
echo ""

# Make calls to each doctor
for number in "${!DOCTORS[@]}"; do
  name=${DOCTORS[$number]}
  echo "📞 Llamando a $name ($number)..."
  
  curl -X POST "https://api.vapi.ai/call" \
    -H "Authorization: Bearer $VAPI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"to\": \"$number\",
      \"from\": \"$FROM_NUMBER\",
      \"assistantId\": \"$ASSISTANT_ID\",
      \"context\": {
        \"name\": \"$name\",
        \"greeting\": \"Hola $name, le habla el asistente de Doctor.mx\"
      }
    }"
  
  echo ""
  echo "⏳ Waiting 20 seconds before next call..."
  sleep 20
done

echo ""
echo "🎉 All calls completed!"
echo "📋 Check your VAPI dashboard for call logs and results."
