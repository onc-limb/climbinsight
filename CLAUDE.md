# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClimbInsight is a computer vision application for rock climbing that extracts climbing holds from images and generates social media content. The system consists of:

- **Frontend**: Next.js React app with TypeScript for image upload and result display
- **Server**: Go backend API with Gin framework handling business logic and orchestration
- **AI Service**: Python FastAPI service using SAM (Segment Anything Model) for image processing
- **Infrastructure**: MinIO for object storage, Redis for session management

## Architecture

### Multi-Service Architecture
The application uses a microservices approach:

1. **Frontend** (`frontend/`) - Next.js app deployed on Cloudflare Pages
2. **Go Server** (`server/`) - Main API orchestrating business logic
3. **AI Service** (`ai-service/`) - Python service handling SAM model inference
4. **Infrastructure** - MinIO (S3-compatible storage) + Redis (session storage)

### Key Data Flow
1. User uploads climbing wall image via frontend
2. Go server receives image and coordinates, forwards to AI service
3. AI service processes with SAM model, returns extracted holds
4. Results stored in MinIO, session info in Redis
5. Optional: AI-generated social media content using DeepSeek API

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run pages:build  # Build for Cloudflare Pages
npm run pages:deploy # Deploy to Cloudflare Pages
```

### Server (Go)
```bash
cd server
go mod tidy
go run server.go     # Start development server
# Uses Air for hot reloading in development
```

### AI Service (Python)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate  # deactivate to exit
pip install -r requirements.txt
python app/server.py      # Start FastAPI server
```

### Infrastructure
```bash
docker-compose up -d  # Start MinIO and Redis services
```

### Proto Generation (if needed)
```bash
make gen  # Generate gRPC code from proto files
```

## Key Technologies

### Frontend Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with Radix UI components
- **Zustand** for state management
- **Cloudflare Pages** for deployment

### Backend Stack
- **Go** with Gin web framework
- **Clean Architecture** pattern (domain/usecase/infrastructure layers)
- **AWS SDK v2** for S3-compatible storage
- **Redis** client for session management
- **DeepSeek API** for AI text generation

### AI Processing
- **FastAPI** for high-performance Python API
- **SAM (Segment Anything Model)** for image segmentation
- **OpenCV** and **PIL** for image processing
- **PyTorch** for model inference
- **CUDA** support for GPU acceleration

## Environment Variables

### Server (.env)
```
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
REDIS_HOST=localhost:6379
DEEPSEEK_API_KEY=your_key_here
SLACK_WEBHOOK_URL=your_webhook_url
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### AI Service (.env)
```
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
```

## Development Workflow

1. **Start Infrastructure**: `docker-compose up -d`
2. **Start AI Service**: `cd ai-service && python app/server.py`
3. **Start Go Server**: `cd server && go run server.go`
4. **Start Frontend**: `cd frontend && npm run dev`

The application will be available at:
- Frontend: http://localhost:3000
- Go API: http://localhost:8080
- AI Service: http://localhost:8000
- MinIO Console: http://localhost:9001

## Code Structure

### Server (Go)
- `internal/domain/` - Business entities and interfaces
- `internal/usecase/` - Application business logic
- `internal/infra/` - External service implementations
- `internal/presentation/` - HTTP handlers and routing
- `utils/` - Shared utilities (error handling, notifications)

### AI Service (Python)
- `app/server.py` - FastAPI application and endpoints
- `app/sam.py` - SAM model loading and image processing logic

### Frontend (React/Next.js)
- `src/app/` - Next.js app router pages
- `src/components/ui/` - Reusable UI components (Radix/Tailwind)
- `src/components/client/` - Client-side form components
- `src/stores/` - Zustand state management
- `src/lib/` - Utility functions

## Testing

The project currently doesn't have a comprehensive test suite. When adding tests:
- Go: Use `go test ./...`
- Frontend: Use `npm test` (not currently configured)
- AI Service: Use `pytest` (not currently configured)

## SAM Model Setup

The AI service requires SAM model weights. Download using:
```bash
curl -L -o sam_vit_b.pth https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth
```

Models are stored in MinIO bucket `sam-models` and downloaded automatically on first use.

## Key API Endpoints

- `POST /image/process` - Upload image and coordinates for hold extraction
- `POST /contents/generate` - Generate social media content
- `GET /result` - SSE endpoint for real-time result streaming
- `POST /inquery` - Contact form submission

## Development Notes

- The application uses async processing - image processing and content generation happen in background goroutines
- Results are communicated via SSE (Server-Sent Events) for real-time updates
- The AI service auto-downloads SAM models from MinIO on startup
- Frontend uses Zustand for simple state management across pages
- Error handling includes Slack notifications for monitoring