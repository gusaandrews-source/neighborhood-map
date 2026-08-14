// Save this file as /api/data.js in your Vercel project.
//
// Works automatically with the environment variables Vercel creates when you add
// an Upstash Redis database from the Storage tab — no manual setup needed.
//
// Stores data under a "key" passed in the URL (?key=...), so different pieces of
// data (your real list vs. a background health-check) never overwrite each other.
//
// No passcode required — anyone with your site's web address can view and edit
// the data. Fine for a personal, low-stakes list; if you ever want it locked
// down again, say so and I'll add the passcode back.

export default async function handler(req, res) {
  const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(500).json({ error: 'Redis environment variables are not configured' });
  }

  const rawKey = (req.query.key || 'default').toString();
  const safeKey = rawKey.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100) || 'default';
  const redisKey = `app:${safeKey}`;

  if (req.method === 'GET') {
    const r = await fetch(`${REDIS_URL}/get/${redisKey}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const json = await r.json();
    return res.status(200).json({ value: json.result || null });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const value = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);
    const r = await fetch(`${REDIS_URL}/set/${redisKey}`, {
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
