from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
import game_logic

# GLOBAL VARIABLE TO HOLD THE BRAIN
models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Call the loader from your other file
    models["glove"] = game_logic.load_model()
    print("--- STARTUP: Brain Loaded! Ready for requests. ---")
    yield
    # (Code after 'yield' runs when the server shuts down)
    models.clear()
    print("--- SHUTDOWN: Cleaning up... ---")

# 1. Initialize App (Only once!)
app = FastAPI(lifespan=lifespan)

# 2. Define Allowed Origins (The Fix)
origins = [
    "http://localhost:5173",             # Local Development
    "http://127.0.0.1:5173",             # Local Development (Alternative)
    "https://code-names-clue-gen.vercel.app" # <--- YOUR VERCEL URL
]

# 3. Add Middleware with Specific Origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Use the list above, not ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameRequest(BaseModel):
    positive_words: List[str]
    negative_words: List[str]

@app.get("/health")
async def health_check():
    return {"status": "active"}

@app.post("/generate-clue")
async def generate_clue(request: GameRequest):
    if "glove" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded yet.")

    top_candidates = game_logic.get_best_clue(
        request.positive_words, 
        request.negative_words, 
        models["glove"]
    )

    return {
        "candidates": top_candidates,
        "input_positive": request.positive_words
    }

@app.get("/")
async def root():
    return {"message": "Codenames AI Server is Running!"}