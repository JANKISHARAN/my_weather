from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for testing (later restrict)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "207206ad356c419a9a2174814260604"

@app.get("/")
def home():
    return {"status": "ok"}

@app.get("/api/weather/{city}")
async def weather(city: str):
    if not API_KEY:
        return {"error": "API key missing"}

    url = "https://api.weatherapi.com/v1/current.json"
    params = {"key": API_KEY, "q": city}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        return res.json()
