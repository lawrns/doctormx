#!/bin/bash
# DoctorMX Marketing Automation Infrastructure Deployment Script

set -e  # Exit on any error

echo "🚀 DoctorMX Marketing Automation Infrastructure Deployment"
echo "========================================================="

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

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found"
        print_status "Creating .env from template..."
        cp ../environment-template.env .env
        print_warning "Please edit .env file with your actual values before continuing"
        read -p "Press enter when you've configured your .env file..."
    fi

    # Check critical environment variables
    source .env
    
    required_vars=(
        "N8N_PASSWORD"
        "POSTGRES_PASSWORD"
        "WHATSAPP_ACCESS_TOKEN"
        "SENDGRID_API_KEY"
        "OPENAI_API_KEY"
    )

    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] || [ "${!var}" == "your_${var,,}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing or placeholder values for: ${missing_vars[*]}"
        print_error "Please configure these variables in your .env file"
        exit 1
    fi

    print_success "Environment configuration validated"
}

# Create necessary directories
create_directories() {
    print_status "Creating directory structure..."
    
    mkdir -p monitoring
    mkdir -p workflows
    mkdir -p data/grafana
    mkdir -p data/prometheus
    mkdir -p logs
    
    print_success "Directory structure created"
}

# Create monitoring configuration
setup_monitoring() {
    print_status "Setting up monitoring configuration..."
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/metrics'

  - job_name: 'doctormx-api'
    static_configs:
      - targets: ['doctormx.netlify.app']
    metrics_path: '/.netlify/functions/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF

    print_success "Monitoring configuration created"
}

# Deploy the infrastructure
deploy_infrastructure() {
    print_status "Deploying marketing automation infrastructure..."
    
    # Pull latest images
    print_status "Pulling Docker images..."
    docker-compose pull
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to initialize..."
    sleep 30
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    print_status "Checking service health..."
    
    services=("n8n" "postgres" "redis" "grafana" "prometheus")
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep "$service" | grep "Up" > /dev/null; then
            print_success "$service is running"
        else
            print_error "$service failed to start"
            docker-compose logs "$service"
            exit 1
        fi
    done
}

# Configure n8n workflows
setup_n8n() {
    print_status "Setting up n8n workflows..."
    
    # Wait for n8n to be fully ready
    print_status "Waiting for n8n to be ready..."
    until curl -s -f "http://localhost:5678/healthz" > /dev/null; do
        print_status "Waiting for n8n..."
        sleep 5
    done
    
    print_success "n8n is ready"
    
    # Import workflows if they exist
    if [ -d "../workflows" ]; then
        print_status "Importing n8n workflows..."
        # Copy workflow files to the running container
        docker cp ../workflows/. $(docker-compose ps -q n8n):/home/node/.n8n/workflows/
        print_success "Workflows imported"
    fi
}

# Setup DoctorMX integration
setup_doctormx_integration() {
    print_status "Setting up DoctorMX platform integration..."
    
    # Create webhook endpoints in DoctorMX
    curl -X POST "${DOCTORMX_API_URL}/.netlify/functions/configure-automation" \
        -H "Content-Type: application/json" \
        -d '{
            "n8n_webhook_url": "'${N8N_WEBHOOK_URL}'",
            "automation_endpoints": [
                "/user-registered",
                "/consultation-complete",
                "/whatsapp-incoming",
                "/email-event",
                "/social-media-event"
            ]
        }' || print_warning "Could not configure DoctorMX integration automatically"
    
    print_success "DoctorMX integration configured"
}

# Display access information
display_access_info() {
    print_success "Deployment completed successfully!"
    echo ""
    echo "🎯 Access Information:"
    echo "======================================"
    echo "n8n Automation Dashboard: http://localhost:5678"
    echo "  Username: admin"
    echo "  Password: ${N8N_PASSWORD}"
    echo ""
    echo "Grafana Monitoring: http://localhost:3001"
    echo "  Username: admin"
    echo "  Password: ${GRAFANA_PASSWORD}"
    echo ""
    echo "Prometheus Metrics: http://localhost:9090"
    echo ""
    echo "📱 WhatsApp Business API Configuration:"
    echo "  Webhook URL: ${N8N_WEBHOOK_URL}/webhook/whatsapp-incoming"
    echo "  Verify Token: ${WHATSAPP_VERIFY_TOKEN}"
    echo ""
    echo "🔍 Monitoring:"
    echo "  View logs: docker-compose logs -f [service-name]"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure WhatsApp Business webhook with the URL above"
    echo "2. Set up social media API credentials in n8n"
    echo "3. Import and activate workflow templates"
    echo "4. Test end-to-end automation flows"
    echo "5. Monitor performance in Grafana dashboard"
    echo ""
    print_success "Ready to start your 30-day 1,000+ user acquisition sprint! 🚀"
}

# Main execution
main() {
    # Change to deployment directory
    cd "$(dirname "$0")"
    
    print_status "Starting DoctorMX Marketing Automation deployment..."
    
    check_docker
    check_environment
    create_directories
    setup_monitoring
    deploy_infrastructure
    setup_n8n
    setup_doctormx_integration
    display_access_info
}

# Run the deployment
main "$@" 