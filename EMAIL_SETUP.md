# Email Setup Guide for Password Reset

This guide explains how to configure email sending for the password reset functionality.

## 📧 Email Service Configuration

The application uses **Nodemailer** to send password reset emails via SMTP. You can use any SMTP provider like Gmail, Outlook, SendGrid, Mailgun, etc.

## 🔧 Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Email Sender Information
FROM_NAME="Your App Name"
FROM_EMAIL="noreply@yourapp.com"

# App URL (for reset links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📮 Popular SMTP Providers

### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password, not regular password
```

**Setup Steps for Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use the generated 16-character password in `SMTP_PASS`

### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

### Mailgun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-mailgun-smtp-username"
SMTP_PASS="your-mailgun-smtp-password"
```

## 🧪 Testing Email Configuration

You can test your email configuration by creating a simple test endpoint:

```typescript
// pages/api/test-email.ts
import { testEmailConfiguration, sendPasswordResetEmail } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;
    
    // Test configuration
    const configValid = await testEmailConfiguration();
    if (!configValid) {
      return res.status(500).json({ error: 'Email configuration invalid' });
    }
    
    // Send test email
    const emailSent = await sendPasswordResetEmail(email, 'test-token-123');
    
    return res.json({ 
      success: emailSent,
      message: emailSent ? 'Test email sent!' : 'Failed to send email'
    });
  }
}
```

## 🎨 Email Template Features

The password reset email includes:

- **Professional Design**: Gradient header matching your app's theme
- **Clear Call-to-Action**: Prominent "Reset Password" button
- **Security Information**: Token expiration and security warnings
- **Fallback Text**: Plain text version for email clients that don't support HTML
- **Responsive Design**: Works on desktop and mobile email clients

## 🔒 Security Features

- **Token Expiration**: Reset tokens expire after 1 hour
- **Secure Token Generation**: Uses crypto.randomBytes(32) for token generation
- **No Email Enumeration**: Always returns success message regardless of email existence
- **HTTPS Links**: Reset links use HTTPS in production
- **Token Cleanup**: Tokens are cleared after successful password reset

## 🚀 Production Considerations

### 1. Use Professional Email Service
For production, consider using dedicated email services:
- **SendGrid**: Reliable with good deliverability
- **Mailgun**: Developer-friendly with detailed analytics
- **Amazon SES**: Cost-effective for high volume
- **Postmark**: Excellent for transactional emails

### 2. Domain Authentication
- Set up SPF, DKIM, and DMARC records for your domain
- Use a dedicated sending domain (e.g., mail.yourapp.com)
- Verify your domain with your email service provider

### 3. Rate Limiting
Consider implementing rate limiting for password reset requests:

```typescript
// Example rate limiting (implement as needed)
const rateLimiter = new Map();

export async function requestPasswordReset(email: string) {
  const key = `reset:${email}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  if (rateLimiter.has(key)) {
    const { count, resetTime } = rateLimiter.get(key);
    
    if (now < resetTime) {
      if (count >= 3) { // Max 3 requests per 15 minutes
        throw new Error('Too many reset requests. Please try again later.');
      }
      rateLimiter.set(key, { count: count + 1, resetTime });
    } else {
      rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
    }
  } else {
    rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
  }
  
  // Continue with reset logic...
}
```

### 4. Monitoring
- Monitor email delivery rates
- Set up alerts for failed email sends
- Track password reset completion rates

## 🐛 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check username/password
   - For Gmail, ensure you're using an App Password
   - Verify 2FA is enabled for Gmail

2. **"Connection timeout"**
   - Check SMTP host and port
   - Verify firewall settings
   - Try different ports (25, 465, 587)

3. **"Self-signed certificate"**
   - Set `SMTP_SECURE="false"` for port 587
   - Set `SMTP_SECURE="true"` for port 465

4. **Emails going to spam**
   - Set up proper SPF/DKIM records
   - Use a reputable email service
   - Include unsubscribe links
   - Avoid spam trigger words

### Debug Mode:
Enable debug logging by adding to your email configuration:

```typescript
const transporter = nodemailer.createTransport({
  // ... your config
  debug: true, // Enable debug output
  logger: true // Log to console
});
```

## 📝 Email Content Customization

You can customize the email template in `src/lib/email.ts`:

- Update the HTML template in `getPasswordResetEmailTemplate()`
- Modify colors, fonts, and styling
- Add your company logo
- Change the email copy and messaging
- Add additional security information

## 🔄 Alternative Email Services

If you prefer not to use SMTP, you can replace the email service with:

- **Resend**: Modern email API
- **Postmark**: Transactional email service  
- **SendGrid Web API**: Instead of SMTP
- **Mailgun API**: RESTful email API

Simply update the `sendPasswordResetEmail` function in `src/lib/email.ts` to use your preferred service's API.