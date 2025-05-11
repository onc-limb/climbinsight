from pydantic import BaseModel
import base64, json, io
from multipart.multipart import parse_options_header, MultipartParser
from sam import Coordinate, load_sam_model, process_image_bytes

class Point(BaseModel):
    x: float
    y: float

predictor = None

# ──────────────────────── multipart 解析関数 ───────────────────────
def parse_multipart(event):
    # API Gateway / Function URL はバイナリを base64 エンコードして渡す
    body_bytes = base64.b64decode(event["body"])
    ctype      = (event["headers"].get("content-type")
                  or event["headers"].get("Content-Type"))
    _, params  = parse_options_header(ctype.encode())
    boundary   = params[b"boundary"]

    parser = MultipartParser(io.BytesIO(body_bytes), boundary)
    parts  = {p.name: p for p in parser.parts()}

    file_bytes = parts["file"].raw
    points_str = parts["points"].text            # str ⇒ JSON 文字列
    return file_bytes, json.loads(points_str)    # -> bytes, list[list[float]]

# ───────────────────────── Lambda ハンドラ ─────────────────────────
def handler(event, _context):
    if predictor is None:
        print("🧠 SAM モデルをロード中...")
        predictor = load_sam_model()
        print("✅ モデル準備完了")
        
    try:
        img_bytes, points = parse_multipart(event)
        points_list = [Point(**p) for p in points]

        p = [Coordinate(x=p.x, y=p.y) for p in points_list]

        result_bytes = process_image_bytes(img_bytes, p, predictor)

        return {
            "statusCode": 200,
            "isBase64Encoded": True,
            "headers": {"Content-Type": "image/png"},
            "body": base64.b64encode(result_bytes).decode("ascii")
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }