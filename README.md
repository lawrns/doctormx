# Doctor MX - Platform for Medical Professionals

Doctor MX is a comprehensive platform built for medical professionals in Mexico to manage their practice, patients, and telemedicine services. This platform provides a full suite of tools to streamline the administrative aspects of running a medical practice while improving patient care.

## Features

### For Doctors

- **Dashboard:** Quick overview of appointments, patients, and revenue
- **Patient Management:** Comprehensive system for managing patient records
- **Appointment Scheduling:** Flexible scheduling system for in-person and telemedicine visits
- **Digital Prescriptions:** Create, manage and share digital prescriptions with patients
- **Telemedicine:** Built-in video consultation system with virtual waiting room
- **Medical Records:** Detailed patient records with medical history, notes, and documents
- **Community:** Medical professional network for case discussions and knowledge sharing
- **Analytics:** Insights on practice performance, patient demographics, and financial metrics
- **Brand Management:** Customization of the doctor's professional online presence

### Technical Features

- React-based frontend with TypeScript
- Responsive design that works on desktop and mobile devices
- Secure authentication and protected routes
- Integration with Supabase for backend
- Real-time updates for waiting room and notifications
- Integration with external services like Doctoralia
- Customizable UI with themes and branding options

## Project Structure

```
/src
  /components
    /doctor - Components specific to doctor dashboard
    /ui - Reusable UI components
  /contexts
    AuthContext.tsx - Authentication context
  /lib
    supabase.ts - Supabase client configuration
  /pages
    /doctor - Doctor dashboard pages
    /auth - Authentication pages
  /routes
    DoctorRoutes.tsx - Routes for doctor dashboard
  /styles - Global CSS styles
```

## Main Pages

- `/doctor-dashboard` - Main dashboard view
- `/doctor-dashboard/patients` - Patient management
- `/doctor-dashboard/appointments` - Appointment scheduling
- `/doctor-dashboard/prescriptions` - Digital prescription system
- `/doctor-dashboard/telemedicine` - Telemedicine platform
- `/doctor-dashboard/analytics` - Practice analytics
- `/doctor-dashboard/community` - Medical community platform
- `/doctor-dashboard/settings` - Profile and branding settings

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/doctormx.git
cd doctormx
```

2. Install dependencies
```
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
# (Optional) Override default doctor instructions:
# VITE_DOCTOR_INSTRUCTIONS=Eres un médico virtual compasivo y profesional. Tu objetivo es ayudar a los pacientes a entender sus síntomas y brindarles orientación médica preliminar.
# (Optional) Enable or disable image analysis:
# VITE_DOCTOR_IMAGE_ANALYSIS_ENABLED=true
```

4. Start the development server
```
# To run only the frontend (no serverless functions; AI Doctor features disabled):
npm run dev
# or
yarn dev
```

To run the full app (with serverless functions for `/api/v1/*` routes):
Install the Netlify CLI if you haven't already:
```
npm install -g netlify-cli
netlify dev
```

5. Open the URL shown in the Netlify CLI output (usually `http://localhost:8888`) in your browser

### Supabase Storage Setup

- In your Supabase dashboard, create a new **Storage** bucket named `medical-images` (or update the bucket name in your code).
- Set the bucket's permissions to **public** so that uploaded images can be accessed by the AI analysis function.

## Netlify Deployment & Functions

This project is pre-configured to deploy on Netlify, with serverless functions to proxy OpenAI API calls securely.

- Ensure you set the following environment variables in your Netlify dashboard:
  - `OPENAI_API_KEY` (server-side) for calling OpenAI from Functions
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_OPENAI_API_KEY`, etc.

## Technology Stack

- **Frontend Framework:** React with TypeScript
- **Styling:** TailwindCSS
- **Backend/Database:** Supabase (PostgreSQL)
- **State Management:** React Context API
- **Routing:** React Router
- **Authentication:** Supabase Auth
- **Video Conferencing:** WebRTC
- **Form Handling:** React Hook Form
- **Charts and Visualizations:** Recharts
- **Build Tool:** Vite

## Future Roadmap

- Mobile app versions for iOS and Android
- Electronic Medical Records (EMR) integration
- Advanced analytics with AI-driven insights
- Patient portal
- Online payment processing
- Medical inventory management
- Enhanced telemedicine features

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
