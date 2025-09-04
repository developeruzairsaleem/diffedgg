# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Configuration (SMTP)
# For Gmail, use: smtp.gmail.com, port 587, secure=false
# For Outlook/Hotmail, use: smtp-mail.outlook.com, port 587, secure=false
# For custom SMTP servers, adjust accordingly
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password-or-password"

# Email Sender Information
FROM_NAME="Your App Name"
FROM_EMAIL="noreply@yourapp.com"

# Stripe (if using)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# PayPal (if using)
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"