# SocialSpark Payment API Backend

A comprehensive payment processing backend for the SocialSpark e-commerce platform, supporting both Stripe and PayPal payment providers.

## 🚀 Features

- **Multi-Provider Support**: Stripe and PayPal integration
- **Secure Authentication**: JWT-based authentication with Supabase
- **Order Management**: Complete order lifecycle management
- **Payment Methods**: Save and manage payment methods
- **Webhook Handling**: Real-time payment notifications
- **Rate Limiting**: API rate limiting for security
- **Comprehensive Logging**: Payment event logging and monitoring
- **Docker Support**: Containerized deployment
- **Health Checks**: Built-in health monitoring

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Stripe account (for Stripe payments)
- PayPal account (for PayPal payments)
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com
```

### 3. Database Setup

Run the payment schema SQL in your Supabase SQL editor:

```sql
-- Execute the contents of database/payment_schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 🐳 Docker Deployment

### Local Development with Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or run in background
docker-compose up -d
```

### Production Deployment

```bash
# Build the image
docker build -t socialspark-payment-api .

# Run the container
docker run -p 3001:3001 --env-file .env socialspark-payment-api
```

## 📚 API Documentation

### Authentication

All API endpoints (except webhooks) require authentication via Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Stripe Endpoints

#### Create Payment Intent
```http
POST /api/stripe/create-payment-intent
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "usd",
  "metadata": {
    "order_id": "uuid-here"
  }
}
```

#### Confirm Payment
```http
POST /api/stripe/confirm-payment
Content-Type: application/json

{
  "payment_intent_id": "pi_xxx",
  "payment_method_id": "pm_xxx"
}
```

#### Get Payment Methods
```http
GET /api/stripe/payment-methods
```

#### Save Payment Method
```http
POST /api/stripe/save-payment-method
Content-Type: application/json

{
  "payment_method_id": "pm_xxx",
  "type": "card"
}
```

### PayPal Endpoints

#### Create Order
```http
POST /api/paypal/create-order
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "USD",
  "items": [
    {
      "name": "Product Name",
      "quantity": "1",
      "unit_amount": {
        "currency_code": "USD",
        "value": "99.99"
      }
    }
  ]
}
```

#### Capture Payment
```http
POST /api/paypal/capture-payment
Content-Type: application/json

{
  "order_id": "PAYPAL_ORDER_ID"
}
```

### Orders Endpoints

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 49.99
    }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "subtotal": 99.98,
  "tax": 8.99,
  "shipping_cost": 5.99,
  "total": 114.96,
  "payment_provider": "stripe"
}
```

#### Get Orders
```http
GET /api/orders?page=1&limit=10&status=all
```

#### Get Order Details
```http
GET /api/orders/{order_id}
```

#### Update Order Status
```http
PATCH /api/orders/{order_id}/status
Content-Type: application/json

{
  "status": "processing"
}
```

### Webhooks

#### Stripe Webhook
```http
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: <signature>
```

#### PayPal Webhook
```http
POST /api/webhooks/paypal
Content-Type: application/json

{
  "type": "PAYMENT.CAPTURE.COMPLETED",
  "data": { ... }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes (for Stripe) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes (for Stripe) |
| `PAYPAL_CLIENT_ID` | PayPal client ID | Yes (for PayPal) |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | Yes (for PayPal) |
| `PAYPAL_MODE` | PayPal environment | No (default: sandbox) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CORS_ORIGIN` | Allowed CORS origins | No |

### Rate Limiting

The API includes rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Headers**: Standard rate limit headers included

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Test payment intent creation
curl -X POST http://localhost:3001/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 10.00, "currency": "usd"}'
```

## 📊 Monitoring

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### Logging

The API logs all payment events to the `payment_events` table for monitoring and debugging.

## 🔒 Security

- **HTTPS Required**: All production deployments must use HTTPS
- **CORS Protection**: Configured CORS origins
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive request validation
- **Authentication**: JWT-based authentication
- **Webhook Verification**: Stripe signature verification
- **Row Level Security**: Database-level security policies

## 🚀 Production Deployment

### 1. Environment Setup

Ensure all environment variables are properly configured for production.

### 2. SSL Certificate

Obtain and configure SSL certificates for HTTPS.

### 3. Webhook Configuration

Configure webhook endpoints in your Stripe and PayPal dashboards:

- **Stripe**: `https://your-domain.com/api/webhooks/stripe`
- **PayPal**: `https://your-domain.com/api/webhooks/paypal`

### 4. Database Migration

Run the payment schema in your production Supabase instance.

### 5. Deployment

Use your preferred deployment platform (Heroku, AWS, Google Cloud, etc.):

```bash
# Example: Heroku deployment
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Check your `CORS_ORIGIN` configuration
2. **Authentication Errors**: Verify your JWT token and Supabase configuration
3. **Payment Failures**: Check your Stripe/PayPal credentials and webhook configuration
4. **Database Errors**: Ensure the payment schema is properly installed

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and check the console output.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This is a production-ready payment API. Always test thoroughly in sandbox environments before going live with real payments. 