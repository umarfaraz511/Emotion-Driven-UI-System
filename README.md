# Emotion-Driven UI System

> Real-time facial emotion detection with adaptive web interface

**Developed by Umar Faraz**
- GitHub: https://github.com/umarfaraz511
- LinkedIn: https://www.linkedin.com/in/umar-faraz-700457280

---

## Features
- Real-time facial emotion detection via webcam (face-api.js)
- 7 emotions: happy, sad, angry, fearful, surprised, disgusted, neutral
- Full dashboard with stat cards, emotion bars, detection log
- AI-generated contextual messages via Groq LLaMA3-70B
- Analyze Emotion button — click to get AI analysis on demand
- Dynamic theme changes per detected emotion
- Session stats: total detections, dominant emotion, avg confidence, duration
- All video processing on-device — nothing uploaded

---

## Quick Start

### Step 1 — Download face-api.js models
```powershell
cd frontend\public\models

Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json" -OutFile "tiny_face_detector_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1" -OutFile "tiny_face_detector_model-shard1"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_expression/face_expression_model-weights_manifest.json" -OutFile "face_expression_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_expression/face_expression_model-shard1" -OutFile "face_expression_model-shard1"
```

### Step 2 — Backend
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Add your Groq API key to .env (free at console.groq.com)
uvicorn main:app --reload --port 8000
```

### Step 3 — Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Stack
- Frontend: React + Vite + Tailwind CSS + face-api.js
- Backend: FastAPI + Groq API (LLaMA3-70B)
- Models: TinyFaceDetector + faceExpressionNet
