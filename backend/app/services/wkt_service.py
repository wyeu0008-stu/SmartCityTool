import re


POINT_RE = re.compile(r"POINT\s*\(\s*([-0-9.]+)\s+([-0-9.]+)\s*\)", re.IGNORECASE)
NUMBER_PAIR_RE = re.compile(r"([-0-9.]+)\s+([-0-9.]+)")


def parse_wkt_point(wkt: str | None) -> dict | None:
    if not wkt:
        return None

    match = POINT_RE.search(wkt)
    if not match:
        return None

    lng, lat = match.groups()
    return {"lat": float(lat), "lng": float(lng)}


def parse_wkt_path(wkt: str | None) -> list[dict]:
    if not wkt:
        return []

    coordinates = []
    for lng, lat in NUMBER_PAIR_RE.findall(wkt):
        coordinates.append({"lat": float(lat), "lng": float(lng)})

    return coordinates


def latlng_dicts_to_leaflet_path(coordinates: list[dict]) -> list[list[float]]:
    return [[point["lat"], point["lng"]] for point in coordinates]
