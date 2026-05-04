from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.model_loader import segment_risk_model
from app.services.wkt_service import parse_wkt_path


ROUTE_TYPES = ("shortest", "fastest", "safest")


class RouteQueryService:
    def __init__(self, db: Session):
        self.db = db

    def get_requests(self, limit: int = 50):
        safe_limit = max(1, min(int(limit or 50), 200))
        rows = self.db.execute(text(f"""
            SELECT TOP {safe_limit}
                request_id,
                origin_text,
                destination_text,
                requested_at
            FROM route_requests
            ORDER BY requested_at DESC
        """)).mappings()
        return [dict(row) for row in rows]

    def get_candidates(self, request_id: int | None = None):
        if request_id is None:
            latest_request_id = self.db.execute(text("""
                SELECT TOP 1 request_id
                FROM route_requests
                ORDER BY requested_at DESC
            """)).scalar()
            request_id = latest_request_id

        if request_id is None:
            return []

        rows = self.db.execute(text("""
            SELECT
                cr.route_id,
                cr.request_id,
                cr.route_type,
                cr.total_distance_m,
                cr.estimated_duration_min,
                cr.created_at,
                rss.model_name,
                rss.model_version,
                rss.safety_score,
                rss.risk_score,
                rss.avg_segment_risk,
                rss.max_segment_risk,
                rss.high_risk_segment_count,
                rss.protected_bike_lane_ratio,
                rss.explanation
            FROM candidate_routes cr
            LEFT JOIN route_safety_scores rss
                ON cr.route_id = rss.route_id
            WHERE cr.request_id = :request_id
            ORDER BY cr.route_id
        """), {"request_id": request_id}).mappings()

        return [dict(row) for row in rows]

    def get_route(self, route_id: int):
        route = self.db.execute(text("""
            SELECT
                cr.route_id,
                cr.request_id,
                cr.route_type,
                cr.total_distance_m,
                cr.estimated_duration_min,
                cr.route_geom.STAsText() AS route_geom_wkt,
                cr.created_at,
                rss.model_name,
                rss.model_version,
                rss.safety_score,
                rss.risk_score,
                rss.avg_segment_risk,
                rss.max_segment_risk,
                rss.high_risk_segment_count,
                rss.protected_bike_lane_ratio,
                rss.explanation
            FROM candidate_routes cr
            LEFT JOIN route_safety_scores rss
                ON cr.route_id = rss.route_id
            WHERE cr.route_id = :route_id
        """), {"route_id": route_id}).mappings().first()

        if not route:
            return None

        segments = self._get_route_segments(route_id)
        matched_segments = [segment for segment in segments if segment["path_coordinates"]]
        segment_path = [
            point
            for segment in matched_segments
            for point in segment["path_coordinates"]
        ]
        route_geom_path = parse_wkt_path(route["route_geom_wkt"])
        path_coordinates = segment_path or route_geom_path
        unmatched_count = len(segments) - len(matched_segments)

        return {
            **dict(route),
            "path_coordinates": path_coordinates,
            "segments": segments,
            "geometry_source": "route_segments" if segment_path else "candidate_routes.route_geom",
            "partial_segment_geometry": unmatched_count > 0,
            "unmatched_segment_count": unmatched_count,
        }

    def compare_routes(self, origin: dict, destination: dict):
        candidates = self.get_candidates()
        routes = []
        warnings = []
        model_used = False

        if not candidates:
            warnings.append("No candidate_routes are available in the database.")

        for candidate in candidates:
            route = self.get_route(candidate["route_id"])
            if not route:
                continue

            if route["partial_segment_geometry"]:
                warnings.append(
                    f"Route {route['route_id']} has {route['unmatched_segment_count']} route segment id(s) "
                    "that do not match city_road_segments_stage."
                )

            model_score = self._score_route_with_model(route)
            score_source = "model" if model_score else "route_safety_scores"
            model_used = model_used or bool(model_score)

            routes.append({
                "route_id": route["route_id"],
                "route_type": route["route_type"],
                "total_distance_m": route["total_distance_m"],
                "estimated_duration_min": route["estimated_duration_min"],
                "safety_score": (model_score or {}).get("safety_score", route["safety_score"]),
                "risk_score": (model_score or {}).get("risk_score", route["risk_score"]),
                "avg_segment_risk": (model_score or {}).get("avg_segment_risk", route["avg_segment_risk"]),
                "max_segment_risk": (model_score or {}).get("max_segment_risk", route["max_segment_risk"]),
                "high_risk_segment_count": (model_score or {}).get(
                    "high_risk_segment_count",
                    route["high_risk_segment_count"],
                ),
                "protected_bike_lane_ratio": (model_score or {}).get(
                    "protected_bike_lane_ratio",
                    route["protected_bike_lane_ratio"],
                ),
                "explanation": (model_score or {}).get("explanation", route["explanation"]),
                "path_coordinates": route["path_coordinates"],
                "segments": route["segments"],
                "high_risk_segments": (model_score or {}).get("high_risk_segments", []),
                "score_source": score_source,
                "geometry_source": route["geometry_source"],
                "partial_segment_geometry": route["partial_segment_geometry"],
            })

        if not model_used and not segment_risk_model.available:
            warnings.append(segment_risk_model.error or "Segment risk model is unavailable.")

        existing_types = {route["route_type"] for route in routes}
        missing_types = [route_type for route_type in ROUTE_TYPES if route_type not in existing_types]
        if missing_types:
            warnings.append(f"Missing candidate route type(s): {', '.join(missing_types)}.")

        return {
            "origin": origin,
            "destination": destination,
            "routes": routes,
            "source": "database_candidate_routes",
            "model_inference_enabled": model_used,
            "model_path": segment_risk_model.model_path if model_used else None,
            "warnings": sorted(set(warnings)),
        }

    def _score_route_with_model(self, route: dict):
        feature_rows = [
            segment["features"]
            for segment in route["segments"]
            if not segment["geometry_missing"] and segment.get("features")
        ]

        if not feature_rows or not segment_risk_model.available:
            return None

        probabilities = segment_risk_model.predict_probabilities(feature_rows)
        if not probabilities:
            return None

        matched_segments = [
            segment
            for segment in route["segments"]
            if not segment["geometry_missing"] and segment.get("features")
        ]
        avg_risk = sum(probabilities) / len(probabilities)
        max_risk = max(probabilities)
        high_risk_segments = []

        for segment, probability in zip(matched_segments, probabilities):
            if probability >= 0.6:
                high_risk_segments.append({
                    "segment_id": segment["segment_id"],
                    "road_name": segment["road_name"],
                    "risk_probability": round(probability, 4),
                    "risk_score": round(probability * 100, 2),
                    "segment_order": segment["segment_order"],
                })

            segment["model_risk_probability"] = round(probability, 4)
            segment["model_risk_score"] = round(probability * 100, 2)

        protected_values = [
            float(segment["features"].get("has_protected_lane") or 0)
            for segment in matched_segments
        ]
        protected_ratio = (
            sum(protected_values) / len(protected_values)
            if protected_values
            else None
        )
        safety_score = max(0, min(100, round((1 - avg_risk) * 100, 2)))
        risk_score = round(avg_risk * 100, 2)

        return {
            "safety_score": safety_score,
            "risk_score": risk_score,
            "avg_segment_risk": round(avg_risk, 4),
            "max_segment_risk": round(max_risk, 4),
            "high_risk_segment_count": len(high_risk_segments),
            "protected_bike_lane_ratio": (
                round(protected_ratio, 4)
                if protected_ratio is not None
                else None
            ),
            "high_risk_segments": high_risk_segments,
            "explanation": self._build_model_explanation(
                safety_score,
                avg_risk,
                max_risk,
                len(high_risk_segments),
                route["unmatched_segment_count"],
            ),
        }

    def _build_model_explanation(
        self,
        safety_score: float,
        avg_risk: float,
        max_risk: float,
        high_risk_count: int,
        unmatched_count: int,
    ) -> str:
        parts = [
            f"Model safety score {safety_score}/100 based on matched route segment features.",
            f"Average segment risk {avg_risk:.2f}; maximum segment risk {max_risk:.2f}.",
        ]

        if high_risk_count:
            parts.append(f"{high_risk_count} high-risk segment(s) were flagged.")

        if unmatched_count:
            parts.append(f"{unmatched_count} segment(s) could not be model-scored because their IDs do not match road geometry.")

        return " ".join(parts)

    def _get_route_segments(self, route_id: int):
        rows = self.db.execute(text("""
            SELECT
                rs.route_id,
                rs.segment_id,
                rs.segment_order,
                rs.distance_on_route_m,
                s.road_name,
                s.area_type,
                s.geom_wkt,
                f.length_m,
                f.speed_limit,
                f.road_type_encoded,
                f.bike_infra_score,
                f.has_protected_lane,
                f.has_bike_lane,
                f.has_tram_track,
                f.has_onstreet_parking,
                f.intersection_count_100m,
                f.crash_count_3y,
                f.serious_crash_count_3y,
                f.cyclist_crash_count_3y,
                f.crash_density_3y,
                f.avg_daily_vehicle_volume,
                f.avg_daily_bike_volume,
                p.risk_probability,
                p.risk_score,
                p.risk_level
            FROM route_segments rs
            LEFT JOIN city_road_segments_stage s
                ON rs.segment_id = s.segment_id
            LEFT JOIN city_segment_static_features f
                ON rs.segment_id = f.segment_id
            LEFT JOIN city_segment_risk_predictions p
                ON rs.segment_id = p.segment_id
            WHERE rs.route_id = :route_id
            ORDER BY rs.segment_order
        """), {"route_id": route_id}).mappings()

        return [
            {
                "route_id": row["route_id"],
                "segment_id": row["segment_id"],
                "segment_order": row["segment_order"],
                "distance_on_route_m": row["distance_on_route_m"],
                "road_name": row["road_name"],
                "area_type": row["area_type"],
                "risk_probability": row["risk_probability"],
                "risk_score": row["risk_score"],
                "risk_level": row["risk_level"],
                "path_coordinates": parse_wkt_path(row["geom_wkt"]),
                "geometry_missing": row["geom_wkt"] is None,
                "features": {
                    "length_m": row["length_m"],
                    "speed_limit": row["speed_limit"],
                    "road_type_encoded": row["road_type_encoded"],
                    "bike_infra_score": row["bike_infra_score"],
                    "has_protected_lane": row["has_protected_lane"],
                    "has_bike_lane": row["has_bike_lane"],
                    "has_tram_track": row["has_tram_track"],
                    "has_onstreet_parking": row["has_onstreet_parking"],
                    "intersection_count_100m": row["intersection_count_100m"],
                    "crash_count_3y": row["crash_count_3y"],
                    "serious_crash_count_3y": row["serious_crash_count_3y"],
                    "cyclist_crash_count_3y": row["cyclist_crash_count_3y"],
                    "crash_density_3y": row["crash_density_3y"],
                    "avg_daily_vehicle_volume": row["avg_daily_vehicle_volume"],
                    "avg_daily_bike_volume": row["avg_daily_bike_volume"],
                },
            }
            for row in rows
        ]
