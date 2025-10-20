export async function chatTurn({ message, history = [], intake, userId, images }) {
  const r = await fetch('/.netlify/functions/chat', {
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
  const res = await fetch(`/.netlify/functions/free-questions/${userId}/eligibility`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}