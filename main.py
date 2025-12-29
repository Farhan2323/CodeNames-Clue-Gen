from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
import game_logic

# GLOBAL VARIABLE TO HOLD THE BRAIN
# We store the model here so we don't have to reload it (130MB+) for every single request.
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

app = FastAPI(lifespan=lifespan)

app = FastAPI(lifespan=lifespan)

# --- NEW: ALLOW FRONTEND CONNECTION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows ALL origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, GET, etc.)
    allow_headers=["*"],  # Allows all headers
)

class GameRequest(BaseModel):
    positive_words: List[str]  # e.g., ["apple", "banana"]
    negative_words: List[str]  # e.g., ["computer"]

# --- 4. DEFINE THE ENDPOINT  ---
@app.post("/generate-clue")
async def generate_clue(request: GameRequest):
    if "glove" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded yet.")

    # Get the list of top 5 results
    top_candidates = game_logic.get_best_clue(
        request.positive_words, 
        request.negative_words, 
        models["glove"]
    )

    # Return the entire list
    return {
        "candidates": top_candidates, # <--- The Frontend will loop through this
        "input_positive": request.positive_words
    }

# --- 5. HEALTH CHECK ---
@app.get("/")
async def root():
    return {"message": "Codenames AI Server is Running!"}