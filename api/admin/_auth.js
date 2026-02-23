import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 86400; // 24 hours

function getSecret() {
  return process.env.ADMIN_SECRET;
}

function sign(timestamp) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(String(timestamp))
    .digest('hex');
}

export function createSession(res) {
  const timestamp = Date.now();
  const token = sign(timestamp);
  const value = `${token}:${timestamp}`;

  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${MAX_AGE}`,
  ]);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0`,
  ]);
}

export function verifySession(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!match) return false;

  const value = match.split('=')[1];
  const [token, timestampStr] = value.split(':');
  const timestamp = Number(timestampStr);

  if (!token || !timestamp || isNaN(timestamp)) return false;

  // Check expiration
  if (Date.now() - timestamp > MAX_AGE * 1000) return false;

  // Verify HMAC
  const expected = sign(timestamp);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
