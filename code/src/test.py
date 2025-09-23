import os
import google.generativeai as genai
from fastapi import FastAPI, Request
from pydantic import BaseModel
import uvicorn

# configure Gemini
genai.configure(api_key="AIzaSyBRycluanWR13XpAuhl5nhV6DIlXz-AGuY")
model = genai.GenerativeModel("gemini-2.5-flash")  # or gemini-1.5-pro

def get_risk_score(transactions):
    """
    transactions: list of dicts like
    [{"amount": 250, "merchant": "Amazon", "country": "IN", "timestamp": "2025-09-22T12:00:00"}]
    """
    # prepare prompt
    tx_str = "\n".join([str(tx) for tx in transactions[-10:]])  # last 10 txs
    prompt = f"""
You are a financial transaction risk scoring engine.
Given the following user transactions:

{tx_str}


Scoring rules:
•⁠  ⁠Always return a score between 1 and 10.
•⁠  ⁠Scores 1–4 = SAFE / LOW RISK (normal spending).
•⁠  ⁠Scores 5–10 = RISKY / HIGH RISK (potential fraud or anomaly).
•⁠  ⁠A score closer to 10 means more suspicious.

When scoring, check for these patterns:
•⁠  ⁠Sudden spikes in transaction amounts compared to previous history.
•⁠  ⁠Many transactions in a short time window (velocity).
•⁠  ⁠Transactions to unusual or high-risk recipients (e.g., crypto exchanges, unknown merchants, suspicious countries).
•⁠  ⁠Unusual location or country compared to past transactions.
•⁠  ⁠Any transaction pattern that doesn’t match user’s usual behavior.

If no major risk flags are detected → return score between 1–4.
If moderate anomalies → return 5–7.
If multiple red flags or severe anomaly → return 8–10.

Your output format must always be:
<number>
"""

    response = model.generate_content(prompt)
    print("Gemini response:", response.text)
    # Extract number from response and convert to integer
    try:
        risk_score = int(response.text.strip().replace("<", "").replace(">", ""))
        # Ensure score is between 1 and 10
        risk_score = max(1, min(10, risk_score))
        return risk_score
    except ValueError:
        return 1 

# --- FastAPI setup ---
app = FastAPI()

class TransactionsRequest(BaseModel):
    transactions: list

@app.post("/getriskscore")
async def getriskscore_endpoint(req: TransactionsRequest):
    result = get_risk_score(req.transactions)
    return {"risk_score": result}  # Changed from "result" to "risk_score"

# Optional: run with `python test.py`
if __name__ == "__main__":
    uvicorn.run("test:app", host="0.0.0.0", port=8000, reload=True)

