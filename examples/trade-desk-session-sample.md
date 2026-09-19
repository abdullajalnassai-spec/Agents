# Trade Desk Session Report

**When:** 2026-09-19 13:06 UTC
**Mode:** paper-replay (paper — no live exchange orders)
**Account:** $100.00
**Instrument:** BTC-USD

## Venue screen
```
instrument: BTC-USD
name: BTC-USD spot (Coinbase public tape, limit/maker)
min_notional: 10.0
round_trip_cost_pct: 0.0006
session: 24/7 (US/EU overlap preferred)
verdict: GO
```

## Sizing card
```
account            = $100.00
risk_per_trade     = $1.00 (1%)
stop_pct           = 0.60%
stop_distance      = $487.87
position_notional  = $166.67
daily_stop         = $3.00
weekly_stop        = $6.00
max_trades_per_day = 3
target             = 1.5R
round_trip_cost    = $0.100 (10% of stop)
venue_ok           = True (OK)
```

## Orders placed
| ID | Side | Entry | Stop | Target | Exit | R | PnL | Reason |
|----|------|-------|------|--------|------|---|-----|--------|
| 5f52b2e8 | BUY | 81241.70 | 81008.98 | 81590.79 | 81310.91 | +0.30 | $+0.30 | session end (mark-to-market) |
| 6eb0b025 | BUY | 81459.92 | 80971.16 | 82193.06 | 81310.91 | -0.30 | $-0.30 | session end (mark-to-market) |
| d92e75b9 | SELL | 81201.42 | 81688.63 | 80470.61 | 81310.91 | -0.22 | $-0.22 | session end (mark-to-market) |

## Session P&L
- Trades closed: 3
- Rejected: 0
- Wins / losses: 1 / 2
- Session PnL: **$-0.23**
- Ending equity (paper): **$99.77**

## Honest math
```
Expectancy/trade ≈ -0.077R → $-0.08
At 3 trades/day ≈ $-0.23/day
Purpose of this account: track record, not rent. Income path = funded account.
```

## Rules reminder
- Daily stop 3% / weekly 6% / max 3 trades — hardware switches.
- Demo 40 → live min size → 100 clean lives → prop eval.
- This desk never places live broker orders.
