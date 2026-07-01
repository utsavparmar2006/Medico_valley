import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: any[];
}

export const sendEmail = async (options: EmailOptions) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || '"Medico Valley" <no-reply@medicovalley.com>';

  // Check if SMTP is configured. If not, log to console so the app doesn't crash.
  if (!user || !pass) {
    console.log('\n--- ✉️ [SMTP MAIL DRY-RUN] ---');
    console.log(`From:     ${from}`);
    console.log(`To:       ${options.to}`);
    if (options.replyTo) {
      console.log(`Reply-To: ${options.replyTo}`);
    }
    console.log(`Subject:  ${options.subject}`);
    console.log(`Text Body:\n${options.text}`);
    if (options.html) {
      console.log('HTML Body is present (rendered visually in client email)');
    }
    console.log('-------------------------------\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });
    console.log(`📬 Email successfully sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error);
    throw error;
  }
};
