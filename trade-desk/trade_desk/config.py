"""Desk defaults — Micro-Account Scalper protocol numbers."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RiskLimits:
    risk_pct_per_trade: float = 0.01
    daily_stop_pct: float = 0.03
    weekly_stop_pct: float = 0.06
    max_trades_per_day: int = 3
    max_consecutive_losses: int = 3
    min_target_r: float = 1.5
    max_cost_pct_of_stop: float = 0.20
    max_account: float = 500.0
    default_account: float = 100.0


LIMITS = RiskLimits()

# Round-trip cost assumptions for paper venue (Coinbase spot maker-ish)
VENUES = {
    "BTC-USD": {
        "name": "BTC-USD spot (Coinbase public tape, limit/maker)",
        "min_notional": 10.0,
        # Maker-leaning round trip (~6 bps). Marketable takes fail the 20% cost gate.
        "round_trip_cost_pct": 0.0006,
        "session": "24/7 (US/EU overlap preferred)",
        "verdict": "GO",
    },
    "ETH-USD": {
        "name": "ETH-USD spot (Coinbase public tape, limit/maker)",
        "min_notional": 10.0,
        "round_trip_cost_pct": 0.0006,
        "session": "24/7 (US/EU overlap preferred)",
        "verdict": "GO",
    },
}

DEFAULT_INSTRUMENT = "BTC-USD"
# 0.6% stop → round-trip cost ≈ 10% of risk at maker fees (under the 20% veto).
DEFAULT_STOP_PCT = 0.006
