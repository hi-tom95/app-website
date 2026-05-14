import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body ?? {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  const { error } = await resend.emails.send({
    from: 'walkboy waitlist <onboarding@resend.dev>',
    to: process.env.NOTIFY_EMAIL,
    reply_to: email,
    subject: `New waitlist signup: ${email}`,
    html: `<p>New walkboy waitlist signup:</p><p><strong>${email}</strong></p>`,
  })

  if (error) {
    console.error('Resend error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }

  return res.status(200).json({ ok: true })
}
