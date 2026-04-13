from fastapi import FastAPI
import os
import httpx

app = FastAPI()

API_KEY = os.getenv("d69f4ce76b4b0c0187c31ed7dd543560")

@app.get("/")
def home():
    return {"status": "ok"}

@app.get("/weather/{city}")
async def weather(city: str):
    if not API_KEY:
        return {"error": "API key missing"}

    url = "https://api.weatherapi.com/v1/current.json"
    params = {"key": API_KEY, "q": city}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        return res.json()
