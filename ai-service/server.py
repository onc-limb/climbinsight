import grpc
from concurrent import futures
import time

import ai_pb2
import ai_pb2_grpc

from sam import load_sam_model, process_image_bytes

MAX_MESSAGE_LENGTH = 20 * 1024 * 1024  # 20MB に増やすなど

class AIService(ai_pb2_grpc.AIServiceServicer):
    def __init__(self):
        print("🧠 SAM モデルをロード中...")
        self.gen = load_sam_model()
        print("✅ モデル準備完了")

    def Process(self, request, context):
        print(f"📥 受信")
        result_bytes = process_image_bytes(request.input, self.gen)
        print(f"処理完了")
        return ai_pb2.ProcessImageResponse(processed_image=result_bytes, mime_type="image/png")
    
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10),
                         options=[
                             ("grpc.max_receive_message_length", MAX_MESSAGE_LENGTH),
                             ("grpc.max_send_message_length", MAX_MESSAGE_LENGTH)])
    ai_pb2_grpc.add_AIServiceServicer_to_server(AIService(), server)

    port = 50051
    server.add_insecure_port(f'[::]:{port}')
    server.start()
    print(f"🚀 gRPCサーバー起動中... ポート: {port}")
    try:
        while True:
            time.sleep(86400)  # サーバーを常に維持
    except KeyboardInterrupt:
        print("🛑 サーバー停止")
        server.stop(0)


if __name__ == '__main__':
    serve()