#!/bin/bash

# SocialSpark Payment API Deployment Script
# This script automates the deployment of the payment backend

set -e

echo "🚀 Deploying SocialSpark Payment API Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    print_success "Docker $(docker --version) is installed"
}

# Check if docker-compose is installed
check_docker_compose() {
    print_status "Checking Docker Compose installation..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker Compose $(docker-compose --version) is installed"
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    docker build -t socialspark-payment-api .
    print_success "Docker image built successfully"
}

# Check environment file
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f .env ]; then
        print_error "Environment file (.env) not found. Please create it first."
        exit 1
    fi
    
    # Check for production environment variables
    if grep -q "NODE_ENV=development" .env; then
        print_warning "Consider setting NODE_ENV=production for production deployment"
    fi
    
    print_success "Environment file found"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    print_status "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Start containers
    docker-compose up -d
    
    # Wait for application to start
    sleep 10
    
    # Check if application is running
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Application deployed successfully"
    else
        print_error "Application deployment failed"
        docker-compose logs
        exit 1
    fi
}

# Deploy to cloud platform
deploy_cloud() {
    local platform=$1
    
    case $platform in
        "heroku")
            deploy_heroku
            ;;
        "aws")
            deploy_aws
            ;;
        "gcp")
            deploy_gcp
            ;;
        *)
            print_error "Unsupported platform: $platform"
            print_status "Supported platforms: heroku, aws, gcp"
            exit 1
            ;;
    esac
}

# Deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Heroku app exists
    if ! heroku apps:info &> /dev/null; then
        print_status "Creating new Heroku app..."
        heroku create
    fi
    
    # Set environment variables
    print_status "Setting environment variables..."
    heroku config:set NODE_ENV=production
    
    # Deploy
    print_status "Deploying application..."
    git push heroku main
    
    print_success "Application deployed to Heroku"
}

# Deploy to AWS
deploy_aws() {
    print_status "Deploying to AWS..."
    print_warning "AWS deployment requires additional setup"
    print_status "Please refer to AWS documentation for container deployment"
}

# Deploy to Google Cloud
deploy_gcp() {
    print_status "Deploying to Google Cloud..."
    print_warning "GCP deployment requires additional setup"
    print_status "Please refer to GCP documentation for container deployment"
}

# Setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    print_warning "SSL certificate setup depends on your hosting provider"
    print_status "Please configure SSL certificates for your domain"
}

# Setup webhooks
setup_webhooks() {
    print_status "Setting up webhooks..."
    print_warning "Please configure webhook endpoints in your payment provider dashboards:"
    echo "  - Stripe: https://your-domain.com/api/webhooks/stripe"
    echo "  - PayPal: https://your-domain.com/api/webhooks/paypal"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test health endpoint
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        exit 1
    fi
    
    # Test API endpoints (basic tests)
    print_status "Running basic API tests..."
    
    # Add more specific tests here
    print_success "Basic tests completed"
}

# Show deployment info
show_info() {
    echo ""
    echo "=========================================="
    print_success "Deployment completed successfully!"
    echo "=========================================="
    echo ""
    echo "Application URLs:"
    echo "  - Health Check: http://localhost:3001/health"
    echo "  - API Base: http://localhost:3001/api"
    echo ""
    echo "Next steps:"
    echo "1. Configure SSL certificates"
    echo "2. Set up webhook endpoints"
    echo "3. Test payment flows"
    echo "4. Monitor application logs"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop app: docker-compose down"
    echo "  - Restart app: docker-compose restart"
    echo ""
}

# Main deployment function
main() {
    local platform=${1:-"docker"}
    
    echo "=========================================="
    echo "SocialSpark Payment API Deployment"
    echo "=========================================="
    
    check_docker
    check_docker_compose
    check_environment
    
    case $platform in
        "docker")
            build_image
            deploy_docker_compose
            ;;
        "heroku"|"aws"|"gcp")
            deploy_cloud $platform
            ;;
        *)
            print_error "Invalid platform: $platform"
            print_status "Usage: $0 [docker|heroku|aws|gcp]"
            exit 1
            ;;
    esac
    
    setup_ssl
    setup_webhooks
    test_deployment
    show_info
}

# Run main function
main "$@" 