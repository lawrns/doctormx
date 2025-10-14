export async function chatTurn({ message, history = [], intake }) {
  const r = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, intake })
  });
  if (!r.ok) throw new Error('API error');
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