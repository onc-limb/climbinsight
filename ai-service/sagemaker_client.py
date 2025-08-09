#!/usr/bin/env python3
"""
SageMaker client for the Go server to replace direct AI service calls.
This replaces the direct HTTP calls to the AI service with SageMaker endpoint calls.
"""

import json
import base64
import boto3
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class Point:
    x: float
    y: float

class SageMakerSAMClient:
    """
    Client for invoking SAM model deployed on SageMaker.
    """
    
    def __init__(self, endpoint_name: str, region_name: str = "us-east-1"):
        """
        Initialize SageMaker client.
        
        Args:
            endpoint_name: Name of the SageMaker endpoint
            region_name: AWS region where the endpoint is deployed
        """
        self.endpoint_name = endpoint_name
        self.region_name = region_name
        self.sagemaker_runtime = boto3.client(
            'sagemaker-runtime',
            region_name=region_name
        )
        
    def process_image(self, image_bytes: bytes, points: List[Point]) -> Dict[str, str]:
        """
        Process image using SageMaker endpoint.
        
        Args:
            image_bytes: Raw image bytes
            points: List of click coordinates
            
        Returns:
            Dictionary with result_image_base64 and mask_image_base64
        """
        try:
            # Prepare payload for SageMaker
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            points_data = [{"x": p.x, "y": p.y} for p in points]
            
            payload = {
                "image_base64": image_base64,
                "points": points_data
            }
            
            # Invoke SageMaker endpoint
            logger.info(f"Invoking SageMaker endpoint: {self.endpoint_name}")
            
            response = self.sagemaker_runtime.invoke_endpoint(
                EndpointName=self.endpoint_name,
                ContentType='application/json',
                Body=json.dumps(payload)
            )
            
            # Parse response
            response_body = response['Body'].read().decode('utf-8')
            result = json.loads(response_body)
            
            logger.info("SageMaker inference completed successfully")
            
            return result
            
        except Exception as e:
            logger.error(f"SageMaker inference failed: {str(e)}")
            raise e
    
    def health_check(self) -> bool:
        """
        Check if the SageMaker endpoint is healthy.
        
        Returns:
            True if endpoint is healthy, False otherwise
        """
        try:
            # Describe endpoint to check status
            sagemaker_client = boto3.client('sagemaker', region_name=self.region_name)
            
            response = sagemaker_client.describe_endpoint(
                EndpointName=self.endpoint_name
            )
            
            status = response['EndpointStatus']
            logger.info(f"Endpoint {self.endpoint_name} status: {status}")
            
            return status == 'InService'
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False

# Example usage and testing
def main():
    """
    Example usage of SageMaker SAM client.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="Test SageMaker SAM client")
    parser.add_argument("--endpoint-name", required=True, help="SageMaker endpoint name")
    parser.add_argument("--region", default="us-east-1", help="AWS region")
    parser.add_argument("--test-image", help="Path to test image")
    
    args = parser.parse_args()
    
    # Initialize client
    client = SageMakerSAMClient(args.endpoint_name, args.region)
    
    # Health check
    print("🔍 Checking endpoint health...")
    if not client.health_check():
        print("❌ Endpoint is not healthy")
        return
    
    print("✅ Endpoint is healthy")
    
    # Test with sample image if provided
    if args.test_image:
        try:
            with open(args.test_image, 'rb') as f:
                image_bytes = f.read()
            
            # Sample points (center of image)
            points = [Point(x=0.5, y=0.5)]
            
            print("🧠 Processing image...")
            result = client.process_image(image_bytes, points)
            
            print(f"✅ Processing completed")
            print(f"Result keys: {list(result.keys())}")
            
            # Save results if needed
            if 'result_image_base64' in result:
                result_bytes = base64.b64decode(result['result_image_base64'])
                with open('sagemaker_result.png', 'wb') as f:
                    f.write(result_bytes)
                print("💾 Result image saved as sagemaker_result.png")
            
            if 'mask_image_base64' in result:
                mask_bytes = base64.b64decode(result['mask_image_base64'])
                with open('sagemaker_mask.png', 'wb') as f:
                    f.write(mask_bytes)
                print("💾 Mask image saved as sagemaker_mask.png")
                
        except FileNotFoundError:
            print(f"❌ Test image not found: {args.test_image}")
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
    
    print("🎉 SageMaker client test completed")

if __name__ == "__main__":
    main()