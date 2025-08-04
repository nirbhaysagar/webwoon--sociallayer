# SocialSpark Payment API - Production Deployment Guide

This guide provides comprehensive instructions for deploying the SocialSpark Payment API backend to production environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Payment Provider Setup](#payment-provider-setup)
5. [SSL Certificate Configuration](#ssl-certificate-configuration)
6. [Webhook Configuration](#webhook-configuration)
7. [Deployment Options](#deployment-options)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

### Required Accounts
- **Supabase Account**: For database and authentication
- **Stripe Account**: For Stripe payment processing
- **PayPal Account**: For PayPal payment processing
- **Domain Name**: For SSL certificates and webhooks
- **Hosting Provider**: AWS, Google Cloud, Heroku, etc.

### Required Software
- Node.js 18+
- Docker (for containerized deployment)
- Git
- SSL certificate management tools

## 🔧 Environment Setup

### 1. Clone and Configure Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your production values:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (Production)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# PayPal Configuration (Production)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Security Configuration
JWT_SECRET=your_very_secure_jwt_secret_key
CORS_ORIGIN=https://your-frontend-domain.com

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 3. Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate other secrets as needed
openssl rand -hex 32
```

## 🗄️ Database Configuration

### 1. Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run Database Schema**:
   - Open Supabase SQL Editor
   - Execute the contents of `backend/database/payment_schema.sql`
   - Verify tables are created successfully

3. **Configure Row Level Security**:
   - Ensure RLS policies are active
   - Test with a sample user

### 2. Database Verification

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payment_methods', 'payment_events');

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'payment_methods', 'payment_events');
```

## 💳 Payment Provider Setup

### 1. Stripe Configuration

#### Development Setup
1. **Create Stripe Account**:
   - Sign up at [stripe.com](https://stripe.com)
   - Complete account verification

2. **Get API Keys**:
   - Dashboard → Developers → API Keys
   - Copy publishable and secret keys
   - Use test keys for development

3. **Configure Webhooks**:
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_method.attached`, `payment_method.detached`, `charge.refunded`

#### Production Setup
1. **Switch to Live Mode**:
   - Toggle to live mode in Stripe dashboard
   - Update API keys to live keys
   - Update webhook endpoints to production URLs

2. **Verify Webhook Signatures**:
   - Copy webhook signing secret
   - Ensure signature verification is working

### 2. PayPal Configuration

#### Development Setup
1. **Create PayPal Developer Account**:
   - Sign up at [developer.paypal.com](https://developer.paypal.com)
   - Create a sandbox account

2. **Get API Credentials**:
   - Dashboard → My Apps & Credentials
   - Create a new app
   - Copy Client ID and Secret

3. **Configure Webhooks**:
   - Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/paypal`
   - Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`

#### Production Setup
1. **Switch to Live Environment**:
   - Update environment to live
   - Update API credentials to production
   - Update webhook endpoints

2. **Verify Webhook Configuration**:
   - Test webhook delivery
   - Verify event handling

## 🔒 SSL Certificate Configuration

### 1. Obtain SSL Certificate

#### Option A: Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificate files location:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

#### Option B: Commercial Certificate
- Purchase from certificate authority
- Download certificate files
- Configure with your hosting provider

### 2. Configure SSL in Application

Update your server configuration to use SSL:

```javascript
// In server.js or deployment config
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/private.key'),
  cert: fs.readFileSync('/path/to/certificate.crt')
};

https.createServer(options, app).listen(443);
```

## 🔗 Webhook Configuration

### 1. Stripe Webhooks

#### Production Endpoint
```
https://your-domain.com/api/webhooks/stripe
```

#### Required Events
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_method.attached`
- `payment_method.detached`
- `charge.refunded`

#### Verification
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

### 2. PayPal Webhooks

#### Production Endpoint
```
https://your-domain.com/api/webhooks/paypal
```

#### Required Events
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `CHECKOUT.ORDER.APPROVED`

#### Verification
- Use PayPal webhook simulator
- Check webhook delivery logs

## 🚀 Deployment Options

### Option 1: Docker Deployment

#### Local Docker Setup
```bash
# Build and run with Docker Compose
cd backend
docker-compose up --build -d

# Check logs
docker-compose logs -f

# Stop application
docker-compose down
```

#### Production Docker Deployment
```bash
# Build production image
docker build -t socialspark-payment-api:latest .

# Run with SSL
docker run -d \
  --name payment-api \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  --env-file .env \
  socialspark-payment-api:latest
```

### Option 2: Heroku Deployment

#### Setup Heroku
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create app
heroku create your-payment-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_supabase_url
# ... set all other environment variables

# Deploy
git push heroku main
```

### Option 3: AWS Deployment

#### Using AWS ECS
1. **Create ECR Repository**:
   ```bash
   aws ecr create-repository --repository-name socialspark-payment-api
   ```

2. **Build and Push Image**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   docker tag socialspark-payment-api:latest your-account.dkr.ecr.us-east-1.amazonaws.com/socialspark-payment-api:latest
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/socialspark-payment-api:latest
   ```

3. **Create ECS Service**:
   - Use AWS Console or CLI
   - Configure load balancer
   - Set up SSL certificate

### Option 4: Google Cloud Deployment

#### Using Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/payment-api
gcloud run deploy payment-api \
  --image gcr.io/your-project/payment-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

#### Health Checks
```bash
# Test health endpoint
curl https://your-domain.com/health

# Expected response
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

#### Log Monitoring
```bash
# View application logs
docker-compose logs -f payment-api

# Or if using systemd
journalctl -u payment-api -f
```

### 2. Payment Monitoring

#### Stripe Dashboard
- Monitor payments in Stripe Dashboard
- Check webhook delivery logs
- Review failed payments

#### PayPal Dashboard
- Monitor transactions in PayPal Dashboard
- Check webhook delivery status
- Review payment disputes

### 3. Database Monitoring

#### Supabase Monitoring
- Monitor database performance
- Check query execution times
- Review error logs

## 🔐 Security Best Practices

### 1. Environment Security
- ✅ Use strong, unique secrets
- ✅ Rotate secrets regularly
- ✅ Never commit secrets to version control
- ✅ Use environment-specific configurations

### 2. Network Security
- ✅ Enable HTTPS only
- ✅ Configure proper CORS origins
- ✅ Use rate limiting
- ✅ Implement request validation

### 3. Payment Security
- ✅ Verify webhook signatures
- ✅ Use PCI-compliant payment providers
- ✅ Implement proper error handling
- ✅ Log security events

### 4. Database Security
- ✅ Enable Row Level Security (RLS)
- ✅ Use parameterized queries
- ✅ Implement proper access controls
- ✅ Regular security audits

## 🐛 Troubleshooting

### Common Issues

#### 1. Webhook Failures
```bash
# Check webhook logs
docker-compose logs payment-api | grep webhook

# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### 2. Database Connection Issues
```bash
# Test database connection
node -e "
const { supabase } = require('./services/supabase');
supabase.from('orders').select('count').then(console.log);
"
```

#### 3. Payment Processing Errors
```bash
# Check payment provider logs
# Stripe: Dashboard → Logs
# PayPal: Dashboard → Activity
```

#### 4. SSL Certificate Issues
```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check certificate expiration
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Debug Mode

Enable debug logging for troubleshooting:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### Performance Issues

#### Database Optimization
```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Application Optimization
- Monitor memory usage
- Check CPU utilization
- Review API response times
- Optimize database queries

## 📞 Support

### Getting Help

1. **Check Logs**: Review application and payment provider logs
2. **Test Endpoints**: Use provided test scripts
3. **Documentation**: Refer to API documentation
4. **Community**: Check GitHub issues and discussions

### Emergency Contacts

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **PayPal Support**: [paypal.com/support](https://paypal.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)

---

**Important**: Always test thoroughly in sandbox environments before going live with real payments. Monitor your application closely after deployment and be prepared to rollback if issues arise. 