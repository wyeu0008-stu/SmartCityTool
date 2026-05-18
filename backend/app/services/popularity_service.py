from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session


class PopularityService:
    def __init__(self, db: Session):
        self.db = db

    def ensure_tables(self) -> None:
        self.db.execute(text("""
            IF OBJECT_ID('dbo.popular_start_points', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.popular_start_points (
                    start_point_id INT IDENTITY(1,1) PRIMARY KEY,
                    normalized_name NVARCHAR(255) NOT NULL UNIQUE,
                    display_name NVARCHAR(255) NOT NULL,
                    latitude FLOAT NULL,
                    longitude FLOAT NULL,
                    search_count INT NOT NULL DEFAULT 0,
                    first_searched_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    last_searched_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
                );
            END

            IF OBJECT_ID('dbo.popular_end_points', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.popular_end_points (
                    end_point_id INT IDENTITY(1,1) PRIMARY KEY,
                    normalized_name NVARCHAR(255) NOT NULL UNIQUE,
                    display_name NVARCHAR(255) NOT NULL,
                    latitude FLOAT NULL,
                    longitude FLOAT NULL,
                    search_count INT NOT NULL DEFAULT 0,
                    first_searched_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    last_searched_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
                );
            END

            IF OBJECT_ID('dbo.popular_routes', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.popular_routes (
                    popular_route_id INT IDENTITY(1,1) PRIMARY KEY,
                    origin_normalized_name NVARCHAR(255) NOT NULL,
                    destination_normalized_name NVARCHAR(255) NOT NULL,
                    origin_display_name NVARCHAR(255) NOT NULL,
                    destination_display_name NVARCHAR(255) NOT NULL,
                    origin_latitude FLOAT NULL,
                    origin_longitude FLOAT NULL,
                    destination_latitude FLOAT NULL,
                    destination_longitude FLOAT NULL,
                    search_count INT NOT NULL DEFAULT 0,
                    first_searched_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    last_searched_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT uq_popular_routes_origin_destination
                        UNIQUE (origin_normalized_name, destination_normalized_name)
                );
            END
        """))

    def record_search(self, origin: dict, destination: dict) -> dict:
        origin_point = self._normalize_point(origin, fallback_name="Current Location")
        destination_point = self._normalize_point(destination, fallback_name="Unknown Destination")
        searched_at = datetime.now(timezone.utc).replace(tzinfo=None)

        self.ensure_tables()
        self._upsert_point(
            table_name="popular_start_points",
            normalized_name=origin_point["normalized_name"],
            display_name=origin_point["display_name"],
            lat=origin_point["lat"],
            lng=origin_point["lng"],
            searched_at=searched_at,
        )
        self._upsert_point(
            table_name="popular_end_points",
            normalized_name=destination_point["normalized_name"],
            display_name=destination_point["display_name"],
            lat=destination_point["lat"],
            lng=destination_point["lng"],
            searched_at=searched_at,
        )
        self._upsert_route(origin_point, destination_point, searched_at)
        self.db.commit()

        return {
            "origin": origin_point["display_name"],
            "destination": destination_point["display_name"],
            "recorded_at": searched_at.isoformat(),
        }

    def get_popular_start_points(self, limit: int = 10) -> list[dict]:
        self.ensure_tables()
        return self._fetch_ranked_points("popular_start_points", "start_point_id", limit)

    def get_popular_end_points(self, limit: int = 10) -> list[dict]:
        self.ensure_tables()
        return self._fetch_ranked_points("popular_end_points", "end_point_id", limit)

    def get_popular_routes(self, limit: int = 10) -> list[dict]:
        self.ensure_tables()
        safe_limit = self._safe_limit(limit)
        rows = self.db.execute(text(f"""
            SELECT TOP {safe_limit}
                popular_route_id,
                origin_display_name,
                destination_display_name,
                origin_latitude,
                origin_longitude,
                destination_latitude,
                destination_longitude,
                search_count,
                first_searched_at,
                last_searched_at
            FROM dbo.popular_routes
            ORDER BY search_count DESC, last_searched_at DESC
        """)).mappings()
        return [dict(row) for row in rows]

    def _upsert_point(
        self,
        table_name: str,
        normalized_name: str,
        display_name: str,
        lat: float | None,
        lng: float | None,
        searched_at: datetime,
    ) -> None:
        self.db.execute(text(f"""
            IF EXISTS (
                SELECT 1 FROM dbo.{table_name} WITH (UPDLOCK, HOLDLOCK)
                WHERE normalized_name = :normalized_name
            )
            BEGIN
                UPDATE dbo.{table_name}
                SET
                    display_name = :display_name,
                    latitude = COALESCE(:lat, latitude),
                    longitude = COALESCE(:lng, longitude),
                    search_count = search_count + 1,
                    last_searched_at = :searched_at
                WHERE normalized_name = :normalized_name;
            END
            ELSE
            BEGIN
                INSERT INTO dbo.{table_name} (
                    normalized_name,
                    display_name,
                    latitude,
                    longitude,
                    search_count,
                    first_searched_at,
                    last_searched_at
                )
                VALUES (
                    :normalized_name,
                    :display_name,
                    :lat,
                    :lng,
                    1,
                    :searched_at,
                    :searched_at
                );
            END
        """), {
            "normalized_name": normalized_name,
            "display_name": display_name,
            "lat": lat,
            "lng": lng,
            "searched_at": searched_at,
        })

    def _upsert_route(self, origin: dict, destination: dict, searched_at: datetime) -> None:
        self.db.execute(text("""
            IF EXISTS (
                SELECT 1 FROM dbo.popular_routes WITH (UPDLOCK, HOLDLOCK)
                WHERE origin_normalized_name = :origin_normalized_name
                  AND destination_normalized_name = :destination_normalized_name
            )
            BEGIN
                UPDATE dbo.popular_routes
                SET
                    origin_display_name = :origin_display_name,
                    destination_display_name = :destination_display_name,
                    origin_latitude = COALESCE(:origin_latitude, origin_latitude),
                    origin_longitude = COALESCE(:origin_longitude, origin_longitude),
                    destination_latitude = COALESCE(:destination_latitude, destination_latitude),
                    destination_longitude = COALESCE(:destination_longitude, destination_longitude),
                    search_count = search_count + 1,
                    last_searched_at = :searched_at
                WHERE origin_normalized_name = :origin_normalized_name
                  AND destination_normalized_name = :destination_normalized_name;
            END
            ELSE
            BEGIN
                INSERT INTO dbo.popular_routes (
                    origin_normalized_name,
                    destination_normalized_name,
                    origin_display_name,
                    destination_display_name,
                    origin_latitude,
                    origin_longitude,
                    destination_latitude,
                    destination_longitude,
                    search_count,
                    first_searched_at,
                    last_searched_at
                )
                VALUES (
                    :origin_normalized_name,
                    :destination_normalized_name,
                    :origin_display_name,
                    :destination_display_name,
                    :origin_latitude,
                    :origin_longitude,
                    :destination_latitude,
                    :destination_longitude,
                    1,
                    :searched_at,
                    :searched_at
                );
            END
        """), {
            "origin_normalized_name": origin["normalized_name"],
            "destination_normalized_name": destination["normalized_name"],
            "origin_display_name": origin["display_name"],
            "destination_display_name": destination["display_name"],
            "origin_latitude": origin["lat"],
            "origin_longitude": origin["lng"],
            "destination_latitude": destination["lat"],
            "destination_longitude": destination["lng"],
            "searched_at": searched_at,
        })

    def _fetch_ranked_points(self, table_name: str, id_column: str, limit: int) -> list[dict]:
        safe_limit = self._safe_limit(limit)
        rows = self.db.execute(text(f"""
            SELECT TOP {safe_limit}
                {id_column} AS point_id,
                display_name,
                latitude,
                longitude,
                search_count,
                first_searched_at,
                last_searched_at
            FROM dbo.{table_name}
            ORDER BY search_count DESC, last_searched_at DESC
        """)).mappings()
        return [dict(row) for row in rows]

    def _normalize_point(self, point: dict | None, fallback_name: str) -> dict:
        point = point or {}
        display_name = str(point.get("text") or fallback_name).strip() or fallback_name

        return {
            "display_name": display_name[:255],
            "normalized_name": " ".join(display_name.lower().split())[:255],
            "lat": self._to_float_or_none(point.get("lat")),
            "lng": self._to_float_or_none(point.get("lng")),
        }

    def _to_float_or_none(self, value) -> float | None:
        try:
            return float(value) if value is not None else None
        except (TypeError, ValueError):
            return None

    def _safe_limit(self, limit: int) -> int:
        return max(1, min(int(limit or 10), 100))
