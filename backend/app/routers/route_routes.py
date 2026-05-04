from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.route_query_service import RouteQueryService

router = APIRouter(prefix="/api/routes", tags=["routes"])


class RoutePoint(BaseModel):
    text: str | None = None
    lat: float | None = None
    lng: float | None = None


class CompareRoutesRequest(BaseModel):
    origin: RoutePoint
    destination: RoutePoint
    mode: str = "cycling"


@router.get("/requests")
def get_route_requests(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    service = RouteQueryService(db)
    return {"requests": service.get_requests(limit)}


@router.get("/candidates")
def get_candidate_routes(
    request_id: int | None = None,
    db: Session = Depends(get_db),
):
    service = RouteQueryService(db)
    return {"routes": service.get_candidates(request_id)}


@router.post("/compare")
def compare_routes(
    payload: CompareRoutesRequest,
    db: Session = Depends(get_db),
):
    service = RouteQueryService(db)
    return service.compare_routes(
        origin=payload.origin.dict(),
        destination=payload.destination.dict(),
    )


@router.get("/{route_id}")
def get_route(route_id: int, db: Session = Depends(get_db)):
    service = RouteQueryService(db)
    route = service.get_route(route_id)

    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    return route
