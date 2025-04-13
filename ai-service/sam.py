import io
import cv2
import numpy as np
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from PIL import Image

# モデル読み込み
def load_sam_model():
    checkpoint = "sam_vit_b.pth"  # ダウンロードしたモデルファイルのパス
    model_type = "vit_b"
    sam = sam_model_registry[model_type](checkpoint=checkpoint)
    sam.to("cuda" if torch.cuda.is_available() else "cpu")
    return SamAutomaticMaskGenerator(sam)

# バイナリ画像 → numpy array (RGB)
def decode_image(image_bytes: bytes) -> np.ndarray:
    img_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# numpy RGBA → PNGバイナリ
def encode_image_to_png_bytes(image: np.ndarray) -> bytes:
    # OpenCV は RGBA → BGRA 変換してからエンコードが必要
    image_bgra = cv2.cvtColor(image, cv2.COLOR_RGBA2BGRA)
    success, encoded = cv2.imencode(".png", image_bgra)
    return encoded.tobytes()

# マスクを使って透明化する関数
def apply_mask_to_image(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    alpha = (mask * 255).astype(np.uint8)
    rgba = cv2.cvtColor(image, cv2.COLOR_RGB2RGBA)
    rgba[..., 3] = alpha
    return rgba

# メイン処理（バイナリ入出力）
def process_image_bytes(image_bytes: bytes, mask_generator: SamAutomaticMaskGenerator) -> bytes:
    image = decode_image(image_bytes)
    masks = mask_generator.generate(image)

    # 面積が最大のマスクを使う
    largest = max(masks, key=lambda x: x['area'])
    mask = largest['segmentation']

    rgba = apply_mask_to_image(image, mask)
    return encode_image_to_png_bytes(rgba)
