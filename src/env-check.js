// Simple environment variable check that runs at build time
const missingEnvVars = [];

if (!import.meta.env.VITE_SUPABASE_URL) {
  missingEnvVars.push('VITE_SUPABASE_URL');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  missingEnvVars.push('VITE_SUPABASE_ANON_KEY');
}

if (missingEnvVars.length > 0) {
  console.warn(
    '⚠️ Missing environment variables: ' + missingEnvVars.join(', ') + 
    '. Make sure these are set in your Netlify environment settings.'
  );
}
