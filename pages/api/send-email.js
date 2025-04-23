// pages/api/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { to, subject, html } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Fair Claim Solutions <claims@fairclaim.in>',
      to,
      subject,
      html,
    });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: 'Email sent successfully', data });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', details: err.message });
  }
}