# app/api/routes.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io

from app.models.response import AnalysisResponse

from app.services.preprocessing import preprocess_image
from app.services.trend import detect_trend
from app.services.edges import extract_edges
from app.services.price_curve import extract_price_curve
from app.services.swings import detect_swings
from app.services.structure import classify_structure
from app.services.zones import build_zones
from app.services.scenarios import build_scenarios
from app.services.confidence import calculate_confidence
from app.services.image_quality import assess_image_quality
from app.services.ocr import extract_text, detect_asset, detect_timeframe
from app.services.market_phase import detect_market_phase
from app.services.bias_risk import adjust_bias_risk
from app.services.price_context import estimate_current_price

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):

    # 1. Validate image type
    if file.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Invalid image type")

    # 2. Read image bytes
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # OCR block
    ocr_text = extract_text(image)

    detected_asset = detect_asset(ocr_text)
    detected_timeframe = detect_timeframe(ocr_text)

    asset = detected_asset if detected_asset else "Unknown Asset"
    timeframe = detected_timeframe if detected_timeframe else "Unknown TF"

    if not ocr_text.strip():
       asset = "Unknown Asset"
       timeframe = "Unknown TF"



    # 3. Preprocess image
    processed_image = preprocess_image(image)

    # 4. Trend detection
    trend = detect_trend(processed_image)

    # 5. Market structure pipeline
    edges = extract_edges(processed_image)
    curve = extract_price_curve(edges)
    highs, lows = detect_swings(curve)
    structure = classify_structure(highs, lows)

    market_phase = detect_market_phase(
    trend,
    structure,
    highs,
    lows
)


    # 6. Support & resistance zones
    support_zones, resistance_zones = build_zones(highs, lows)

    # 7. Scenario builder
    scenarios = build_scenarios(trend, structure)

    current_price = estimate_current_price(highs, lows)

    risk, risk_penalty = adjust_bias_risk(
    bias=trend,
    current_price=current_price,
    support_zones=support_zones,
    resistance_zones=resistance_zones
)


    # 8. Base confidence (structure-aware)
    base_confidence = calculate_confidence(
        trend,
        structure,
        len(highs) + len(lows)
    )

    # 9. Image quality assessment (penalty system)
    quality_report = assess_image_quality(processed_image)

    confidence = round(
    max(
        base_confidence
        - quality_report["penalty"]
        - risk_penalty,
        0.3
    ),
    2
)


    # 10. Return final analysis
    return AnalysisResponse(
         asset=asset,
        timeframe=timeframe,
        trend=trend,
        structure=structure,
        market_phase=market_phase,
        bias=trend,
        risk=risk,
        confidence=confidence,
        current_price=current_price,
       

        support_zones=[{"level": z["level"]} for z in support_zones],
        resistance_zones=[{"level": z["level"]} for z in resistance_zones],
        scenarios=scenarios
    )
