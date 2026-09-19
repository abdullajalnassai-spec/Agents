import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmOrder, getHealth, startCheckout } from "../lib/api";
import { setSession } from "../lib/store";
import "./Ops.css";
import "./SimplePages.css";

export function Checkout() {
  const [search] = useSearchParams();
  const [mode, setMode] = useState<"stripe" | "demo" | "offline">("demo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canceled = search.get("canceled");

  useEffect(() => {
    getHealth().then((health) => {
      if (!health) setMode("offline");
      else setMode(health.mode);
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    try {
      const result = await startCheckout({ name, email, plan: "Meridian Core" });
      if (result.mode === "demo") {
        setSession({ name, email, plan: "Meridian Core" });
      }
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="page simple-page">
      <section className="shell split ops-hero">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Enroll in Meridian Core</h1>
          <p>
            $1,995 one-time. Includes Forge AI, formula training, Signal Kit, Copyforge OS,
            community, and Launch Insurance.
          </p>
          <ul className="checklist">
            <li>Payment mode: {mode === "stripe" ? "Stripe live/test keys connected" : mode === "demo" ? "Demo checkout (no card required)" : "API offline — start the server"}</li>
            <li>Add STRIPE_SECRET_KEY to take real cards</li>
            <li>Members unlock the dashboard after payment</li>
          </ul>
        </div>
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          {canceled ? <div className="notice error">Checkout canceled — you can try again.</div> : null}
          {error ? <div className="notice error">{error}</div> : null}
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required placeholder="Alex Rivera" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="alex@company.com" />
          </div>
          <button className="btn btn-lime" type="submit" disabled={busy || mode === "offline"}>
            {busy ? "Starting checkout…" : mode === "stripe" ? "Pay with Stripe — $1,995" : "Complete demo enrollment"}
          </button>
          <Link to="/pricing" className="muted">
            Back to pricing
          </Link>
        </form>
      </section>
    </div>
  );
}

export function CheckoutSuccess() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const orderId = search.get("order") || "";
  const [status, setStatus] = useState("Confirming your enrollment…");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!orderId) {
        setStatus("Missing order id.");
        return;
      }
      try {
        const result = await confirmOrder(orderId);
        if (!active) return;
        const order = result.order as { name?: string; email?: string; plan?: string };
        if (order.email) {
          setSession({
            name: String(order.name || "Member"),
            email: String(order.email),
            plan: String(order.plan || "Meridian Core"),
          });
        }
        setStatus("You’re in. Your member hub is ready.");
        setReady(true);
      } catch (err) {
        if (!active) return;
        setStatus(err instanceof Error ? err.message : "Could not confirm order");
      }
    }
    void run();
    return () => {
      active = false;
    };
  }, [orderId]);

  return (
    <div className="page simple-page">
      <section className="shell narrow">
        <p className="eyebrow">Success</p>
        <h1>{ready ? "Welcome to Meridian" : "Finishing up"}</h1>
        <p className="muted" style={{ margin: "0.85rem 0 1.5rem" }}>
          {status}
        </p>
        {ready ? (
          <button className="btn btn-lime" type="button" onClick={() => navigate("/dashboard")}>
            Open member hub
          </button>
        ) : null}
      </section>
    </div>
  );
}
