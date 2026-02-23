import { createSession } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};

  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: '密碼錯誤' });
  }

  createSession(res);
  return res.status(200).json({ ok: true });
}
