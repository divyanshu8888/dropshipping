import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }): Promise<void> {
  const from = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'noreply@unitiv.com';
  await transporter.sendMail({
    from: `"Unitiv" <${from}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const from = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'noreply@uniti.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  await transporter.sendMail({
    from: `"Unitiv" <${from}>`,
    to,
    subject: 'Reset your Unitiv password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#0B0C0F;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0C0F;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width:520px;background:#101218;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
                      <span style="font-size:22px;font-weight:700;background:linear-gradient(90deg,#6EE7F9,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                        Unitiv
                      </span>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:36px 40px;">
                      <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#EDEFF5;">
                        Reset your password
                      </h1>
                      <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#8A90A2;">
                        We received a request to reset the password for your Unitiv account. Click the button below to choose a new password. This link expires in <strong style="color:#B6BAC8;">1 hour</strong>.
                      </p>
                      <a href="${resetUrl}"
                        style="display:inline-block;padding:14px 32px;background:linear-gradient(90deg,#00C6FF,#7D2AE8);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;">
                        Reset password
                      </a>
                      <p style="margin:28px 0 0;font-size:13px;color:#8A90A2;">
                        If you didn't request this, you can safely ignore this email — your password won't change.
                      </p>
                      <p style="margin:16px 0 0;font-size:12px;color:#8A90A2;">
                        Or paste this link into your browser:<br/>
                        <a href="${resetUrl}" style="color:#6EE7F9;word-break:break-all;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.08);">
                      <p style="margin:0;font-size:12px;color:#8A90A2;">
                        © ${new Date().getFullYear()} Unitiv. All rights reserved.<br/>
                        <a href="${siteUrl}" style="color:#6EE7F9;">uniti.com.au</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Reset your Unitiv password\n\nClick the link below to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  });
}
