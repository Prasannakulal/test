import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const allowedOrigins = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/[\w.-]+-vercel\.app$/];

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
	const origin = req.headers.origin || '';
	if (!allowedOrigins.some((r) => r.test(origin))) {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const { name, email, message } = req.body || {};
	if (!name || !email || !message) {
		return res.status(400).json({ error: 'Missing fields' });
	}

	try {
		const resend = new Resend(process.env.RESEND_API_KEY);
		await resend.emails.send({
			from: 'Portfolio <onboarding@resend.dev>',
			to: ['prasannakulal18@gmail.com'],
			subject: `New message from ${name}`,
			html: `<div style="font-family:system-ui,sans-serif"><h2>New contact message</h2><p><strong>Name:</strong> ${escapeHtml(
				name
			)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-line">${escapeHtml(message)}</p></div>`,
		});
		return res.status(200).json({ ok: true });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to send' });
	}
}

function escapeHtml(input: string) {
	return input
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}
