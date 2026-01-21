# app/services/image_quality.py
import cv2
import numpy as np

def assess_image_quality(processed_image):
    # Blur detection using Laplacian variance
    blur_score = cv2.Laplacian(processed_image, cv2.CV_64F).var()

    # Contrast score
    contrast_score = processed_image.std()

    quality = "Good"
    penalty = 0.0

    if blur_score < 80:
        quality = "Low"
        penalty += 0.15

    if contrast_score < 30:
        quality = "Low"
        penalty += 0.15

    return {
        "quality": quality,
        "blur_score": round(blur_score, 2),
        "contrast_score": round(contrast_score, 2),
        "penalty": penalty
    }
