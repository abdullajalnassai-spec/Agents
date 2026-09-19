"""One-setup playbook: opening-range break and retest."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from .broker import Side
from .market import Candle


@dataclass(frozen=True)
class SetupSignal:
    side: Side
    entry: float
    stop: float
    target: float
    bar_index: int
    thesis: str


def find_orb_retest(
    series: List[Candle],
    orb_bars: int = 15,
    target_r: float = 1.5,
    stop_buffer_pct: float = 0.0005,
    max_signals: int = 3,
    cooldown_bars: int = 25,
) -> List[SetupSignal]:
    """
    Opening-range = first `orb_bars` candles of the series window.
    Signal: close beyond range, then a retest that holds.
    Cooldown prevents one retest cluster from becoming three tickets.
    """
    if len(series) < orb_bars + 10:
        return []

    orb = series[:orb_bars]
    hi = max(c.high for c in orb)
    lo = min(c.low for c in orb)
    if hi <= lo:
        return []

    signals: List[SetupSignal] = []
    broke_up = False
    broke_down = False
    cooldown_until = -1

    for i in range(orb_bars, len(series)):
        if len(signals) >= max_signals:
            break
        if i < cooldown_until:
            continue

        c = series[i]
        prev = series[i - 1]

        if not broke_up and c.close > hi:
            broke_up = True
        if not broke_down and c.close < lo:
            broke_down = True

        # Long retest
        if broke_up and prev.close > hi and c.low <= hi * (1 + stop_buffer_pct) and c.close > hi:
            entry = hi
            stop = min(c.low, lo) * (1 - stop_buffer_pct)
            risk = entry - stop
            if risk > 0:
                target = entry + risk * target_r
                signals.append(
                    SetupSignal(
                        side=Side.BUY,
                        entry=entry,
                        stop=stop,
                        target=target,
                        bar_index=i,
                        thesis=f"ORB long retest — range {lo:.2f}-{hi:.2f}, hold above {hi:.2f}",
                    )
                )
                broke_up = False
                cooldown_until = i + cooldown_bars
                continue

        # Short retest
        if broke_down and prev.close < lo and c.high >= lo * (1 - stop_buffer_pct) and c.close < lo:
            entry = lo
            stop = max(c.high, hi) * (1 + stop_buffer_pct)
            risk = stop - entry
            if risk > 0:
                target = entry - risk * target_r
                signals.append(
                    SetupSignal(
                        side=Side.SELL,
                        entry=entry,
                        stop=stop,
                        target=target,
                        bar_index=i,
                        thesis=f"ORB short retest — range {lo:.2f}-{hi:.2f}, hold below {lo:.2f}",
                    )
                )
                broke_down = False
                cooldown_until = i + cooldown_bars

    return signals


def fallback_momentum_signals(
    series: List[Candle],
    stop_pct: float,
    target_r: float = 1.5,
    max_signals: int = 3,
) -> List[SetupSignal]:
    """Spaced momentum signals so a complete session can still fill the day."""
    signals: List[SetupSignal] = []
    if len(series) < 40:
        return signals

    anchors = [
        len(series) // 4,
        len(series) // 2,
        (3 * len(series)) // 4,
    ]
    for i in anchors:
        if len(signals) >= max_signals:
            break
        i = max(10, min(i, len(series) - 6))
        c = series[i]
        window = series[i - 5 : i]
        up = c.close >= window[0].close
        entry = c.close
        if up:
            stop = entry * (1 - stop_pct)
            risk = entry - stop
            target = entry + risk * target_r
            side = Side.BUY
            thesis = f"Momentum continuation (fallback@{i}) — 5-bar higher"
        else:
            stop = entry * (1 + stop_pct)
            risk = stop - entry
            target = entry - risk * target_r
            side = Side.SELL
            thesis = f"Momentum continuation (fallback@{i}) — 5-bar lower"
        signals.append(
            SetupSignal(
                side=side,
                entry=entry,
                stop=stop,
                target=target,
                bar_index=i,
                thesis=thesis,
            )
        )
    return signals
