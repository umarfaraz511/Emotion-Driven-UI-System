from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

app = FastAPI(title="Emotion UI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

SYSTEM_PROMPTS = {
    "happy":     "You are an upbeat, enthusiastic assistant. The user seems happy. Respond with energy and positivity. Keep it short — 2 sentences max.",
    "sad":       "You are a gentle, empathetic assistant. The user seems sad. Respond with warmth and comfort. Keep it short — 2 sentences max.",
    "angry":     "You are a calm, composed assistant. The user seems frustrated. Respond with patience and simplicity. Keep it short — 2 sentences max.",
    "fearful":   "You are a reassuring, steady assistant. The user seems anxious. Respond with calm reassurance. Keep it short — 2 sentences max.",
    "surprised": "You are an engaging, curious assistant. The user seems surprised. Respond with enthusiasm. Keep it short — 2 sentences max.",
    "disgusted": "You are a clean, minimal assistant. The user seems uncomfortable. Respond calmly and simply. Keep it short — 2 sentences max.",
    "neutral":   "You are a professional, helpful assistant. Respond clearly and helpfully. Keep it short — 2 sentences max.",
}

UI_SUGGESTIONS = {
    "happy":     {"theme": "happy",     "tone": "upbeat",     "message": "Great energy! Keep going!"},
    "sad":       {"theme": "sad",       "tone": "gentle",     "message": "Take it easy. You're doing well."},
    "angry":     {"theme": "angry",     "tone": "calm",       "message": "Take a breath. Simplifying the view."},
    "fearful":   {"theme": "fearful",   "tone": "reassuring", "message": "You're safe. Everything is okay."},
    "surprised": {"theme": "surprised", "tone": "energetic",  "message": "Something caught your eye?"},
    "disgusted": {"theme": "disgusted", "tone": "minimal",    "message": "Keeping things clean and simple."},
    "neutral":   {"theme": "neutral",   "tone": "professional","message": "Ready to help."},
}

class EmotionRequest(BaseModel):
    emotion: str
    confidence: float = 0.0
    user_message: str = ""

class EmotionResponse(BaseModel):
    message: str
    ui_suggestion: dict
    model: str

@app.get("/")
def root():
    return {"status": "running", "app": "Emotion UI API — AIVONEX"}

@app.get("/health")
def health():
    return {"status": "healthy", "groq_configured": bool(GROQ_API_KEY)}

@app.post("/api/emotion-response", response_model=EmotionResponse)
async def emotion_response(req: EmotionRequest):
    emotion = req.emotion.lower()
    if emotion not in SYSTEM_PROMPTS:
        emotion = "neutral"

    ui = UI_SUGGESTIONS[emotion]

    if not GROQ_API_KEY:
        return EmotionResponse(
            message=ui["message"],
            ui_suggestion=ui,
            model="fallback"
        )

    try:
        llm = ChatGroq(
            groq_api_key=GROQ_API_KEY,
            model_name="llama3-70b-8192",
            temperature=0.7,
            max_tokens=80
        )
        user_content = req.user_message or f"I am feeling {emotion}."
        messages = [
            SystemMessage(content=SYSTEM_PROMPTS[emotion]),
            HumanMessage(content=user_content)
        ]
        response = llm.invoke(messages)
        return EmotionResponse(
            message=response.content,
            ui_suggestion=ui,
            model="llama3-70b-8192"
        )
    except Exception as e:
        return EmotionResponse(
            message=ui["message"],
            ui_suggestion=ui,
            model="fallback"
        )
