#!/usr/bin/env python3
"""
Script to package the SAM model for SageMaker deployment.
This script creates a model.tar.gz file that can be uploaded to SageMaker.
"""

import os
import sys
import tarfile
import shutil
import tempfile
import argparse
from pathlib import Path

def create_model_package(output_dir: str = "model_artifacts"):
    """
    Create a SageMaker model package containing all necessary files.
    """
    print("📦 Creating SageMaker model package...")
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Create temporary directory for packaging
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Copy inference script
        print("📋 Copying inference script...")
        shutil.copy2("inference.py", temp_path / "inference.py")
        
        # Copy SAM module
        print("📋 Copying SAM module...")
        shutil.copy2("app/sam.py", temp_path / "sam.py")
        
        # Copy requirements
        print("📋 Copying requirements...")
        shutil.copy2("requirements-sagemaker.txt", temp_path / "requirements.txt")
        
        # Create model directory structure
        model_dir = temp_path / "code"
        model_dir.mkdir(exist_ok=True)
        
        # Move inference script to code directory (SageMaker convention)
        shutil.move(str(temp_path / "inference.py"), str(model_dir / "inference.py"))
        shutil.move(str(temp_path / "sam.py"), str(model_dir / "sam.py"))
        shutil.move(str(temp_path / "requirements.txt"), str(model_dir / "requirements.txt"))
        
        # Create SageMaker serving configuration (optional)
        serving_properties = """
# SageMaker serving properties
engine=Python
option.entryPoint=inference.py
option.s3_url=s3://your-bucket/sam-models/
"""
        with open(model_dir / "serving.properties", "w") as f:
            f.write(serving_properties)
        
        # Create model.tar.gz
        model_tar_path = output_path / "model.tar.gz"
        print(f"📦 Creating {model_tar_path}...")
        
        with tarfile.open(model_tar_path, "w:gz") as tar:
            # Add all files from temp directory
            for file_path in temp_path.rglob("*"):
                if file_path.is_file():
                    arcname = file_path.relative_to(temp_path)
                    tar.add(file_path, arcname=arcname)
                    print(f"  ✅ Added: {arcname}")
    
    print(f"🎉 Model package created: {model_tar_path}")
    print(f"📊 Package size: {model_tar_path.stat().st_size / (1024*1024):.2f} MB")
    
    return str(model_tar_path)

def upload_to_s3(model_tar_path: str, bucket: str, key: str):
    """
    Upload the model package to S3.
    """
    try:
        import boto3
        
        print(f"📤 Uploading to s3://{bucket}/{key}...")
        
        s3_client = boto3.client('s3')
        s3_client.upload_file(model_tar_path, bucket, key)
        
        s3_uri = f"s3://{bucket}/{key}"
        print(f"✅ Upload completed: {s3_uri}")
        return s3_uri
        
    except ImportError:
        print("❌ boto3 not installed. Please install boto3 to upload to S3.")
        return None
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")
        return None

def create_sagemaker_model_script(model_s3_uri: str, output_dir: str = "sagemaker_scripts"):
    """
    Create a Python script to deploy the model to SageMaker.
    """
    script_dir = Path(output_dir)
    script_dir.mkdir(exist_ok=True)
    
    deploy_script = f'''#!/usr/bin/env python3
"""
Script to deploy the SAM model to AWS SageMaker.
"""

import boto3
from sagemaker import get_execution_role
from sagemaker.pytorch import PyTorchModel
from sagemaker.huggingface import HuggingFaceModel

def deploy_sam_model():
    """Deploy SAM model to SageMaker endpoint."""
    
    # Initialize SageMaker session
    import sagemaker
    session = sagemaker.Session()
    role = get_execution_role()  # or specify your role ARN
    
    # Model configuration
    model_data = "{model_s3_uri}"
    
    # Create PyTorchModel (since SAM uses PyTorch)
    pytorch_model = PyTorchModel(
        model_data=model_data,
        role=role,
        framework_version="2.1.0",  # Adjust based on your PyTorch version
        py_version="py310",
        entry_point="inference.py",
        source_dir=None,  # Code is included in model.tar.gz
        instance_type="ml.g4dn.xlarge",  # GPU instance for SAM
        name="sam-climbing-model",
    )
    
    # Deploy to endpoint
    predictor = pytorch_model.deploy(
        initial_instance_count=1,
        instance_type="ml.g4dn.xlarge",
        endpoint_name="sam-climbing-endpoint",
        wait=True,
    )
    
    print(f"🎉 Model deployed to endpoint: {{predictor.endpoint_name}}")
    return predictor

def test_endpoint(endpoint_name: str):
    """Test the deployed endpoint."""
    import json
    import base64
    from sagemaker.predictor import Predictor
    from sagemaker.serializers import JSONSerializer
    from sagemaker.deserializers import JSONDeserializer
    
    # Create predictor
    predictor = Predictor(
        endpoint_name=endpoint_name,
        serializer=JSONSerializer(),
        deserializer=JSONDeserializer(),
    )
    
    # Test payload (1x1 white pixel)
    test_payload = {{
        "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "points": [{{"x": 0.5, "y": 0.5}}]
    }}
    
    # Make prediction
    try:
        response = predictor.predict(test_payload)
        print(f"✅ Test successful: {{type(response)}}")
        return response
    except Exception as e:
        print(f"❌ Test failed: {{str(e)}}")
        return None

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Deploy SAM model to SageMaker")
    parser.add_argument("--test-only", action="store_true", help="Only test existing endpoint")
    parser.add_argument("--endpoint-name", default="sam-climbing-endpoint", help="Endpoint name")
    
    args = parser.parse_args()
    
    if args.test_only:
        test_endpoint(args.endpoint_name)
    else:
        predictor = deploy_sam_model()
        if predictor:
            test_endpoint(predictor.endpoint_name)
'''
    
    script_path = script_dir / "deploy_to_sagemaker.py"
    with open(script_path, "w") as f:
        f.write(deploy_script)
    
    # Make script executable
    os.chmod(script_path, 0o755)
    
    print(f"📝 Deployment script created: {script_path}")
    return str(script_path)

def main():
    parser = argparse.ArgumentParser(description="Package SAM model for SageMaker")
    parser.add_argument("--output-dir", default="model_artifacts", help="Output directory for model package")
    parser.add_argument("--s3-bucket", help="S3 bucket to upload model package")
    parser.add_argument("--s3-key", default="sam-climbing/model.tar.gz", help="S3 key for model package")
    parser.add_argument("--create-deploy-script", action="store_true", help="Create SageMaker deployment script")
    
    args = parser.parse_args()
    
    # Create model package
    model_tar_path = create_model_package(args.output_dir)
    
    # Upload to S3 if bucket specified
    s3_uri = None
    if args.s3_bucket:
        s3_uri = upload_to_s3(model_tar_path, args.s3_bucket, args.s3_key)
    
    # Create deployment script
    if args.create_deploy_script:
        if s3_uri:
            create_sagemaker_model_script(s3_uri)
        else:
            print("⚠️  Deployment script needs S3 URI. Please upload to S3 first.")
    
    print("\\n🎯 Next steps:")
    print("1. Upload model.tar.gz to S3 if not done already")
    print("2. Use the deployment script or SageMaker console to create endpoint")
    print("3. Update your application to use SageMaker endpoint instead of local service")
    
    return model_tar_path

if __name__ == "__main__":
    main()