# project 
[screen-capture (8).webm](https://github.com/user-attachments/assets/dfac2e12-871e-47dd-b2b8-ee96ecab5ebd)

# Emotion-Driven UI System
<img width="955" height="443" alt="happy" src="https://github.com/user-attachments/assets/7294f5d7-13cc-4581-ace0-e89b2dd6d1d9" />
<img width="960" height="442" alt="sad" src="https://github.com/user-attachments/assets/d4cf686b-d04e-4a71-b537-91f3ac40c348" />
<img width="959" height="443" alt="Angry" src="https://github.com/user-attachments/assets/5d593584-2e9f-4fa2-a63a-ad6532724967" />


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
