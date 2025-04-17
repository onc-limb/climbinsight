from typing import List
import cv2
import numpy as np
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator

# モデル読み込み
def load_sam_model():
    checkpoint = "ai-service/sam_vit_b.pth"  # ダウンロードしたモデルファイルのパス
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


def extract_average_color(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    # マスク領域の平均RGB色を取得
    masked_pixels = image[mask.astype(bool)]
    if masked_pixels.size == 0:
        return np.array([0, 0, 0])
    return masked_pixels.mean(axis=0)

def is_color_close(color1, color2, threshold=50) -> bool:
    # ユークリッド距離で比較（近い色かどうか）
    return np.linalg.norm(np.array(color1) - np.array(color2)) < threshold

# メイン処理（バイナリ入出力）
def process_image_bytes(image_bytes: bytes, mask_generator: SamAutomaticMaskGenerator, target_color=(255, 0, 0)) -> bytes:
    image = decode_image(image_bytes)
    masks = mask_generator.generate(image)

    # マッチするマスクだけを抽出
    filtered_masks: List[np.ndarray] = []
    for m in masks:
        avg_color = extract_average_color(image, m['segmentation'])
        if is_color_close(avg_color, target_color):
            filtered_masks.append(m['segmentation'])

    # 背景色（画像全体の平均 or 中央値）を取得
    background_color = np.median(image.reshape(-1, 3), axis=0).astype(np.uint8)

    # 出力画像を初期化（壁色で塗りつぶしたRGB画像）
    result = np.full_like(image, background_color)

    # 選ばれたマスクの中にある部分だけ元画像の値を貼る
    for mask in filtered_masks:
        result[mask] = image[mask]

    # 必要なら RGBA 化も可能
    return encode_image_to_png_bytes(result)
