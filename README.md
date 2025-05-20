# DoctorMX - AI Doctor Platform

This project provides an AI-powered medical assistant interface to help users evaluate their health conditions. It's focused on delivering a streamlined experience with the core features of the platform.

## Core Features

1. **Homepage**: Welcoming interface with Dr. Simeon and key features
2. **AI Doctor Interface**: Interactive chat interface for medical consultations
3. **Onboarding Wizard**: Step-based user onboarding flow
4. **Connect**: Doctor recruitment and registration system

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **State Management**: XState, React Context API
- **API**: Supabase, OpenAI
- **Deployment**: Netlify with serverless functions

## Project Structure

The project has been streamlined to contain only the core components:

```
/src
  /components         # Reusable UI components
  /core               # Core application components
  /contexts           # React context providers
  /features
    /ai-doctor        # AI doctor components
  /lib                # Helper libraries
  /pages              # Main pages
    /wizard           # Onboarding steps
  /services
    /ai               # AI services
  /utils              # Utility functions
/public               # Static assets
/netlify/functions    # Serverless functions
```

## Environment Variables

The app requires the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Netlify Deployment

This project is designed to deploy on Netlify with the following configuration:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

API routes are automatically mapped through Netlify redirects to the appropriate serverless functions.