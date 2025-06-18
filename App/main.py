from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random
import httpx
import os

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google API credentials
GOOGLE_API_KEY = "AIzaSyBJH-idYRQR-9Xa6anGYrW3dbWGRj2t5j8"
GOOGLE_CX = "7473c6a883b574356"

# Static product recommendations
product_map = {
    "laptop": ["mouse", "keyboard", "monitor"],
    "phone": ["charger", "earphones", "case"],
    "book": ["pen", "notebook", "highlighter"],
    "car": ["seat cover", "air freshener", "phone mount"],
    "watch": ["strap", "case", "screen guard"],
    "headphones": ["audio splitter", "headphone stand", "bluetooth adapter"],
    "tablet": ["stylus", "cover", "screen protector"],
}

class RecommendationResponse(BaseModel):
    recommended: List[str]

# 🔥 Google Search Fallback Function
async def fetch_google_recommendations(query: str) -> List[str]:
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "q": query,
        "num": 6,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code == 200:
            items = response.json().get("items", [])
            return [item["title"] for item in items if "title" in item]
        return []

# 🎯 Main endpoint
@app.get("/recommend", response_model=RecommendationResponse)
async def recommend(product: str = Query(..., description="Comma-separated list of products")):
    products = [p.strip().lower() for p in product.split(",") if p.strip()]
    recommended = []

    for p in products:
        if p in product_map:
            recommended += product_map[p]
        else:
            # Fetch from Google if not in predefined map
            google_recs = await fetch_google_recommendations(p)
            recommended += google_recs

    # Shuffle and limit results
    recommended = list(set(recommended))
    random.shuffle(recommended)
    return {"recommended": recommended[:6]}
