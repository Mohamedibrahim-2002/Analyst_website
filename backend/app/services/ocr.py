import pytesseract
import re

def extract_text(pil_image):
    try:
        text = pytesseract.image_to_string(pil_image)
        return text.upper()
    except Exception:
        return ""


def detect_timeframe(text):
    patterns = [
        "1M", "5M", "15M", "30M",
        "1H", "4H", "1D", "1W"
    ]

    for tf in patterns:
        if tf in text:
            return tf

    return None


def detect_asset(text):
    asset_keywords = {
        "SILVER": ["SILVER", "XAG"],
        "GOLD": ["GOLD", "XAU"],
        "BTC": ["BTC", "BITCOIN"],
        "ETH": ["ETH", "ETHEREUM"]
    }

    for asset, keywords in asset_keywords.items():
        for word in keywords:
            if word in text:
                return asset

    return None
