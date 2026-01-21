# app/services/price_curve.py
import numpy as np

def extract_price_curve(edges):
    height, width = edges.shape
    curve = []

    for x in range(width):
        column = edges[:, x]
        ys = np.where(column > 0)[0]

        if len(ys) > 0:
            curve.append(np.mean(ys))
        else:
            curve.append(None)

    return curve
