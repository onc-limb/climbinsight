import json
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

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
async def process(file: UploadFile = File(...), points: str = Form(...)):
    try:
        global predictor 
        if predictor is None:
            print("🧠 SAM モデルをロード中...")
            predictor = load_sam_model()
            print("✅ モデル準備完了")
        
        points_list = [Point(**p) for p in json.loads(points)]

        image_bytes = await file.read()

        p = [Coordinate(x=p.x, y=p.y) for p in points_list]

        result_bytes = process_image_bytes(image_bytes, p, predictor)

        return {
            "mime_type": "image/png",
            "image_byte": result_bytes
        }
    except Exception as e:
        print(f"❌ エラー発生: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)