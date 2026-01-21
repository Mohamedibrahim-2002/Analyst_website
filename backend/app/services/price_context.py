# app/services/price_context.py

def extract_price(point):
    """
    Supports:
    - tuple: (index, price)
    - dict: {"price": value}
    """
    if isinstance(point, dict):
        return point.get("price")

    if isinstance(point, (list, tuple)) and len(point) >= 2:
        return point[1]

    return None


def estimate_current_price(highs, lows):
    if highs:
        price = extract_price(highs[-1])
        if price is not None:
            return price

    if lows:
        price = extract_price(lows[-1])
        if price is not None:
            return price

    return None
