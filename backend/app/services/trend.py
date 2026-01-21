# app/services/trend.py
import numpy as np

def detect_trend(processed_image):
    # Average brightness per column
    column_means = np.mean(processed_image, axis=0)

    # Compare start vs end
    start = np.mean(column_means[:50])
    end = np.mean(column_means[-50:])

    if end < start:
        return "Bullish"
    elif end > start:
        return "Bearish"
    else:
        return "Sideways"
