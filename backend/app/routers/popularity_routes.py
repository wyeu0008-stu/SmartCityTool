from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.popularity_service import PopularityService

router = APIRouter(prefix="/api/popularity", tags=["popularity"])


class PopularityPoint(BaseModel):
    text: str | None = None
    lat: float | None = None
    lng: float | None = None


class SearchRecordRequest(BaseModel):
    origin: PopularityPoint
    destination: PopularityPoint


@router.post("/setup")
def setup_popularity_tables(db: Session = Depends(get_db)):
    service = PopularityService(db)
    try:
        service.ensure_tables()
        db.commit()
        return {
            "created_or_verified": [
                "popular_start_points",
                "popular_end_points",
                "popular_routes",
            ]
        }
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Unable to create popularity tables: {exc.__class__.__name__}") from exc


@router.post("/searches")
def record_search(payload: SearchRecordRequest, db: Session = Depends(get_db)):
    service = PopularityService(db)
    try:
        return {
            "record": service.record_search(
                origin=payload.origin.dict(),
                destination=payload.destination.dict(),
            )
        }
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Unable to record route search: {exc.__class__.__name__}") from exc


@router.get("/start-points")
def get_popular_start_points(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = PopularityService(db)
    return {"start_points": service.get_popular_start_points(limit)}


@router.get("/end-points")
def get_popular_end_points(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = PopularityService(db)
    return {"end_points": service.get_popular_end_points(limit)}


@router.get("/routes")
def get_popular_routes(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = PopularityService(db)
    return {"routes": service.get_popular_routes(limit)}
