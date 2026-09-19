import { useEffect, useState } from "react";
import { getAdminSummary } from "../lib/api";
import "./Ops.css";
import "./SimplePages.css";

type Summary = Awaited<ReturnType<typeof getAdminSummary>>;

export function Admin() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSummary()
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load admin"));
  }, []);

  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Ops</p>
        <h1>Company command center</h1>
        <p>Live waitlist, orders, and members from the Meridian API database.</p>
      </section>

      {error ? (
        <div className="shell notice error">{error}. Start the API with npm run start.</div>
      ) : null}

      {summary ? (
        <>
          <section className="shell proof-bar four" style={{ marginTop: 0 }}>
            <div>
              <strong>{summary.counts.waitlist}</strong>
              <span>Waitlist</span>
            </div>
            <div>
              <strong>{summary.counts.orders}</strong>
              <span>Orders</span>
            </div>
            <div>
              <strong>{summary.counts.members}</strong>
              <span>Members</span>
            </div>
            <div>
              <strong>{summary.counts.contacts}</strong>
              <span>Contacts</span>
            </div>
          </section>

          <section className="shell dash-grid" style={{ marginTop: "1.5rem" }}>
            <article className="ops-panel">
              <h2>Recent waitlist</h2>
              <div className="product-list">
                {summary.recentWaitlist.map((row) => (
                  <div key={String(row.id)} className="product-row">
                    <div>
                      <strong>{String(row.name)}</strong>
                      <span>{String(row.email)}</span>
                    </div>
                    <em>{String(row.goal)}</em>
                  </div>
                ))}
                {summary.recentWaitlist.length === 0 ? <p className="muted">No signups yet.</p> : null}
              </div>
            </article>
            <article className="ops-panel">
              <h2>Recent orders</h2>
              <div className="product-list">
                {summary.recentOrders.map((row) => (
                  <div key={String(row.id)} className="product-row">
                    <div>
                      <strong>{String(row.email)}</strong>
                      <span>{String(row.plan)}</span>
                    </div>
                    <em>{String(row.status)}</em>
                  </div>
                ))}
                {summary.recentOrders.length === 0 ? <p className="muted">No orders yet.</p> : null}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
