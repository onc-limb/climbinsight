## 環境構築

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

終了方法
deactivate

curl -L -o sam_vit_b.pth https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth

python -m grpc_tools.protoc \
 -Iproto \
 --python_out=ai-service \
--grpc_python_out=ai-service \
proto/ai.proto
