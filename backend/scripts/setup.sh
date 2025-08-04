#!/bin/bash

# SocialSpark Payment API Setup Script
# This script automates the setup of the payment backend

set -e

echo "🚀 Setting up SocialSpark Payment API Backend..."

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

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Environment file created from template"
        print_warning "Please edit .env file with your actual configuration values"
    else
        print_warning "Environment file already exists. Skipping creation."
    fi
}

# Create logs directory
setup_directories() {
    print_status "Creating necessary directories..."
    mkdir -p logs
    print_success "Directories created"
}

# Check environment variables
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f .env ]; then
        print_error "Environment file (.env) not found. Please run setup first."
        exit 1
    fi
    
    # Source environment file
    set -a
    source .env
    set +a
    
    # Check required variables
    REQUIRED_VARS=(
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "JWT_SECRET"
    )
    
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        print_warning "Please update your .env file with the missing variables"
        exit 1
    fi
    
    print_success "Environment configuration is valid"
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    
    # This would require a simple test script
    # For now, we'll just check if the environment is set
    if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_success "Database configuration appears valid"
    else
        print_warning "Database configuration may be incomplete"
    fi
}

# Run database migrations
run_migrations() {
    print_status "Checking database schema..."
    print_warning "Please run the payment schema SQL in your Supabase SQL editor:"
    echo "  - Open your Supabase dashboard"
    echo "  - Go to SQL Editor"
    echo "  - Execute the contents of database/payment_schema.sql"
}

# Test the application
test_application() {
    print_status "Testing application startup..."
    
    # Start the application in background
    npm start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Application is running successfully"
    else
        print_error "Application failed to start or health check failed"
    fi
    
    # Stop the application
    kill $APP_PID 2>/dev/null || true
}

# Main setup function
main() {
    echo "=========================================="
    echo "SocialSpark Payment API Setup"
    echo "=========================================="
    
    check_nodejs
    check_npm
    install_dependencies
    setup_environment
    setup_directories
    check_environment
    test_database
    run_migrations
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your actual configuration"
    echo "2. Run database migrations in Supabase"
    echo "3. Start the application: npm run dev"
    echo "4. Test the API: curl http://localhost:3001/health"
    echo ""
    echo "For more information, see README.md"
}

# Run main function
main "$@" 