import json
import base64
import logging
import zipfile
import io
import os
import boto3
from typing import Dict, Any

from sam import load_sam_model, process_image_bytes, Coordinate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model variable
predictor = None

# AWS clients
s3_client = None
sns_client = None

def model_fn(model_dir: str):
    """
    SageMaker model loading function.
    This function is called once when the inference container starts.
    """
    global predictor, s3_client, sns_client
    
    try:
        logger.info("🧠 Loading SAM model for SageMaker JumpStart...")
        logger.info(f"Model directory: {model_dir}")
        
        predictor = load_sam_model()
        logger.info("✅ SAM model loaded successfully")

        # Initialize AWS clients
        s3_client = boto3.client('s3')
        sns_client = boto3.client('sns')
        logger.info("✅ AWS clients initialized successfully")
        
        return predictor
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {str(e)}")
        raise e

def process_s3_object(s3_bucket: str, s3_key: str) -> dict:
    """
    Process image from S3 object and upload results back to S3.
    """
    try:
        # Extract session name from S3 key
        session_name = os.path.splitext(os.path.basename(s3_key))[0]
        logger.info(f"Processing S3 object: s3://{s3_bucket}/{s3_key} for session: {session_name}")
        
        # Download zip file from S3
        logger.info("📥 Downloading zip file from S3...")
        response = s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
        zip_data = response['Body'].read()
        
        # Parse zip file to extract image and points
        image_bytes, points = parse_zip_data(zip_data)
        
        # Process image using SAM
        logger.info(f"🔮 Processing image with {len(points)} points")
        result_bytes, mask_bytes = process_image_bytes(image_bytes, points, predictor)
        
        # Create result zip file
        result_zip_data = create_result_zip(result_bytes, mask_bytes)
        
        # Upload result to S3
        result_s3_key = f"results/{session_name}.zip"
        logger.info(f"📤 Uploading result to S3: s3://{s3_bucket}/{result_s3_key}")
        
        s3_client.put_object(
            Bucket=s3_bucket,
            Key=result_s3_key,
            Body=result_zip_data,
            ContentType='application/zip',
            Metadata={
                'session-name': session_name,
                'processing-status': 'completed'
            }
        )
        
        # Send SNS notification
        send_sns_notification(session_name)
        
        logger.info(f"✅ Processing completed for session: {session_name}")
        
        return {
            'statusCode': 200,
            'session_name': session_name,
            'result_s3_key': result_s3_key,
            'message': 'Processing completed successfully'
        }
        
    except Exception as e:
        logger.error(f"❌ Error processing S3 object: {str(e)}")
        
        # Send error SNS notification if session_name is available
        if 'session_name' in locals():
            send_sns_notification(session_name, error=str(e))
        
        raise e

def parse_zip_data(zip_data: bytes) -> tuple:
    """
    Parse zip data to extract image bytes and points.
    """
    zip_buffer = io.BytesIO(zip_data)
    image_bytes = None
    points = None
    
    with zipfile.ZipFile(zip_buffer, 'r') as zip_file:
        # Read image binary
        if 'image.bin' in zip_file.namelist():
            with zip_file.open('image.bin') as image_file:
                image_bytes = image_file.read()
        else:
            raise ValueError("image.bin not found in zip file")
        
        # Read points JSON
        if 'points.json' in zip_file.namelist():
            with zip_file.open('points.json') as points_file:
                points_data = json.loads(points_file.read().decode('utf-8'))
                points = [Coordinate(x=p['x'], y=p['y']) for p in points_data['points']]
        else:
            raise ValueError("points.json not found in zip file")
    
    return image_bytes, points

def create_result_zip(result_bytes: bytes, mask_bytes: bytes) -> bytes:
    """
    Create zip file containing result and mask images as binary data.
    """
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add result image as binary
        zip_file.writestr('result_image.bin', result_bytes)
        # Add mask image as binary  
        zip_file.writestr('mask_image.bin', mask_bytes)
    
    zip_buffer.seek(0)
    return zip_buffer.getvalue()

def send_sns_notification(session_name: str, error: str = None):
    """
    Send SNS notification to trigger Go server endpoint.
    """
    try:
        sns_topic_arn = os.getenv('AWS_SNS_TOPIC_ARN')
        if not sns_topic_arn:
            logger.warning("⚠️  AWS_SNS_TOPIC_ARN not set, skipping SNS notification")
            return
        
        message_data = {
            'session_name': session_name,
            'timestamp': '2025-01-01T00:00:00Z',  # You might want to use actual timestamp
            'status': 'error' if error else 'completed'
        }
        
        if error:
            message_data['error'] = error
        
        # Send SNS message
        response = sns_client.publish(
            TopicArn=sns_topic_arn,
            Message=json.dumps(message_data),
            Subject=f"Image Processing {'Failed' if error else 'Completed'}: {session_name}"
        )
        
        logger.info(f"📨 SNS notification sent: {response['MessageId']}")
        
    except Exception as e:
        logger.error(f"❌ Error sending SNS notification: {str(e)}")

# SageMaker inference functions (kept for compatibility)
def input_fn(request_body: bytes, content_type: str = 'application/zip'):
    """
    Parse input data for inference.
    SageMaker calls this function to parse the incoming request.
    """
    try:
        if content_type == 'application/zip':
            return parse_zip_data(request_body)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
    except Exception as e:
        logger.error(f"❌ Error parsing input: {str(e)}")
        raise e

def predict_fn(input_data: tuple, model):
    """
    Run inference on the input data.
    """
    try:
        image_bytes, points = input_data
        logger.info(f"Processing image with {len(points)} points")
        
        # Process image using SAM
        result_bytes, mask_bytes = process_image_bytes(image_bytes, points, model)
        
        return {
            'result_image_bytes': result_bytes,
            'mask_image_bytes': mask_bytes
        }
        
    except Exception as e:
        logger.error(f"❌ Error during inference: {str(e)}")
        raise e

def output_fn(prediction: Dict[str, bytes], accept: str = 'application/zip'):
    """
    Format the prediction output.
    """
    try:
        if accept == 'application/zip':
            return create_result_zip(
                prediction['result_image_bytes'], 
                prediction['mask_image_bytes']
            ), 'application/zip'
        else:
            raise ValueError(f"Unsupported accept type: {accept}")
    except Exception as e:
        logger.error(f"❌ Error formatting output: {str(e)}")
        raise e

# Health check endpoint for SageMaker
def ping():
    """
    Health check function for SageMaker.
    """
    try:
        if predictor is not None:
            return {"status": "healthy"}, 200
        else:
            return {"status": "model not loaded"}, 503
    except Exception as e:
        logger.error(f"❌ Health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}, 503

# Lambda-style handler for async processing
def lambda_handler(event, context):
    """
    AWS Lambda handler for processing S3 events.
    """
    try:
        logger.info("🚀 Lambda handler invoked")
        logger.info(f"Event: {json.dumps(event)}")
        
        # Extract S3 bucket and key from event
        if 'Records' in event:
            for record in event['Records']:
                if 's3' in record:
                    s3_bucket = record['s3']['bucket']['name']
                    s3_key = record['s3']['object']['key']
                    
                    # Process only request zip files
                    if s3_key.startswith('requests/') and s3_key.endswith('.zip'):
                        result = process_s3_object(s3_bucket, s3_key)
                        return result
        
        # Direct invocation with bucket and key
        elif 'bucket' in event and 'key' in event:
            result = process_s3_object(event['bucket'], event['key'])
            return result
        
        else:
            raise ValueError("Invalid event format")
            
    except Exception as e:
        logger.error(f"❌ Lambda handler error: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e)
        }

# Alternative entry point for local testing
if __name__ == "__main__":
    # Initialize model
    predictor = model_fn("/opt/ml/model")
    
    # Test processing
    test_event = {
        'bucket': 'test-bucket',
        'key': 'requests/test-session.zip'
    }
    
    result = lambda_handler(test_event, None)
    print(f"Test result: {result}")