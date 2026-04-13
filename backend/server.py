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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

# MongoDB connection
# Use local defaults for smoother local startup when env vars are missing.
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'weather_dashboard')
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=500,
    connectTimeoutMS=500,
    socketTimeoutMS=1000,
)
db = client[db_name]

# Weather API configuration
WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY')
WEATHER_API_BASE_URL = os.environ.get('WEATHER_API_BASE_URL', 'https://api.weatherapi.com/v1')

# Create the main app
app = FastAPI(title="Weather Dashboard API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# HTTP client for external API calls
http_client = httpx.AsyncClient(timeout=30.0)

# ============ Models ============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

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

class SearchHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    name: str
    region: str
    country: str
    lat: float
    lon: float
    searched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SearchHistoryCreate(BaseModel):
    query: str
    name: str
    region: str
    country: str
    lat: float
    lon: float

# ============ Weather API Helper Functions ============

async def fetch_weather_api(endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Make a request to WeatherAPI.com"""
    params['key'] = WEATHER_API_KEY
    url = f"{WEATHER_API_BASE_URL}/{endpoint}"
    
    try:
        response = await http_client.get(url, params=params)
        if response.status_code == 400:
            error_data = response.json()
            raise HTTPException(status_code=400, detail=error_data.get('error', {}).get('message', 'Invalid request'))
        elif response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid API key")
        elif response.status_code == 403:
            raise HTTPException(status_code=403, detail="API access forbidden")
        response.raise_for_status()
        return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Weather API request timed out")
    except httpx.RequestError as e:
        logger.error(f"Weather API request error: {e}")
        raise HTTPException(status_code=503, detail="Weather service unavailable")

# ============ Routes ============

@api_router.get("/")
async def root():
    return {"message": "Weather Dashboard API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Weather endpoints
@api_router.get("/weather/current/{location}")
async def get_current_weather(location: str, aqi: bool = True):
    """Get current weather for a location"""
    params = {
        'q': location,
        'aqi': 'yes' if aqi else 'no'
    }
    data = await fetch_weather_api('current.json', params)
    return data

@api_router.get("/weather/forecast/{location}")
async def get_forecast(
    location: str,
    days: int = Query(default=7, ge=1, le=14),
    aqi: bool = True,
    alerts: bool = True
):
    """Get weather forecast for a location"""
    params = {
        'q': location,
        'days': days,
        'aqi': 'yes' if aqi else 'no',
        'alerts': 'yes' if alerts else 'no'
    }
    data = await fetch_weather_api('forecast.json', params)
    return data

@api_router.get("/weather/search")
async def search_locations(q: str = Query(..., min_length=1)):
    """Search for locations by name"""
    params = {'q': q}
    data = await fetch_weather_api('search.json', params)
    return data

@api_router.get("/weather/astronomy/{location}")
async def get_astronomy(location: str, date: Optional[str] = None):
    """Get astronomy data (sunrise, sunset, etc.)"""
    params = {'q': location}
    if date:
        params['dt'] = date
    data = await fetch_weather_api('astronomy.json', params)
    return data

# Favorite cities endpoints
@api_router.post("/favorites", response_model=FavoriteCity)
async def add_favorite(city: FavoriteCityCreate):
    """Add a city to favorites"""
    # Check if already exists
    try:
        existing = await db.favorites.find_one(
            {"name": city.name, "country": city.country},
            {"_id": 0}
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    if existing:
        raise HTTPException(status_code=400, detail="City already in favorites")
    
    favorite = FavoriteCity(**city.model_dump())
    doc = favorite.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    try:
        await db.favorites.insert_one(doc)
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return favorite

@api_router.get("/favorites", response_model=List[FavoriteCity])
async def get_favorites():
    """Get all favorite cities"""
    try:
        favorites = await db.favorites.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    except PyMongoError:
        return []
    for f in favorites:
        if isinstance(f.get('created_at'), str):
            f['created_at'] = datetime.fromisoformat(f['created_at'])
    return favorites

@api_router.delete("/favorites/{favorite_id}")
async def remove_favorite(favorite_id: str):
    """Remove a city from favorites"""
    try:
        result = await db.favorites.delete_one({"id": favorite_id})
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Favorite removed successfully"}

# Search history endpoints
@api_router.post("/history", response_model=SearchHistory)
async def add_search_history(search: SearchHistoryCreate):
    """Add a search to history"""
    history = SearchHistory(**search.model_dump())
    doc = history.model_dump()
    doc['searched_at'] = doc['searched_at'].isoformat()
    try:
        await db.search_history.insert_one(doc)
    except PyMongoError:
        return history
    
    # Keep only last 10 searches
    try:
        count = await db.search_history.count_documents({})
        if count > 10:
            oldest = await db.search_history.find({}, {"_id": 0, "id": 1}).sort("searched_at", 1).limit(count - 10).to_list(count - 10)
            if oldest:
                ids = [o['id'] for o in oldest]
                await db.search_history.delete_many({"id": {"$in": ids}})
    except PyMongoError:
        pass
    
    return history

@api_router.get("/history", response_model=List[SearchHistory])
async def get_search_history():
    """Get recent search history"""
    try:
        history = await db.search_history.find({}, {"_id": 0}).sort("searched_at", -1).to_list(10)
    except PyMongoError:
        return []
    for h in history:
        if isinstance(h.get('searched_at'), str):
            h['searched_at'] = datetime.fromisoformat(h['searched_at'])
    return history

@api_router.delete("/history")
async def clear_history():
    """Clear all search history"""
    try:
        await db.search_history.delete_many({})
    except PyMongoError:
        return {"message": "Search history cleared"}
    return {"message": "Search history cleared"}

# Legacy status endpoints
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    await http_client.aclose()
    client.close()
