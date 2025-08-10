#!/usr/bin/env python3
"""
Script to compress SAM model file and upload to S3 bucket.
Compresses ./tmp/sam_vit_b.pth into a tar.gz file and uploads to specified S3 bucket.
"""

import os
import sys
import tarfile
import argparse
import boto3
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_model_tar(model_path: str, output_path: str) -> str:
    """
    Create a tar.gz file containing the SAM model.
    
    Args:
        model_path: Path to the SAM model file
        output_path: Path for the output tar.gz file
        
    Returns:
        Path to the created tar.gz file
    """
    logger.info(f"Creating tar.gz from {model_path}...")
    
    # Verify model file exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    # Create tar.gz file
    with tarfile.open(output_path, "w:gz") as tar:
        # Add the model file with a standard name in the archive
        tar.add(model_path, arcname="sam_vit_b.pth")
        logger.info(f"Added {model_path} to archive as sam_vit_b.pth")
    
    # Check file size
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    logger.info(f"Created {output_path} ({file_size_mb:.2f} MB)")
    
    return output_path

def upload_to_s3(file_path: str, bucket_name: str, s3_key: str, aws_profile: str = None) -> str:
    """
    Upload tar.gz file to S3 bucket.
    
    Args:
        file_path: Path to the tar.gz file
        bucket_name: S3 bucket name
        s3_key: S3 object key (path in bucket)
        aws_profile: AWS profile name (optional)
        
    Returns:
        S3 URI of uploaded file
    """
    try:
        # Initialize S3 client
        session = boto3.Session(profile_name=aws_profile) if aws_profile else boto3.Session()
        s3_client = session.client('s3')
        
        logger.info(f"Uploading {file_path} to s3://{bucket_name}/{s3_key}...")
        
        # Upload file with progress callback
        def upload_callback(bytes_transferred):
            file_size = os.path.getsize(file_path)
            percentage = (bytes_transferred / file_size) * 100
            logger.info(f"Upload progress: {percentage:.1f}%")
        
        s3_client.upload_file(
            file_path, 
            bucket_name, 
            s3_key,
            Callback=upload_callback
        )
        
        s3_uri = f"s3://{bucket_name}/{s3_key}"
        logger.info(f"✅ Upload completed: {s3_uri}")
        
        return s3_uri
        
    except Exception as e:
        logger.error(f"❌ Upload failed: {str(e)}")
        raise

def verify_s3_upload(bucket_name: str, s3_key: str, aws_profile: str = None) -> bool:
    """
    Verify that the file was uploaded successfully to S3.
    
    Args:
        bucket_name: S3 bucket name
        s3_key: S3 object key
        aws_profile: AWS profile name (optional)
        
    Returns:
        True if file exists and is accessible
    """
    try:
        session = boto3.Session(profile_name=aws_profile) if aws_profile else boto3.Session()
        s3_client = session.client('s3')
        
        response = s3_client.head_object(Bucket=bucket_name, Key=s3_key)
        file_size = response['ContentLength']
        last_modified = response['LastModified']
        
        logger.info(f"✅ File verified in S3:")
        logger.info(f"   Size: {file_size / (1024*1024):.2f} MB")
        logger.info(f"   Last Modified: {last_modified}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Verification failed: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Compress SAM model and upload to S3")
    parser.add_argument(
        "--model-path", 
        default="./tmp/sam_vit_b.pth",
        help="Path to SAM model file (default: ./tmp/sam_vit_b.pth)"
    )
    parser.add_argument(
        "--bucket", 
        required=True,
        help="S3 bucket name"
    )
    parser.add_argument(
        "--key", 
        default="sam-models/sam_vit_b.tar.gz",
        help="S3 object key (default: sam-models/sam_vit_b.tar.gz)"
    )
    parser.add_argument(
        "--output", 
        default="sam_vit_b_model.tar.gz",
        help="Local output tar.gz filename (default: sam_vit_b_model.tar.gz)"
    )
    parser.add_argument(
        "--aws-profile",
        help="AWS profile name to use"
    )
    parser.add_argument(
        "--keep-local",
        action="store_true",
        help="Keep local tar.gz file after upload"
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        default=True,
        help="Verify upload after completion (default: True)"
    )
    
    args = parser.parse_args()
    
    try:
        # Create tar.gz file
        logger.info("🗜️  Starting SAM model compression and upload...")
        tar_path = create_model_tar(args.model_path, args.output)
        
        # Upload to S3
        s3_uri = upload_to_s3(tar_path, args.bucket, args.key, args.aws_profile)
        
        # Verify upload
        if args.verify:
            logger.info("🔍 Verifying upload...")
            if verify_s3_upload(args.bucket, args.key, args.aws_profile):
                logger.info("✅ Upload verification successful")
            else:
                logger.error("❌ Upload verification failed")
                sys.exit(1)
        
        # Clean up local file unless requested to keep
        if not args.keep_local:
            os.remove(tar_path)
            logger.info(f"🗑️  Removed local file: {tar_path}")
        
        logger.info("🎉 SAM model upload completed successfully!")
        logger.info(f"📍 S3 URI: {s3_uri}")
        
        return s3_uri
        
    except Exception as e:
        logger.error(f"❌ Process failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()