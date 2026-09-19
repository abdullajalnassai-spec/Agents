"""Paper broker — places and resolves trades. Live mode is intentionally blocked."""

from __future__ import annotations

import json
import time
import uuid
from dataclasses import asdict, dataclass, field
from enum import Enum
from pathlib import Path
from typing import List, Optional


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class Status(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"


@dataclass
class Order:
    id: str
    instrument: str
    side: Side
    entry: float
    stop: float
    target: float
    units: float
    risk_usd: float
    notional: float
    status: Status = Status.OPEN
    exit: Optional[float] = None
    pnl_usd: float = 0.0
    result_r: float = 0.0
    reason: str = ""
    opened_at: float = field(default_factory=time.time)
    closed_at: Optional[float] = None
    setup: str = "ORB-retest"


class PaperBroker:
    """
    Paper-only execution. Resolves against candle highs/lows.
    Does NOT send orders to any exchange.
    """

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.orders: List[Order] = []
        self._path = self.data_dir / "orders.jsonl"

    def place(
        self,
        instrument: str,
        side: Side,
        entry: float,
        stop: float,
        target: float,
        units: float,
        risk_usd: float,
        setup: str = "ORB-retest",
        live: bool = False,
    ) -> Order:
        if live:
            return Order(
                id=str(uuid.uuid4())[:8],
                instrument=instrument,
                side=side,
                entry=entry,
                stop=stop,
                target=target,
                units=units,
                risk_usd=risk_usd,
                notional=units * entry,
                status=Status.REJECTED,
                reason="LIVE trading is disabled in this desk. Paper only. Connect your own broker API outside this tool if you insist on live — never with rent money.",
                setup=setup,
            )

        order = Order(
            id=str(uuid.uuid4())[:8],
            instrument=instrument,
            side=side,
            entry=entry,
            stop=stop,
            target=target,
            units=units,
            risk_usd=risk_usd,
            notional=units * entry,
            setup=setup,
        )
        self.orders.append(order)
        self._append(order)
        return order

    def resolve_on_candle(self, order: Order, high: float, low: float, close: float) -> bool:
        """Return True if order closed on this candle."""
        if order.status != Status.OPEN:
            return False

        if order.side == Side.BUY:
            stop_hit = low <= order.stop
            target_hit = high >= order.target
            if stop_hit and target_hit:
                # Conservative: assume stop first on same bar
                self._close(order, order.stop, "stop (same-bar ambiguity → stop)")
                return True
            if stop_hit:
                self._close(order, order.stop, "stop")
                return True
            if target_hit:
                self._close(order, order.target, "target")
                return True
        else:
            stop_hit = high >= order.stop
            target_hit = low <= order.target
            if stop_hit and target_hit:
                self._close(order, order.stop, "stop (same-bar ambiguity → stop)")
                return True
            if stop_hit:
                self._close(order, order.stop, "stop")
                return True
            if target_hit:
                self._close(order, order.target, "target")
                return True
        return False

    def force_close(self, order: Order, price: float, reason: str) -> None:
        if order.status == Status.OPEN:
            self._close(order, price, reason)

    def _close(self, order: Order, price: float, reason: str) -> None:
        order.exit = price
        order.closed_at = time.time()
        order.status = Status.CLOSED
        order.reason = reason
        if order.side == Side.BUY:
            order.pnl_usd = (price - order.entry) * order.units
        else:
            order.pnl_usd = (order.entry - price) * order.units
        order.result_r = order.pnl_usd / order.risk_usd if order.risk_usd else 0.0
        self._append(order)

    def _append(self, order: Order) -> None:
        row = asdict(order)
        row["side"] = order.side.value
        row["status"] = order.status.value
        with self._path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row) + "\n")
