import pandas as pd
from datetime import datetime, timedelta

CSV_FILE = "data/consumption_log.csv"

def predict_refill(item_name):
    df = pd.read_csv(CSV_FILE, parse_dates=["date_consumed"])
    df = df[df["item_name"] == item_name]

    if len(df) < 3:
        return "Not enough data for prediction."

    df["date_consumed"] = pd.to_datetime(df["date_consumed"])
    df = df.sort_values("date_consumed")

    # Simple Moving Average
    df["daily_usage"] = df["quantity_used"] / ((df["date_consumed"].diff().dt.days).fillna(1))
    avg_daily_usage = df["daily_usage"].mean()

    if avg_daily_usage <= 0:
        return "Invalid consumption data."

    remaining_stock = df.iloc[-1]["remaining_stock"]
    days_until_empty = remaining_stock / avg_daily_usage
    refill_date = datetime.now() + timedelta(days=days_until_empty)

    return f"Refill needed by {refill_date.strftime('%Y-%m-%d')}"
