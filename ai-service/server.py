import grpc
from concurrent import futures
import time

import ai_pb2
import ai_pb2_grpc

class AIService(ai_pb2_grpc.AIServiceServicer):
    def Process(self, request, context):
        input_text = request.input
        print(f"📥 受信: {input_text}")
        return ai_pb2.OutputResponse(output=f"AI says: {input_text}")
    
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
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