import json
import logging
import zipfile
import io
import boto3
from typing import Dict

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
