from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx

# Load env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== ENV VARIABLES =====
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'weather_dashboard')
WEATHER_API_KEY = os.environ.get('d69f4ce76b4b0c0187c31ed7dd543560')
WEATHER_API_BASE_URL = os.environ.get(
    'WEATHER_API_BASE_URL',
    'https://api.weatherapi.com/v1'
)

# ===== SAFE DB CONNECTION =====
db = None
try:
    if mongo_url:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        logger.info("MongoDB connected")
    else:
        logger.warning("MONGO_URL not set → DB disabled")
except Exception as e:
    logger.error(f"MongoDB connection failed: {e}")
    db = None

# ===== APP =====
app = FastAPI(title="Weather Dashboard API")
api_router = APIRouter(prefix="/api")

http_client = httpx.AsyncClient(timeout=30.0)

# ===== MODELS =====
class FavoriteCity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    region: str
    country: str
    lat: float
    lon: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FavoriteCityCreate(BaseModel):
    name: str
    region: str
    country: str
    lat: float
    lon: float

# ===== WEATHER FUNCTION =====
async def fetch_weather_api(endpoint: str, params: Dict[str, Any]):
    if not WEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="WEATHER_API_KEY not set")

    params['key'] = WEATHER_API_KEY
    url = f"{WEATHER_API_BASE_URL}/{endpoint}"

    try:
        response = await http_client.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        raise HTTPException(status_code=500, detail="Weather API failed")

# ===== ROUTES =====
@api_router.get("/")
async def root():
    return {"message": "API running"}

@api_router.get("/weather/{location}")
async def get_weather(location: str):
    return await fetch_weather_api("current.json", {"q": location})

# ===== FAVORITES (SAFE DB) =====
@api_router.post("/favorites")
async def add_favorite(city: FavoriteCityCreate):
    if not db:
        return {"message": "DB not configured"}

    try:
        await db.favorites.insert_one(city.model_dump())
        return {"message": "Saved"}
    except:
        return {"message": "DB error"}

# ===== INCLUDE ROUTER =====
app.include_router(api_router)

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== SHUTDOWN =====
@app.on_event("shutdown")
async def shutdown():
    await http_client.aclose()
