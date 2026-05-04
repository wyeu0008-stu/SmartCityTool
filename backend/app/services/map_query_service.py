from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.wkt_service import parse_wkt_path, parse_wkt_point


def _limit(value: int, default: int = 500, maximum: int = 5000) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default

    return max(1, min(parsed, maximum))


class MapQueryService:
    def __init__(self, db: Session):
        self.db = db

    def get_segments(self, limit: int = 500):
        safe_limit = _limit(limit)
        query = text(f"""
            SELECT TOP {safe_limit}
                s.segment_id,
                s.road_name,
                s.area_type,
                s.geom_wkt,
                f.length_m,
                f.speed_limit,
                f.road_type_encoded,
                f.bike_infra_score,
                f.crash_count_3y,
                f.serious_crash_count_3y,
                f.cyclist_crash_count_3y,
                f.avg_daily_vehicle_volume,
                p.model_version,
                p.risk_probability,
                p.risk_score,
                p.risk_level
            FROM city_road_segments_stage s
            LEFT JOIN city_segment_static_features f
                ON s.segment_id = f.segment_id
            LEFT JOIN city_segment_risk_predictions p
                ON s.segment_id = p.segment_id
            WHERE s.geom_wkt IS NOT NULL
            ORDER BY s.segment_id
        """)

        rows = self.db.execute(query).mappings()
        return [
            {
                **dict(row),
                "path_coordinates": parse_wkt_path(row["geom_wkt"]),
            }
            for row in rows
        ]

    def get_crashes(self, limit: int = 500):
        safe_limit = _limit(limit)
        query = text(f"""
            SELECT TOP {safe_limit}
                accident_no,
                accident_date,
                severity,
                road_name,
                bicyclist_count,
                is_serious_or_fatal,
                geom.STAsText() AS geom_wkt
            FROM cyclist_crash_points
            WHERE geom IS NOT NULL
            ORDER BY accident_date DESC
        """)

        crashes = []
        for row in self.db.execute(query).mappings():
            point = parse_wkt_point(row["geom_wkt"])
            crashes.append({
                "accident_no": row["accident_no"],
                "accident_date": row["accident_date"],
                "severity": row["severity"],
                "road_name": row["road_name"],
                "bicyclist_count": row["bicyclist_count"],
                "is_serious_or_fatal": bool(row["is_serious_or_fatal"]),
                "lat": point["lat"] if point else None,
                "lng": point["lng"] if point else None,
                "geometry_missing": point is None,
            })

        return crashes

    def get_bike_parking(self, limit: int = 500):
        safe_limit = _limit(limit)
        query = text(f"""
            SELECT TOP {safe_limit}
                name,
                parking_type,
                capacity,
                covered,
                access_type,
                fee,
                lit,
                surface_type,
                geom.STAsText() AS geom_wkt
            FROM bike_parking_facilities
            ORDER BY name
        """)

        facilities = []
        for row in self.db.execute(query).mappings():
            point = parse_wkt_point(row["geom_wkt"])
            facilities.append({
                "name": row["name"],
                "parking_type": row["parking_type"],
                "capacity": row["capacity"],
                "covered": row["covered"],
                "access_type": row["access_type"],
                "fee": row["fee"],
                "lit": row["lit"],
                "surface_type": row["surface_type"],
                "lat": point["lat"] if point else None,
                "lng": point["lng"] if point else None,
                "geometry_missing": point is None,
            })

        return facilities
