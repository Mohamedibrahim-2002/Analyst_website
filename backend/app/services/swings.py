# app/services/swings.py
def detect_swings(curve, window=10):
    highs = []
    lows = []

    for i in range(window, len(curve) - window):
        if curve[i] is None:
            continue

        left = curve[i - window:i]
        right = curve[i + 1:i + window]

        if None in left or None in right:
            continue

        if curve[i] > max(left) and curve[i] > max(right):
            highs.append((i, curve[i]))

        if curve[i] < min(left) and curve[i] < min(right):
            lows.append((i, curve[i]))

    return highs, lows
