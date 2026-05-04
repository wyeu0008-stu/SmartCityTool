from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.map_query_service import MapQueryService

router = APIRouter(prefix="/api/map", tags=["map"])


@router.get("/segments")
def get_segments(
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    service = MapQueryService(db)
    return {"segments": service.get_segments(limit)}


@router.get("/crashes")
def get_crashes(
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    service = MapQueryService(db)
    return {"crashes": service.get_crashes(limit)}


@router.get("/bike-parking")
def get_bike_parking(
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    service = MapQueryService(db)
    return {"facilities": service.get_bike_parking(limit)}
