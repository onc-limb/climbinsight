from dataclasses import dataclass
from typing import List
import cv2
import numpy as np
import torch
# from segment_anything import sam_model_registry, SamPredictor
from mobile_sam import SamPredictor, build_sam_vit_t
from PIL import Image
import io
import os
import boto3

@dataclass
class Coordinate:
    x: float
    y: float

def download_model():
    bucket_name = 'sam-models'
    object_key = 'mobile_sam.pt'
    download_path = '/tmp/mobile_sam.pt'

    if os.path.exists(download_path):
        return download_path

    session = boto3.session.Session()
    s3 = session.client(
        service_name='s3',
        aws_access_key_id=os.environ.get('STORAGE_ACCESS_KEY'),
        aws_secret_access_key=os.environ.get('STORAGE_SECRET_KEY'),
        endpoint_url=os.environ.get('STORAGE_ENDPOINT'),
    )

    s3.download_file(bucket_name, object_key, download_path)
    print(f'Model downloaded to {download_path}')

    return download_path

# モデル読み込み
def load_sam_model():
    checkpoint = download_model()  # ダウンロードしたモデルファイルのパス

    # SAM用のコード
    # model_type = "vit_b"
    # sam = sam_model_registry[model_type](checkpoint=checkpoint)
    sam = build_sam_vit_t(checkpoint=checkpoint)
    sam.to("cuda" if torch.cuda.is_available() else "cpu")
    return SamPredictor(sam)

# バイナリ画像 → numpy array (RGB)
def decode_image(image_bytes: bytes) -> np.ndarray:
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def build_combined_mask_from_clicks(
    image: np.ndarray,
    points: List[Coordinate],
    predictor: SamPredictor,
    min_area: int = 0
) -> np.ndarray:
    """
    クリック位置ごとにpredict()を呼び、マスクを合成する。
    小さすぎるマスクは除外。

    Returns:
        合成マスク（bool配列）: クリックに対応するホールド部分
    """
    combined_mask = np.zeros_like(image[:, :, 0], dtype=bool)  # shape: (H, W)

    for p in points:
        input_point = np.array([[p.x, p.y]])
        input_label = np.array([1])  # 前景とみなす

        masks, _, _ = predictor.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=False
        )

        single_mask = masks[0]

        if min_area > 0 & np.sum(single_mask) < min_area:
            continue

        combined_mask |= single_mask  # 合成（OR）

    return combined_mask

def apply_mask_to_image(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    if mask.ndim == 3:
        mask = mask[0]  # SAMからの出力が (1, H, W) の場合
    bg_alpha = 0.2
    alpha = np.where(mask, 255, int(255 * bg_alpha)).astype(np.uint8)
    return np.dstack((image, alpha))  # RGB + Alpha

def encode_image(image: np.ndarray) -> bytes:
    image_pil = Image.fromarray(image)
    buffer = io.BytesIO()
    image_pil.save(buffer, format="PNG")
    return buffer.getvalue()


# メイン処理（バイナリ入出力）
def process_image_bytes(image_bytes: bytes, points: List[Coordinate], predictor: SamPredictor) -> bytes:
    image = decode_image(image_bytes)
    predictor.set_image(image)

    combined_mask = build_combined_mask_from_clicks(image, points, predictor)

    # 合成マスクが空だった場合
    if np.sum(combined_mask) == 0:
        print("クリックしたマスクがすべて除外されました")
        return encode_image(image)  # or return None

    rgba_image = apply_mask_to_image(image, combined_mask)

    return encode_image(rgba_image)
