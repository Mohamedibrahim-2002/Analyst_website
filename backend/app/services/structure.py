# app/services/structure.py
def classify_structure(highs, lows):
    if len(highs) < 2 or len(lows) < 2:
        return "Insufficient data"

    last_highs = [h[1] for h in highs[-2:]]
    last_lows = [l[1] for l in lows[-2:]]

    if last_highs[1] > last_highs[0] and last_lows[1] > last_lows[0]:
        return "Higher Highs / Higher Lows"

    if last_highs[1] < last_highs[0] and last_lows[1] < last_lows[0]:
        return "Lower Highs / Lower Lows"

    return "Transition / Range"
