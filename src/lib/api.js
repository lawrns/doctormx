export async function chatTurn({ message, history = [], intake, userId, images }) {
  // Use local API for development, Netlify functions for production
  const isLocal = window.location.hostname === 'localhost';
  const endpoint = isLocal ? '/api/chat' : '/.netlify/functions/chat';
  
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, intake, userId, images })
  });
  if (!r.ok) {
    const error = new Error('API error');
    error.status = r.status;
    throw error;
  }
  return r.json();
}

export async function findSpecialists({ specialty, city, lat, lon, radius }) {
  const res = await fetch('/api/specialists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ specialty, city, lat, lon, radius })
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function checkFreeQuestionsEligibility(userId) {
  // Use local API for development, Netlify functions for production
  const isLocal = window.location.hostname === 'localhost';
  const endpoint = isLocal 
    ? `/api/free-questions/${userId}/eligibility` 
    : `/.netlify/functions/free-questions/${userId}/eligibility`;
    
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}