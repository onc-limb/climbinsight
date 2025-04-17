from dataclasses import dataclass
from typing import List
import cv2
import numpy as np
import torch
from segment_anything import sam_model_registry, SamPredictor
from PIL import Image
import io

@dataclass
class Coordinate:
    x: float
    y: float

# モデル読み込み
def load_sam_model():
    checkpoint = "ai-service/sam_vit_b.pth"  # ダウンロードしたモデルファイルのパス
    model_type = "vit_b"
    sam = sam_model_registry[model_type](checkpoint=checkpoint)
    sam.to("cuda" if torch.cuda.is_available() else "cpu")
    return SamPredictor(sam)

# バイナリ画像 → numpy array (RGB)
def decode_image(image_bytes: bytes) -> np.ndarray:
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def apply_mask_to_image(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    if mask.ndim == 3:
        mask = mask[0]  # SAMからの出力が (1, H, W) の場合
    alpha = (mask * 255).astype(np.uint8)
    return np.dstack((image, alpha))  # RGB + Alpha

def filter_largest_connected_component(mask: np.ndarray) -> np.ndarray:
    # 入力: bool型mask (H, W)
    mask_uint8 = (mask * 255).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask_uint8)

    if num_labels <= 1:
        return mask  # 背景しかない

    # 面積最大のラベル（label 0は背景なので除く）
    largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    return labels == largest_label

def estimate_wall_color(image: np.ndarray) -> tuple[int, int, int]:
    h, w, _ = image.shape
    center_region = image[h//3:2*h//3, w//3:2*w//3]  # 中央1/3領域
    avg_color = center_region.mean(axis=(0, 1)).astype(int)
    return tuple(avg_color)  # (R, G, B)

def encode_image(image: np.ndarray) -> bytes:
    image_pil = Image.fromarray(image)
    buffer = io.BytesIO()
    image_pil.save(buffer, format="PNG")
    return buffer.getvalue()


# メイン処理（バイナリ入出力）
def process_image_bytes(image_bytes: bytes, points: List[Coordinate], predictor: SamPredictor) -> bytes:
    image = decode_image(image_bytes)
    predictor.set_image(image)

    input_point = np.array([[p.x, p.y] for p in points])
    input_label = np.array([1] * len(points))  # 前景として扱う

    masks, scores, logits = predictor.predict(
    point_coords=input_point,
    point_labels=input_label,
    multimask_output=False
    )

    # mask = masks[0]

    rgba_image = apply_mask_to_image(image, masks)

    # wall_color = estimate_wall_color(image)

    # output = np.zeros_like(image)
    # output[:, :] = wall_color  # RGB 3チャンネル全部 wall_color に

    # output[mask] = image[mask]

    # 必要なら RGBA 化も可能
    return encode_image(rgba_image)
