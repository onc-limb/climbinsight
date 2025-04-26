import os
import threading
from flask import Flask
from waitress import serve
import grpc
from concurrent import futures
import time
from dotenv import load_dotenv

import ai_pb2
import ai_pb2_grpc

from sam import load_sam_model, process_image_bytes, Coordinate

MAX_MESSAGE_LENGTH = 20 * 1024 * 1024  # 20MB に増やすなど

class AIService(ai_pb2_grpc.AIServiceServicer):
    def __init__(self):
        load_dotenv()
        self.predictor = None

    def Process(self, request, context):
        print(f"📥 受信")
        if self.predictor is None:
            print("🧠 SAM モデルをロード中...")
            self.predictor = load_sam_model()
            print("✅ モデル準備完了")
        p = [Coordinate(x=p.x, y=p.y) for p in request.points]
        result_bytes = process_image_bytes(request.image, p, self.predictor)
        print(f"処理完了")
        return ai_pb2.ProcessImageResponse(processed_image=result_bytes, mime_type="image/png")
    
def serve_grpc():
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


def serve_http():
    app = Flask(__name__)

    @app.route('/healthz')
    def health_check():
        return "OK", 200

    port = int(os.getenv('PORT', 8090))
    print(f"🌐 HTTPヘルスサーバー起動中... ポート: {port}")
    serve(app, host='0.0.0.0', port=port)


if __name__ == '__main__':
    threading.Thread(target=serve_grpc, daemon=True).start()
    serve_http()