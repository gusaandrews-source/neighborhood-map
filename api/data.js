// Save this file as /api/data.js in your Vercel project (create an /api folder at the
// project root if it doesn't exist yet).
//
// Requires three environment variables, set in Vercel: Project Settings -> Environment Variables
//   UPSTASH_REDIS_REST_URL     (from your Upstash Redis database)
//   UPSTASH_REDIS_REST_TOKEN   (from your Upstash Redis database)
//   APP_SECRET                 (a passcode you make up yourself, e.g. a random word/phrase)
//
// The APP_SECRET is what the passcode prompt on the site checks against — it's a simple
// gate so random visitors can't read or overwrite your data. It is NOT sent to Upstash;
// it only guards this API route.

const DATA_KEY = 'neighborhood-map-data';

export default async function handler(req, res) {
  const key = req.headers['x-app-key'];
  if (!key || key !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

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
