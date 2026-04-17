import os
import httpx


async def fetch_traffic_news():
    api_key = os.getenv("GNEWS_API_KEY")

    if not api_key:
        raise ValueError("Missing GNews API key")

    url = "https://gnews.io/api/v4/search"
    params = {
        "q": "cycling safety OR bike accident",
        "lang": "en",
        "max": 5,
        "apikey": api_key,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    return [
        {
            "title": item.get("title"),
            "description": item.get("description"),
            "url": item.get("url"),
            "source": (item.get("source") or {}).get("name", "Unknown source"),
            "publishedAt": item.get("publishedAt"),
        }
        for item in data.get("articles", [])
    ]