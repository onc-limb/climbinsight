import json
import base64
import logging
import zipfile
import io
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

def input_fn(request_body: bytes, content_type: str = 'application/zip'):
    """
    Parse input data for inference.
    SageMaker calls this function to parse the incoming request.
    """
    try:
        if content_type == 'application/zip':
            # Handle zip file input
            zip_data = io.BytesIO(request_body)
            
            image_bytes = None
            points = None
            
            with zipfile.ZipFile(zip_data, 'r') as zip_file:
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
            
            return {
                'image_bytes': image_bytes,
                'points': points
            }
        
        elif content_type == 'application/json':
            # Legacy JSON support for backward compatibility
            input_data = json.loads(request_body.decode('utf-8'))
            
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
            # Create zip file with binary images
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # Add result image as binary
                zip_file.writestr('result_image.bin', prediction['result_image_bytes'])
                # Add mask image as binary  
                zip_file.writestr('mask_image.bin', prediction['mask_image_bytes'])
            
            zip_buffer.seek(0)
            return zip_buffer.getvalue(), 'application/zip'
        
        elif accept == 'application/json':
            # Legacy JSON support for backward compatibility
            json_output = {
                'result_image_base64': base64.b64encode(prediction['result_image_bytes']).decode('utf-8'),
                'mask_image_base64': base64.b64encode(prediction['mask_image_bytes']).decode('utf-8')
            }
            return json.dumps(json_output), 'application/json'
        
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
    
    # Create test zip file
    test_zip = io.BytesIO()
    with zipfile.ZipFile(test_zip, 'w') as zf:
        # Add test image (1x1 white pixel PNG)
        test_image = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
        zf.writestr("image.bin", test_image)
        
        # Add test points
        test_points = {"points": [{"x": 0.5, "y": 0.5}]}
        zf.writestr("points.json", json.dumps(test_points))
    
    test_zip.seek(0)
    
    # Parse input
    parsed_input = input_fn(test_zip.getvalue(), 'application/zip')
    
    # Run inference
    prediction = predict_fn(parsed_input, model)
    
    # Format output as zip
    output, content_type = output_fn(prediction, 'application/zip')
    
    print(f"Output size: {len(output)} bytes")
    print(f"Content Type: {content_type}")
    
    # Test legacy JSON format
    print("\nTesting legacy JSON format:")
    test_input = {
        "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "points": [{"x": 0.5, "y": 0.5}]
    }
    
    parsed_input_json = input_fn(json.dumps(test_input).encode('utf-8'), 'application/json')
    prediction_json = predict_fn(parsed_input_json, model)
    output_json, content_type_json = output_fn(prediction_json, 'application/json')
    
    print(f"JSON Output length: {len(output_json)}")
    print(f"JSON Content Type: {content_type_json}")