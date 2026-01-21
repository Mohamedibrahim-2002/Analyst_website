# app/services/confidence.py
def calculate_confidence(trend, structure, swing_count):
    score = 0.4

    if trend in ["Bullish", "Bearish"]:
        score += 0.2

    if "Higher" in structure or "Lower" in structure:
        score += 0.2

    if swing_count >= 4:
        score += 0.1

    return round(min(score, 0.9), 2)
