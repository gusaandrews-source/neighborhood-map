// Save this file as /api/geocode.js in your Vercel project (alongside your existing
// /api/data.js file — same "api" folder, just a second file in it).
//
// Looks up the approximate GPS coordinates for a street address using OpenStreetMap's
// free lookup service. No API key or setup required. Used automatically by the site
// whenever you add a place or stop with an address, so distance-to-stop can be shown.

export default async function handler(req, res) {
  const address = (req.query.address || '').toString().trim();
  if (!address) {
    return res.status(400).json({ error: 'address is required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'personal-neighborhood-map-app (personal use)' }
    });
    const results = await r.json();
    if (Array.isArray(results) && results.length > 0) {
      return res.status(200).json({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
    }
    return res.status(200).json({ lat: null, lng: null });
  } catch (e) {
    return res.status(500).json({ error: 'lookup failed' });
  }
}
