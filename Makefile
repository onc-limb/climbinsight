gen: 
	python -m grpc_tools.protoc \
	-Iproto \
	--python_out=ai-service \ 
	--grpc_python_out=ai-service \ 
	proto/ai.proto