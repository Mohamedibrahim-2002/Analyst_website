# app/services/zones.py
def build_zones(highs, lows, tolerance=8):
    """
    Groups nearby swing points into zones.
    tolerance = how close points must be to belong to same zone
    """

    def group(points):
        zones = []
        for _, y in points:
            placed = False
            for zone in zones:
                if abs(zone["level"] - y) <= tolerance:
                    zone["points"].append(y)
                    zone["level"] = sum(zone["points"]) / len(zone["points"])
                    placed = True
                    break
            if not placed:
                zones.append({"level": y, "points": [y]})
        return zones

    resistance_zones = group(highs)
    support_zones = group(lows)

    return support_zones, resistance_zones
