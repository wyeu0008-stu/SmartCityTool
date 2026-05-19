from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.tips_service import TipsService

router = APIRouter(prefix="/api/tips", tags=["tips"])


@router.get("")
def get_tips(
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    try:
        service = TipsService(db)
        return {"tips": service.get_tips(limit)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tips: {str(e)}")