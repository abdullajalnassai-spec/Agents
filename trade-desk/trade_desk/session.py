"""Complete session runner — venue → size → place → resolve → journal."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from .broker import PaperBroker, Status
from .config import DEFAULT_INSTRUMENT, DEFAULT_STOP_PCT, LIMITS
from .journal import Journal
from .market import Candle, fetch_with_fallback
from .protocol import size_trade, venue_screen
from .strategy import fallback_momentum_signals, find_orb_retest


def _fmt_venue(instrument: str) -> str:
    v = venue_screen(instrument)
    lines = [f"{k}: {val}" for k, val in v.items()]
    return "\n".join(lines)


def _fmt_sizing(card) -> str:
    return "\n".join(
        [
            f"account            = ${card.account:.2f}",
            f"risk_per_trade     = ${card.risk_per_trade:.2f} ({LIMITS.risk_pct_per_trade:.0%})",
            f"stop_pct           = {card.stop_pct:.2%}",
            f"stop_distance      = ${card.stop_distance:.2f}",
            f"position_notional  = ${card.position_notional:.2f}",
            f"daily_stop         = ${card.daily_stop:.2f}",
            f"weekly_stop        = ${card.weekly_stop:.2f}",
            f"max_trades_per_day = {card.max_trades}",
            f"target             = {card.target_r}R",
            f"round_trip_cost    = ${card.round_trip_cost:.3f} ({card.cost_pct_of_stop:.0%} of stop)",
            f"venue_ok           = {card.venue_ok} ({card.reason})",
        ]
    )


def run_complete_session(
    account: float = 100.0,
    instrument: str = DEFAULT_INSTRUMENT,
    confirm_disposable: bool = False,
    live: bool = False,
    data_dir: Optional[Path] = None,
) -> str:
    """
    Run a full paper trading session against recent real market candles.
    Places up to 3 trades, resolves them on subsequent tape, journals everything.
    """
    root = Path(__file__).resolve().parents[1]
    data_dir = data_dir or (root / "data")
    data_dir.mkdir(parents=True, exist_ok=True)

    if live:
        return (
            "REJECTED: live mode is disabled.\n"
            "This trade desk places PAPER trades only. "
            "It will not send orders to Coinbase, Kraken, or any broker."
        )

    if not confirm_disposable:
        return (
            "BLOCKED: pass --confirm-disposable to attest this bankroll is fully lossable "
            "(not rent/food/transport). Micro-Account Scalper rule #1."
        )

    if account > LIMITS.max_account:
        return f"BLOCKED: account ${account:.2f} exceeds desk max ${LIMITS.max_account:.0f}."

    price, series = fetch_with_fallback(instrument)
    if not series:
        return "BLOCKED: could not load market candles."

    card = size_trade(account, price, instrument, DEFAULT_STOP_PCT)
    venue_text = _fmt_venue(instrument)
    sizing_text = _fmt_sizing(card)

    if not card.venue_ok:
        report = (
            f"# Session aborted — venue/sizing NO-GO\n\n"
            f"## Venue\n```\n{venue_text}\n```\n\n"
            f"## Sizing\n```\n{sizing_text}\n```\n"
        )
        (data_dir / "last_session_report.md").write_text(report, encoding="utf-8")
        return report

    # At most one ORB ticket, then fill the day with spaced momentum setups
    orb = find_orb_retest(series, target_r=card.target_r, max_signals=1)
    extra = fallback_momentum_signals(
        series,
        stop_pct=DEFAULT_STOP_PCT,
        target_r=card.target_r,
        max_signals=card.max_trades,
    )
    signals = orb + extra

    # Drop near-duplicate tickets: same side within 10 bars, or identical entry+stop
    unique = []
    for sig in signals:
        dup = False
        for s in unique:
            if s.side != sig.side:
                continue
            if abs(s.bar_index - sig.bar_index) < 10:
                dup = True
                break
            if abs(s.entry - sig.entry) < 1e-6 and abs(s.stop - sig.stop) < 1e-6:
                dup = True
                break
        if not dup:
            unique.append(sig)
    signals = unique[: card.max_trades]

    if not signals:
        report = (
            "# Session aborted — no valid setups in loaded tape\n\n"
            f"## Venue\n```\n{venue_text}\n```\n\n"
            f"## Sizing\n```\n{sizing_text}\n```\n"
        )
        (data_dir / "last_session_report.md").write_text(report, encoding="utf-8")
        return report

    broker = PaperBroker(data_dir)
    day_pnl = 0.0
    consecutive_losses = 0
    placed = []

    for sig in signals:
        if len(placed) >= card.max_trades:
            break
        if day_pnl <= -card.daily_stop:
            break
        if consecutive_losses >= LIMITS.max_consecutive_losses:
            break

        # Recompute units from THIS signal's stop distance so risk stays ≈ 1%
        stop_dist = abs(sig.entry - sig.stop)
        if stop_dist <= 0:
            continue
        units = card.risk_per_trade / stop_dist
        order = broker.place(
            instrument=instrument,
            side=sig.side,
            entry=sig.entry,
            stop=sig.stop,
            target=sig.target,
            units=units,
            risk_usd=card.risk_per_trade,
            setup=sig.thesis[:80],
            live=False,
        )
        if order.status == Status.REJECTED:
            placed.append(order)
            continue

        # Resolve on subsequent candles
        resolved = False
        for c in series[sig.bar_index + 1 :]:
            if broker.resolve_on_candle(order, c.high, c.low, c.close):
                resolved = True
                break
        if not resolved:
            # End of tape — mark to last close
            last: Candle = series[-1]
            broker.force_close(order, last.close, "session end (mark-to-market)")

        placed.append(order)
        day_pnl += order.pnl_usd
        if order.pnl_usd <= 0:
            consecutive_losses += 1
        else:
            consecutive_losses = 0

    journal = Journal(data_dir)
    journal.write_rows(placed)
    report = journal.write_report(
        account=account,
        instrument=instrument,
        orders=placed,
        sizing_text=sizing_text,
        venue_text=venue_text,
        mode="paper-replay",
    )
    return report
