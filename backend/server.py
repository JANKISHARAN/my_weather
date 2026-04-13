from fastapi import FastAPI, APIRouter, HTTPException
from starlette.middleware.cors import CORSMiddleware
import os
import httpx

# ===== ENV =====
WEATHER_API_KEY = os.environ.get("d69f4ce76b4b0c0187c31ed7dd543560")
BASE_URL = "https://api.weatherapi.com/v1"

# ===== APP =====
app = FastAPI()
router = APIRouter(prefix="/api")

# ===== ROUTES =====
@router.get("/")
def home():
    return {"message": "API running"}

@router.get("/weather/{city}")
async def get_weather(city: str):
    if not WEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="API key missing")

    url = f"{BASE_URL}/current.json"
    params = {"key": WEATHER_API_KEY, "q": city}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        return res.json()

# ===== REGISTER =====
app.include_router(router)

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
