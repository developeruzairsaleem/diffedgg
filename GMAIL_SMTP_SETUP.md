# Gmail SMTP Configuration Guide

This guide explains how to obtain and configure Gmail SMTP credentials for your application's email functionality.

## Important Security Note

**⚠️ NEVER use your actual Gmail password in SMTP_PASS!** You must use an "App Password" instead.

## Step-by-Step Setup

### 1. Enable 2-Factor Authentication (Required)

Before you can create an App Password, you must enable 2-Factor Authentication on your Gmail account:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Follow the setup process to enable 2FA using your phone number
4. Complete the verification process

### 2. Generate an App Password

Once 2FA is enabled:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Scroll down and click on "App passwords"
4. You may need to sign in again
5. Select "Mail" from the dropdown
6. Select "Other (Custom name)" and enter a name like "My Gaming Platform"
7. Click "Generate"
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
9. Use this App Password as your `SMTP_PASS` value

### 3. Configure Your Environment Variables

Add these to your `.env` file:

```env
# Gmail SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
```

### 4. Example Configuration

Replace with your actual details:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="shabirmuhammadkhan62@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"  # This should be your App Password, not your Gmail password
```

## Alternative Email Providers

If you prefer not to use Gmail, here are other options:

### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

### Yahoo Mail
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@yahoo.com"
SMTP_PASS="your-app-password"
```

### Professional Email Services

For production applications, consider using dedicated email services:

#### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

#### Mailgun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-mailgun-username"
SMTP_PASS="your-mailgun-password"
```

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**
   - Make sure you're using an App Password, not your Gmail password
   - Verify 2FA is enabled on your Google account

2. **"Less secure app access" error**
   - This is outdated - use App Passwords instead
   - Google no longer supports "less secure apps"

3. **Connection timeout**
   - Check your firewall settings
   - Verify the SMTP_HOST and SMTP_PORT are correct

4. **Authentication failed**
   - Double-check your SMTP_USER (email address)
   - Regenerate your App Password if needed

### Testing Your Configuration

You can test your SMTP configuration by:

1. Adding the credentials to your `.env` file
2. Running your application
3. Triggering a password reset email
4. Checking if the email is sent successfully

## Security Best Practices

1. **Never commit SMTP credentials to version control**
2. **Use App Passwords instead of account passwords**
3. **Consider using dedicated email services for production**
4. **Regularly rotate your App Passwords**
5. **Monitor your email sending for suspicious activity**

## Production Recommendations

For production applications, consider:

- **SendGrid**: Free tier with 100 emails/day
- **Mailgun**: Free tier with 5,000 emails/month
- **Amazon SES**: Pay-as-you-go pricing
- **Postmark**: Reliable transactional email service

These services provide better deliverability, analytics, and are designed for application email sending.