import json
import base64
import logging
from typing import Dict, Any

from sam import load_sam_model, process_image_bytes, Coordinate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model variable
predictor = None

def model_fn(model_dir: str):
    """
    SageMaker model loading function.
    This function is called once when the inference container starts.
    """
    global predictor
    
    try:
        logger.info("🧠 Loading SAM model for SageMaker JumpStart...")
        logger.info(f"Model directory: {model_dir}")
        
        predictor = load_sam_model()
        logger.info("✅ SAM model loaded successfully")
        
        return predictor
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {str(e)}")
        raise e

def input_fn(request_body: str, content_type: str = 'application/json'):
    """
    Parse input data for inference.
    SageMaker calls this function to parse the incoming request.
    """
    try:
        if content_type == 'application/json':
            input_data = json.loads(request_body)
            
            # Validate required fields
            if 'image_base64' not in input_data or 'points' not in input_data:
                raise ValueError("Missing required fields: 'image_base64' and 'points'")
            
            # Decode base64 image
            image_base64 = input_data['image_base64']
            image_bytes = base64.b64decode(image_base64)
            
            # Parse points
            points_data = input_data['points']
            points = [Coordinate(x=p['x'], y=p['y']) for p in points_data]
            
            return {
                'image_bytes': image_bytes,
                'points': points
            }
            
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
            
    except Exception as e:
        logger.error(f"❌ Error parsing input: {str(e)}")
        raise e

def predict_fn(input_data: Dict[str, Any], model):
    """
    Run inference on the input data.
    """
    try:
        image_bytes = input_data['image_bytes']
        points = input_data['points']
        
        logger.info(f"Processing image with {len(points)} points")
        
        # Process image using SAM
        result_bytes, mask_bytes = process_image_bytes(image_bytes, points, model)
        
        return {
            'result_image_base64': base64.b64encode(result_bytes).decode('utf-8'),
            'mask_image_base64': base64.b64encode(mask_bytes).decode('utf-8')
        }
        
    except Exception as e:
        logger.error(f"❌ Error during inference: {str(e)}")
        raise e

def output_fn(prediction: Dict[str, str], accept: str = 'application/json'):
    """
    Format the prediction output.
    """
    try:
        if accept == 'application/json':
            return json.dumps(prediction), 'application/json'
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

# Alternative entry point for local testing
if __name__ == "__main__":
    # For local testing
    import sys
    
    # Load model
    model = model_fn("/opt/ml/model")
    
    # Test input
    test_input = {
        "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",  # 1x1 white pixel
        "points": [{"x": 0.5, "y": 0.5}]
    }
    
    # Parse input
    parsed_input = input_fn(json.dumps(test_input))
    
    # Run inference
    prediction = predict_fn(parsed_input, model)
    
    # Format output
    output, content_type = output_fn(prediction)
    
    print(f"Output: {output}")
    print(f"Content Type: {content_type}")