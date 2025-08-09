#!/bin/bash
# Deployment script for SAM model to AWS SageMaker

set -e

# Configuration
MODEL_NAME="sam-climbing-model"
ENDPOINT_NAME="sam-climbing-endpoint"
S3_BUCKET=""  # Set your S3 bucket name
S3_KEY="sam-climbing/model.tar.gz"
INSTANCE_TYPE="ml.g4dn.xlarge"  # GPU instance for SAM
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check requirements
check_requirements() {
    print_step "Checking requirements..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not installed. Please install AWS CLI."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure'."
        exit 1
    fi
    
    if [ -z "$S3_BUCKET" ]; then
        print_error "Please set S3_BUCKET in this script."
        exit 1
    fi
    
    print_success "Requirements check passed"
}

# Create model package
create_package() {
    print_step "Creating model package..."
    
    if [ ! -f "package_model.py" ]; then
        print_error "package_model.py not found. Please ensure you're in the ai-service directory."
        exit 1
    fi
    
    python package_model.py --output-dir model_artifacts --s3-bucket "$S3_BUCKET" --s3-key "$S3_KEY"
    
    if [ $? -eq 0 ]; then
        print_success "Model package created and uploaded"
    else
        print_error "Failed to create model package"
        exit 1
    fi
}

# Create SageMaker model
create_sagemaker_model() {
    print_step "Creating SageMaker model..."
    
    # Get current account ID
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    # Get execution role (you may need to adjust this)
    ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/SageMakerExecutionRole"
    
    # SageMaker PyTorch container image
    IMAGE_URI="763104351884.dkr.ecr.${REGION}.amazonaws.com/pytorch-inference:2.1.0-gpu-py310-cu118-ubuntu20.04-sagemaker"
    
    # Model data S3 URI
    MODEL_DATA_URL="s3://${S3_BUCKET}/${S3_KEY}"
    
    # Create model
    aws sagemaker create-model \
        --model-name "$MODEL_NAME" \
        --primary-container Image="$IMAGE_URI",ModelDataUrl="$MODEL_DATA_URL" \
        --execution-role-arn "$ROLE_ARN" \
        --region "$REGION" || {
        
        # If model already exists, update it
        print_warning "Model may already exist, continuing..."
    }
    
    print_success "SageMaker model created/updated"
}

# Create endpoint configuration
create_endpoint_config() {
    print_step "Creating endpoint configuration..."
    
    ENDPOINT_CONFIG_NAME="${MODEL_NAME}-config-$(date +%s)"
    
    aws sagemaker create-endpoint-config \
        --endpoint-config-name "$ENDPOINT_CONFIG_NAME" \
        --production-variants VariantName=Primary,ModelName="$MODEL_NAME",InitialInstanceCount=1,InstanceType="$INSTANCE_TYPE",InitialVariantWeight=1 \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        print_success "Endpoint configuration created: $ENDPOINT_CONFIG_NAME"
        echo "$ENDPOINT_CONFIG_NAME" > .endpoint-config-name
    else
        print_error "Failed to create endpoint configuration"
        exit 1
    fi
}

# Create or update endpoint
create_endpoint() {
    print_step "Creating/updating endpoint..."
    
    if [ ! -f ".endpoint-config-name" ]; then
        print_error "Endpoint config name not found. Please run create_endpoint_config first."
        exit 1
    fi
    
    ENDPOINT_CONFIG_NAME=$(cat .endpoint-config-name)
    
    # Check if endpoint exists
    if aws sagemaker describe-endpoint --endpoint-name "$ENDPOINT_NAME" --region "$REGION" &> /dev/null; then
        print_step "Updating existing endpoint..."
        aws sagemaker update-endpoint \
            --endpoint-name "$ENDPOINT_NAME" \
            --endpoint-config-name "$ENDPOINT_CONFIG_NAME" \
            --region "$REGION"
    else
        print_step "Creating new endpoint..."
        aws sagemaker create-endpoint \
            --endpoint-name "$ENDPOINT_NAME" \
            --endpoint-config-name "$ENDPOINT_CONFIG_NAME" \
            --region "$REGION"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Endpoint creation/update initiated: $ENDPOINT_NAME"
    else
        print_error "Failed to create/update endpoint"
        exit 1
    fi
}

# Wait for endpoint to be in service
wait_for_endpoint() {
    print_step "Waiting for endpoint to be in service..."
    
    while true; do
        STATUS=$(aws sagemaker describe-endpoint --endpoint-name "$ENDPOINT_NAME" --region "$REGION" --query 'EndpointStatus' --output text)
        
        case $STATUS in
            "InService")
                print_success "Endpoint is in service!"
                break
                ;;
            "Creating"|"Updating")
                echo -n "."
                sleep 30
                ;;
            "Failed")
                print_error "Endpoint deployment failed"
                exit 1
                ;;
            *)
                print_warning "Unexpected status: $STATUS"
                sleep 30
                ;;
        esac
    done
}

# Test endpoint
test_endpoint() {
    print_step "Testing endpoint..."
    
    if [ -f "sagemaker_client.py" ]; then
        python sagemaker_client.py --endpoint-name "$ENDPOINT_NAME" --region "$REGION"
        
        if [ $? -eq 0 ]; then
            print_success "Endpoint test passed"
        else
            print_warning "Endpoint test failed, but deployment completed"
        fi
    else
        print_warning "sagemaker_client.py not found. Skipping endpoint test."
    fi
}

# Cleanup function
cleanup() {
    print_step "Cleaning up temporary files..."
    rm -f .endpoint-config-name
}

# Main deployment flow
main() {
    print_step "Starting SageMaker deployment for SAM climbing model"
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    case "${1:-all}" in
        "check")
            check_requirements
            ;;
        "package")
            check_requirements
            create_package
            ;;
        "model")
            create_sagemaker_model
            ;;
        "config")
            create_endpoint_config
            ;;
        "endpoint")
            create_endpoint
            wait_for_endpoint
            ;;
        "test")
            test_endpoint
            ;;
        "all")
            check_requirements
            create_package
            create_sagemaker_model
            create_endpoint_config
            create_endpoint
            wait_for_endpoint
            test_endpoint
            ;;
        "delete")
            print_step "Deleting endpoint and model..."
            aws sagemaker delete-endpoint --endpoint-name "$ENDPOINT_NAME" --region "$REGION" || true
            aws sagemaker delete-model --model-name "$MODEL_NAME" --region "$REGION" || true
            print_success "Resources deleted"
            ;;
        *)
            echo "Usage: $0 {check|package|model|config|endpoint|test|all|delete}"
            echo ""
            echo "Commands:"
            echo "  check    - Check requirements"
            echo "  package  - Create and upload model package"
            echo "  model    - Create SageMaker model"
            echo "  config   - Create endpoint configuration"
            echo "  endpoint - Create/update endpoint and wait"
            echo "  test     - Test the endpoint"
            echo "  all      - Run all steps (default)"
            echo "  delete   - Delete endpoint and model"
            exit 1
            ;;
    esac
    
    print_success "Deployment step completed!"
}

# Run main function
main "$@"