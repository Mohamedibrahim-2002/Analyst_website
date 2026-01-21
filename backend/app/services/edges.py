# app/services/edges.py
import cv2

def extract_edges(processed_image):
    edges = cv2.Canny(
        processed_image,
        threshold1=50,
        threshold2=150
    )
    return edges
