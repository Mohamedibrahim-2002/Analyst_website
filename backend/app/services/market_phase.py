# app/services/market_phase.py

def detect_market_phase(trend, structure, highs, lows):
    swing_count = len(highs) + len(lows)

    # Low activity → accumulation
    if swing_count < 4:
        return "Accumulation"

    # Strong continuation
    if trend == "Bullish" and "Higher Highs" in structure:
        return "Expansion"

    if trend == "Bearish" and "Lower Highs" in structure:
        return "Expansion"

    # Trend exists but structure weakens
    if trend == "Bullish" and "Lower" in structure:
        return "Distribution"

    if trend == "Bearish" and "Higher" in structure:
        return "Distribution"

    # Structural disagreement → possible reversal
    if "Transition" in structure:
        return "Reversal"

    return "Developing"
