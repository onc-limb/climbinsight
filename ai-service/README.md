# SageMaker Deployment Files

This directory contains the files needed to deploy the SAM model to Amazon SageMaker.

## Files

- `inference.py` - SageMaker inference script with model loading and prediction functions
- `sam.py` - Modified SAM utilities that load model from SageMaker JumpStart
- `requirements.txt` - Python dependencies for SageMaker environment

## Model Input/Output

**Input Format:**

```json
{
  "image_base64": "base64_encoded_image",
  "points": [{ "x": 0.5, "y": 0.5 }]
}
```

**Output Format:**

```json
{
  "result_image_base64": "base64_encoded_result_image",
  "mask_image_base64": "base64_encoded_mask"
}
```
