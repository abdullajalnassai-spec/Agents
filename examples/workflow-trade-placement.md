# Multi-Agent Workflow: Trade Placement Desk

> From "place trades for me" to a complete paper session — tickets written, risk capped, journal updated. No live broker routing.

## The Scenario

You want professional scalping on a **$100 max** sleeve. You need trades *placed*, not another pep talk. The desk runs end-to-end against live public market data in **paper mode**.

## Agent Team

| Agent | Role |
|-------|------|
| Micro-Trading Risk Officer | Go/No-Go if capital is survival-adjacent |
| Micro-Account Scalper | Protocol owner (1% risk, stops, ladder) |
| Trade Placement Operator | Runs the CLI, places tickets, closes the day |

## The Workflow

### 1. Gate

```
Activate Micro-Trading Risk Officer.
Sleeve: $100. Disposable: [Y/N]. Floor (food/shelter/phone 7d): [Y/N].
Issue Go/No-Go. If NO-GO → stop; use Survival Strike Team instead.
```

### 2. Protocol

```
Activate Micro-Account Scalper.
Account $100. Instrument preference: BTC-USD.
Confirm venue screen + sizing card + honest math.
```

### 3. Place trades (complete session)

```
Activate Trade Placement Operator.
Attest disposable capital. Run:

  cd trade-desk
  python3 run.py run --account 100 --confirm-disposable

Return the session report and ladder status.
```

### 4. Review

- Read `trade-desk/data/last_session_report.md`
- Append emotion score 1–5 to your own notes
- If daily stop hit → done for the day
- Demo gate: 40 journaled trades before any live dollar elsewhere

## Expected Outputs

1. Venue screen + sizing card  
2. Up to 3 paper order tickets with entry/stop/target  
3. Resolved P&L against real candle tape  
4. Journal CSV + markdown session report  
5. Explicit reminder: live orders are not sent by this desk  

## Design Principle

**Execution without gambling the rent.** Complete placement means tickets + risk limits + journal — not a live all-in on a phone app.
