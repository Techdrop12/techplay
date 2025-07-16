import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // à adapter à ton fournisseur
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: `"TechPlay" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  })
}
