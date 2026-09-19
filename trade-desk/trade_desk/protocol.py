"""Risk protocol — sizing, stops, venue screen."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .config import DEFAULT_STOP_PCT, LIMITS, VENUES


@dataclass
class SizingCard:
    account: float
    risk_per_trade: float
    stop_pct: float
    stop_distance: float
    position_notional: float
    daily_stop: float
    weekly_stop: float
    max_trades: int
    target_r: float
    round_trip_cost: float
    cost_pct_of_stop: float
    venue_ok: bool
    reason: str


def venue_screen(instrument: str) -> dict:
    info = VENUES.get(instrument)
    if not info:
        return {
            "instrument": instrument,
            "verdict": "NO-GO",
            "reason": "Unknown instrument — use BTC-USD or ETH-USD",
        }
    return {"instrument": instrument, **info}


def size_trade(
    account: float,
    price: float,
    instrument: str = "BTC-USD",
    stop_pct: float = DEFAULT_STOP_PCT,
) -> SizingCard:
    if account <= 0 or account > LIMITS.max_account:
        return SizingCard(
            account=account,
            risk_per_trade=0,
            stop_pct=stop_pct,
            stop_distance=0,
            position_notional=0,
            daily_stop=0,
            weekly_stop=0,
            max_trades=0,
            target_r=LIMITS.min_target_r,
            round_trip_cost=0,
            cost_pct_of_stop=1,
            venue_ok=False,
            reason=f"Account must be >0 and ≤ ${LIMITS.max_account:.0f}",
        )

    risk = account * LIMITS.risk_pct_per_trade
    stop_distance = price * stop_pct
    if stop_distance <= 0:
        return SizingCard(
            account=account,
            risk_per_trade=risk,
            stop_pct=stop_pct,
            stop_distance=0,
            position_notional=0,
            daily_stop=account * LIMITS.daily_stop_pct,
            weekly_stop=account * LIMITS.weekly_stop_pct,
            max_trades=LIMITS.max_trades_per_day,
            target_r=LIMITS.min_target_r,
            round_trip_cost=0,
            cost_pct_of_stop=1,
            venue_ok=False,
            reason="Invalid stop distance",
        )

    # Units such that $ move of stop_distance loses exactly risk
    units = risk / stop_distance
    notional = units * price

    venue = VENUES.get(instrument, {})
    cost_pct = float(venue.get("round_trip_cost_pct", 0.002))
    round_trip_cost = notional * cost_pct
    cost_pct_of_stop = (round_trip_cost / risk) if risk else 1.0

    ok = True
    reasons = []
    if notional < float(venue.get("min_notional", 10)):
        ok = False
        reasons.append(f"Notional ${notional:.2f} below venue min")
    if cost_pct_of_stop > LIMITS.max_cost_pct_of_stop:
        ok = False
        reasons.append(
            f"Round-trip cost {cost_pct_of_stop:.0%} of stop exceeds {LIMITS.max_cost_pct_of_stop:.0%}"
        )
    if venue.get("verdict") != "GO":
        ok = False
        reasons.append("Venue verdict NO-GO")

    return SizingCard(
        account=account,
        risk_per_trade=risk,
        stop_pct=stop_pct,
        stop_distance=stop_distance,
        position_notional=notional,
        daily_stop=account * LIMITS.daily_stop_pct,
        weekly_stop=account * LIMITS.weekly_stop_pct,
        max_trades=LIMITS.max_trades_per_day,
        target_r=LIMITS.min_target_r,
        round_trip_cost=round_trip_cost,
        cost_pct_of_stop=cost_pct_of_stop,
        venue_ok=ok,
        reason="OK" if ok else "; ".join(reasons),
    )


def honest_math(win_rate: float = 0.45, avg_win_r: float = 1.5, avg_loss_r: float = 1.0, risk: float = 1.0, trades_per_day: int = 3) -> dict:
    expectancy_r = (win_rate * avg_win_r) - ((1 - win_rate) * avg_loss_r)
    return {
        "expectancy_r": expectancy_r,
        "expected_usd_per_trade": expectancy_r * risk,
        "expected_usd_per_day": expectancy_r * risk * trades_per_day,
        "note": "Purpose of this account: track record, not rent. Income path = funded account.",
    }
