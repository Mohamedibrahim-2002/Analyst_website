# app/services/bias_risk.py

def adjust_bias_risk(
    bias,
    current_price,
    support_zones,
    resistance_zones,
    threshold_pct=0.015  # 1.5%
):
    risk = "Medium"
    penalty = 0.0

    if not current_price:
        return risk, penalty

    # Distance helpers
    def is_near(level):
        return abs(current_price - level) / current_price <= threshold_pct

    # Bearish near support → dangerous
    if bias == "Bearish":
        for z in support_zones:
            if is_near(z["level"]):
                risk = "High"
                penalty = 0.15
                break

    # Bullish near resistance → dangerous
    if bias == "Bullish":
        for z in resistance_zones:
            if is_near(z["level"]):
                risk = "High"
                penalty = 0.15
                break

    return risk, penalty
