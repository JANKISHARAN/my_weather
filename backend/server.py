from fastapi import FastAPI
import os
import httpx

app = FastAPI()

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
