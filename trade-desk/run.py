#!/usr/bin/env python3
"""
Trade Placement Desk — paper trading for $50–$500 accounts.

Places real order tickets against live public market data, resolves them on
recent candle tape, and journals the session. Never sends live broker orders.

Usage:
  python3 run.py screen
  python3 run.py size --account 100
  python3 run.py run --account 100 --confirm-disposable
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow `python3 run.py` from trade-desk/
sys.path.insert(0, str(Path(__file__).resolve().parent))

from trade_desk.config import DEFAULT_INSTRUMENT, LIMITS
from trade_desk.market import fetch_with_fallback, spot_price
from trade_desk.protocol import honest_math, size_trade, venue_screen
from trade_desk.session import run_complete_session


def cmd_screen(args: argparse.Namespace) -> int:
    for inst in ("BTC-USD", "ETH-USD"):
        v = venue_screen(inst)
        print(f"=== {inst} ===")
        for k, val in v.items():
            print(f"  {k}: {val}")
        print()
    return 0


def cmd_size(args: argparse.Namespace) -> int:
    price = spot_price(args.instrument)
    card = size_trade(args.account, price, args.instrument)
    print(f"Spot {args.instrument}: ${price:,.2f}")
    print(f"account            = ${card.account:.2f}")
    print(f"risk_per_trade     = ${card.risk_per_trade:.2f}")
    print(f"position_notional  = ${card.position_notional:.2f}")
    print(f"daily_stop         = ${card.daily_stop:.2f}")
    print(f"weekly_stop        = ${card.weekly_stop:.2f}")
    print(f"cost % of stop     = {card.cost_pct_of_stop:.1%}")
    print(f"venue_ok           = {card.venue_ok} — {card.reason}")
    m = honest_math(risk=card.risk_per_trade)
    print(f"honest $/day       ≈ ${m['expected_usd_per_day']:+.2f} (illustrative)")
    print(m["note"])
    return 0 if card.venue_ok else 2


def cmd_run(args: argparse.Namespace) -> int:
    report = run_complete_session(
        account=args.account,
        instrument=args.instrument,
        confirm_disposable=args.confirm_disposable,
        live=args.live,
    )
    print(report)
    out = Path(__file__).resolve().parent / "data" / "last_session_report.md"
    print(f"\nReport written to {out}")
    return 0 if report.startswith("# Trade Desk Session Report") else 1


def cmd_price(args: argparse.Namespace) -> int:
    px, series = fetch_with_fallback(args.instrument)
    print(f"{args.instrument} spot≈ ${px:,.2f}  candles={len(series)}")
    if series:
        c = series[-1]
        print(f"last 1m O={c.open:.2f} H={c.high:.2f} L={c.low:.2f} C={c.close:.2f}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Micro-account paper trade placement desk")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("screen", help="Venue & instrument screen")
    s.set_defaults(func=cmd_screen)

    z = sub.add_parser("size", help="Print sizing card for current spot")
    z.add_argument("--account", type=float, default=LIMITS.default_account)
    z.add_argument("--instrument", default=DEFAULT_INSTRUMENT)
    z.set_defaults(func=cmd_size)

    r = sub.add_parser("run", help="Place a complete paper session (up to 3 trades)")
    r.add_argument("--account", type=float, default=LIMITS.default_account)
    r.add_argument("--instrument", default=DEFAULT_INSTRUMENT)
    r.add_argument(
        "--confirm-disposable",
        action="store_true",
        help="Attest capital is fully lossable (required)",
    )
    r.add_argument(
        "--live",
        action="store_true",
        help="Attempt live (always rejected — desk is paper-only)",
    )
    r.set_defaults(func=cmd_run)

    px = sub.add_parser("price", help="Fetch live spot + candle count")
    px.add_argument("--instrument", default=DEFAULT_INSTRUMENT)
    px.set_defaults(func=cmd_price)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
