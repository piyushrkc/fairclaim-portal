import nodemailer from 'nodemailer';

export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Fair Claim Support" <${process.env.NEXT_PUBLIC_EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}