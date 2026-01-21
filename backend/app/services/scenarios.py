# app/services/scenarios.py
def build_scenarios(trend, structure):
    if trend == "Bullish" and "Higher" in structure:
        primary = (
            "Price is maintaining a bullish structure with higher highs and higher lows. "
            "As long as pullbacks remain shallow and structure holds, continuation remains the preferred scenario."
        )
        alternate = (
            "If upside momentum weakens, price may consolidate within a range before attempting continuation."
        )
        invalidation = (
            "A decisive break below the most recent higher low would invalidate the bullish structure."
        )

    elif trend == "Bearish" and "Lower" in structure:
        primary = (
            "Price is respecting a bearish structure with lower highs and lower lows. "
            "Rallies into resistance zones may attract selling pressure, favoring continuation to the downside."
        )
        alternate = (
            "A period of sideways consolidation may occur if selling pressure temporarily weakens."
        )
        invalidation = (
            "A sustained move above the most recent lower high would invalidate the bearish structure."
        )

    else:
        primary = (
            "Market structure is mixed, suggesting a transitional or ranging environment."
        )
        alternate = (
            "Price may continue oscillating within established boundaries until a clear directional break occurs."
        )
        invalidation = (
            "A clean break with follow-through would signal the start of a new structural phase."
        )

    return {
        "primary": primary,
        "alternate": alternate,
        "invalidation": invalidation
    }
