"""Public market data — no API keys required."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import List


USER_AGENT = "agency-trade-desk/1.0 (+https://github.com/abdullajalnassai-spec/Agents)"


@dataclass(frozen=True)
class Candle:
    ts: int
    low: float
    high: float
    open: float
    close: float
    volume: float


def _get(url: str, timeout: float = 20.0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def spot_price(product: str = "BTC-USD") -> float:
    """Live spot from Coinbase public API."""
    base = product.split("-")[0]
    url = f"https://api.coinbase.com/v2/prices/{base}-USD/spot"
    data = json.loads(_get(url).decode())
    return float(data["data"]["amount"])


def candles(product: str = "BTC-USD", granularity: int = 60, limit: int = 300) -> List[Candle]:
    """
    Recent OHLCV candles from Coinbase Exchange public API.
    granularity: seconds (60 = 1m).
    Returned oldest → newest.
    """
    url = (
        f"https://api.exchange.coinbase.com/products/{product}/candles"
        f"?granularity={granularity}"
    )
    raw = json.loads(_get(url).decode())
    # Coinbase: [time, low, high, open, close, volume], newest first
    rows = sorted(raw, key=lambda r: r[0])
    out = [
        Candle(
            ts=int(r[0]),
            low=float(r[1]),
            high=float(r[2]),
            open=float(r[3]),
            close=float(r[4]),
            volume=float(r[5]),
        )
        for r in rows
    ]
    if limit and len(out) > limit:
        out = out[-limit:]
    return out


def fetch_with_fallback(product: str = "BTC-USD") -> tuple[float, List[Candle]]:
    try:
        series = candles(product)
        px = series[-1].close if series else spot_price(product)
        return px, series
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError, KeyError, IndexError, ValueError):
        px = spot_price(product)
        return px, []
