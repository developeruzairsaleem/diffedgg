import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransport(config);
};

// Email template for password reset
const getPasswordResetEmailTemplate = (resetUrl: string, userEmail: string) => {
  return {
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8fafc;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            opacity: 0.9;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset the password for your account associated with <strong>${userEmail}</strong>.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>For security reasons, never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If you're having trouble clicking the button, you can also copy and paste the URL directly into your browser.</p>
        </div>
        <div class="footer">
          <p>This email was sent from an automated system. Please do not reply to this email.</p>
          <p>If you need help, please contact our support team.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Your Password
      
      Hello,
      
      We received a request to reset the password for your account associated with ${userEmail}.
      
      Please click the following link to reset your password:
      ${resetUrl}
      
      Important:
      - This link will expire in 1 hour
      - If you didn't request this password reset, please ignore this email
      - For security reasons, never share this link with anyone
      
      If you're having trouble with the link, you can copy and paste it directly into your browser.
      
      This email was sent from an automated system. Please do not reply to this email.
    `
  };
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Verify SMTP connection configuration
    await transporter.verify();
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const emailTemplate = getPasswordResetEmailTemplate(resetUrl, email);
    
    const mailOptions = {
      from: {
        name: process.env.FROM_NAME || 'Gaming Platform',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER || '',
      },
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};