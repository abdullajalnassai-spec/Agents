# Trade Placement Desk

Paper trade placement system for **$50–$500** accounts. Implements the [Micro-Account Scalper](../finance/finance-micro-account-scalper.md) protocol as a runnable CLI.

**This desk places paper trades only.** It reads public Coinbase market data, writes order tickets, resolves them on recent 1-minute candle tape, and journals the session. It will **never** send live orders to an exchange.

## Why paper?

At $100, the professional path is track record → prop evaluation → funded size. Live micro-scalping usually donates the bankroll to spreads. The desk still *places* trades end-to-end so you can run a complete session today without risking rent money.

## Quick start

```bash
cd trade-desk

# Venue screen
python3 run.py screen

# Sizing card at live spot
python3 run.py size --account 100

# Place a complete session (up to 3 paper trades)
python3 run.py run --account 100 --confirm-disposable
```

Outputs land in `trade-desk/data/`:

| File | Purpose |
|------|---------|
| `orders.jsonl` | Every order ticket |
| `journal.csv` | Append-only trade journal |
| `last_session_report.md` | Full session memo |
| `last_session.json` | Machine-readable summary |

## Protocol (hard-coded)

| Rule | Value |
|------|-------|
| Risk / trade | 1% of account |
| Daily stop | 3% |
| Weekly stop | 6% |
| Max trades / day | 3 |
| Target | 1.5R |
| Instruments | BTC-USD, ETH-USD spot |
| Disposable capital | `--confirm-disposable` required |
| Live broker orders | Always rejected |

## Setup used

1. **Primary:** Opening-range break + retest on the first 15 one-minute bars of the loaded window.
2. **Fallback:** Momentum continuation signals if ORB is quiet — so a `--run` always completes a full session against real tape.

## Honest math reminder

At $100 and 1% risk ($1), even a solid +0.125R expectancy is ~$0.38/day. This account builds a journal for a prop-firm evaluation — it does not pay bills. For cash this week, use the [$50 Survival Strike Team](../examples/workflow-50-dollar-survival.md).

## Agent companion

Activate **Trade Placement Operator** (`finance/finance-trade-placement-operator.md`) in your AI tool, then run this CLI for execution.
