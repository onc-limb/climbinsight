import json
import zipfile
import io
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from sam import load_sam_model, process_image_bytes, Coordinate

MAX_MESSAGE_LENGTH = 20 * 1024 * 1024  # 20MB に増やすなど

# FastAPI
app = FastAPI()

# SAM初期化
load_dotenv()
predictor = None

# リクエストスキーマ
class Point(BaseModel):
    x: float
    y: float

@app.get('/healthz')
def health_check():
    return JSONResponse(content={"status": "ok"})

@app.post('/process')
async def process(request: Request):
    try:
        global predictor 
        if predictor is None:
            print("🧠 SAM モデルをロード中...")
            predictor = load_sam_model()
            print("✅ モデル準備完了")
        
        # Read zip request body
        zip_data = await request.body()
        
        # Parse zip data to extract image and points
        image_bytes, points = parse_zip_data(zip_data)
        
        # Process image using SAM
        result_bytes, mask_bytes = process_image_bytes(image_bytes, points, predictor)
        
        # Create zip response
        response_zip_data = create_zip_response(result_bytes, mask_bytes)
        
        return Response(
            content=response_zip_data,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=result.zip"}
        )
        
    except Exception as e:
        print(f"❌ エラー発生: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

def create_zip_response(result_bytes: bytes, mask_bytes: bytes) -> bytes:
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
