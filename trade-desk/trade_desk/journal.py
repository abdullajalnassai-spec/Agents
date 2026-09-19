"""Trade journal + session report."""

from __future__ import annotations

import csv
import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from .broker import Order, Status
from .protocol import honest_math


class Journal:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.csv_path = self.data_dir / "journal.csv"
        self.report_path = self.data_dir / "last_session_report.md"

    def write_rows(self, orders: List[Order]) -> None:
        new_file = not self.csv_path.exists()
        with self.csv_path.open("a", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            if new_file:
                w.writerow(
                    [
                        "id",
                        "time",
                        "instrument",
                        "side",
                        "setup",
                        "entry",
                        "stop",
                        "target",
                        "exit",
                        "risk_usd",
                        "pnl_usd",
                        "result_r",
                        "status",
                        "reason",
                    ]
                )
            for o in orders:
                w.writerow(
                    [
                        o.id,
                        datetime.fromtimestamp(o.opened_at, tz=timezone.utc).isoformat(),
                        o.instrument,
                        o.side.value,
                        o.setup,
                        f"{o.entry:.4f}",
                        f"{o.stop:.4f}",
                        f"{o.target:.4f}",
                        f"{o.exit:.4f}" if o.exit is not None else "",
                        f"{o.risk_usd:.4f}",
                        f"{o.pnl_usd:.4f}",
                        f"{o.result_r:.3f}",
                        o.status.value,
                        o.reason,
                    ]
                )

    def write_report(
        self,
        account: float,
        instrument: str,
        orders: List[Order],
        sizing_text: str,
        venue_text: str,
        mode: str,
    ) -> str:
        closed = [o for o in orders if o.status == Status.CLOSED]
        rejected = [o for o in orders if o.status == Status.REJECTED]
        pnl = sum(o.pnl_usd for o in closed)
        wins = [o for o in closed if o.pnl_usd > 0]
        losses = [o for o in closed if o.pnl_usd <= 0]
        win_rate = (len(wins) / len(closed)) if closed else 0.0
        avg_win_r = (sum(o.result_r for o in wins) / len(wins)) if wins else 1.5
        avg_loss_r = (abs(sum(o.result_r for o in losses) / len(losses)) if losses else 1.0)
        risk = (closed[0].risk_usd if closed else account * 0.01)
        math = honest_math(win_rate or 0.45, avg_win_r or 1.5, avg_loss_r or 1.0, risk)

        lines = [
            f"# Trade Desk Session Report",
            f"",
            f"**When:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            f"**Mode:** {mode} (paper — no live exchange orders)",
            f"**Account:** ${account:.2f}",
            f"**Instrument:** {instrument}",
            f"",
            f"## Venue screen",
            f"```",
            venue_text,
            f"```",
            f"",
            f"## Sizing card",
            f"```",
            sizing_text,
            f"```",
            f"",
            f"## Orders placed",
            f"| ID | Side | Entry | Stop | Target | Exit | R | PnL | Reason |",
            f"|----|------|-------|------|--------|------|---|-----|--------|",
        ]
        for o in orders:
            exit_s = f"{o.exit:.2f}" if o.exit is not None else "—"
            lines.append(
                f"| {o.id} | {o.side.value} | {o.entry:.2f} | {o.stop:.2f} | {o.target:.2f} | {exit_s} | {o.result_r:+.2f} | ${o.pnl_usd:+.2f} | {o.reason or o.status.value} |"
            )

        lines += [
            f"",
            f"## Session P&L",
            f"- Trades closed: {len(closed)}",
            f"- Rejected: {len(rejected)}",
            f"- Wins / losses: {len(wins)} / {len(losses)}",
            f"- Session PnL: **${pnl:+.2f}**",
            f"- Ending equity (paper): **${account + pnl:.2f}**",
            f"",
            f"## Honest math",
            f"```",
            f"Expectancy/trade ≈ {math['expectancy_r']:+.3f}R → ${math['expected_usd_per_trade']:+.2f}",
            f"At 3 trades/day ≈ ${math['expected_usd_per_day']:+.2f}/day",
            f"{math['note']}",
            f"```",
            f"",
            f"## Rules reminder",
            f"- Daily stop 3% / weekly 6% / max 3 trades — hardware switches.",
            f"- Demo 40 → live min size → 100 clean lives → prop eval.",
            f"- This desk never places live broker orders.",
            f"",
        ]
        text = "\n".join(lines)
        self.report_path.write_text(text, encoding="utf-8")
        (self.data_dir / "last_session.json").write_text(
            json.dumps(
                {
                    "account": account,
                    "instrument": instrument,
                    "pnl": pnl,
                    "orders": len(orders),
                    "closed": len(closed),
                    "mode": mode,
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        return text
