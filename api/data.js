// Save this file as /api/data.js in your Vercel project.
//
// Requires two environment variables, set in Vercel: Project Settings -> Environment Variables
//   UPSTASH_REDIS_REST_URL     (from your Upstash Redis database)
//   UPSTASH_REDIS_REST_TOKEN   (from your Upstash Redis database)
//
// No passcode required — anyone with your site's web address can view and edit
// the data. Fine for a personal, low-stakes list; if you ever want it locked
// down again, say so and I'll add the passcode back.

const DATA_KEY = 'neighborhood-map-data';

export default async function handler(req, res) {
  const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(500).json({ error: 'Redis environment variables are not configured' });
  }

  if (req.method === 'GET') {
    const r = await fetch(`${REDIS_URL}/get/${DATA_KEY}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const json = await r.json();
    return res.status(200).json({ value: json.result || null });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const value = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);
    const r = await fetch(`${REDIS_URL}/set/${DATA_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'text/plain'
      },
      body: value
    });
    const json = await r.json();
    return res.status(200).json({ ok: json.result === 'OK' });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
