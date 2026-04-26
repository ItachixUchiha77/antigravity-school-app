import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTeacherCredentials({ to, name, password, loginUrl }) {
  const subject = 'Your DoubtFix Teacher Account is Ready';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0f1117; color:#e2e8f0; margin:0; padding:0; }
    .wrapper { max-width:560px; margin:40px auto; }
    .card { background:#1a1d27; border:1px solid #2a2d3e; border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#3b82f6,#a855f7); padding:32px; text-align:center; }
    .header h1 { margin:0; font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
    .header p { margin:6px 0 0; font-size:13px; color:rgba(255,255,255,0.75); }
    .body { padding:28px 32px; }
    .body p { margin:0 0 16px; font-size:14px; line-height:1.6; color:#94a3b8; }
    .body p strong { color:#e2e8f0; }
    .creds { background:#0f1117; border:1px solid #2a2d3e; border-radius:12px; padding:20px 24px; margin:20px 0; }
    .cred-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #2a2d3e; }
    .cred-row:last-child { border-bottom:none; }
    .cred-label { font-size:12px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
    .cred-value { font-size:13px; color:#e2e8f0; font-weight:600; font-family:monospace; }
    .btn { display:inline-block; background:linear-gradient(135deg,#3b82f6,#a855f7); color:#fff; text-decoration:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:700; margin:8px 0; }
    .footer { padding:16px 32px; border-top:1px solid #2a2d3e; text-align:center; font-size:11px; color:#475569; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>🎭 DoubtFix</h1>
        <p>School Q&amp;A Platform</p>
      </div>
      <div class="body">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your teacher account has been created. Use the credentials below to log in for the first time. Please change your password after signing in.</p>
        <div class="creds">
          <div class="cred-row">
            <span class="cred-label">Username (Email)</span>
            <span class="cred-value">${to}</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Temporary Password</span>
            <span class="cred-value">${password}</span>
          </div>
        </div>
        <p style="text-align:center">
          <a href="${loginUrl}" class="btn">Log in to DoubtFix →</a>
        </p>
        <p style="font-size:12px;color:#475569;">If you weren't expecting this email, you can ignore it.</p>
      </div>
      <div class="footer">Sent by DoubtFix · School Administration Platform</div>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"DoubtFix" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
