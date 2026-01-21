# app/services/preprocessing.py
import cv2
import numpy as np

def preprocess_image(pil_image):
    # Convert PIL → OpenCV
    image = np.array(pil_image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # Resize to standard width
    height, width = image.shape[:2]
    scale = 1000 / width
    resized = cv2.resize(image, (1000, int(height * scale)))

    # Grayscale
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

    # Improve contrast
    enhanced = cv2.equalizeHist(gray)

    # Blur to remove noise
    blurred = cv2.GaussianBlur(enhanced, (5, 5), 0)

    return blurred
