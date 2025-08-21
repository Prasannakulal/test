import type { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const allowedOrigins = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/.*\.netlify\.app$/];

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const origin = event.headers.origin || '';
  if (!allowedOrigins.some((r) => r.test(origin))) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['prasannakulal18@gmail.com'],
      subject: `New message from ${name}`,
      html: `<div style="font-family:system-ui,sans-serif"><h2>New contact message</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-line">${escapeHtml(message)}</p></div>`
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send' }) };
  }
};
