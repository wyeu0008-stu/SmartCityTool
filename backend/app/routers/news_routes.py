from fastapi import APIRouter, HTTPException
from app.services.news_service import fetch_traffic_news

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("/traffic")
async def get_traffic_news():
    try:
        return await fetch_traffic_news()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch traffic news: {str(e)}")