import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getAdminSummary, getOwnerToken } from "../lib/owner";
import "./Ops.css";
import "./SimplePages.css";

type Summary = Awaited<ReturnType<typeof getAdminSummary>>;

export function Admin() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const authed = Boolean(getOwnerToken());

  useEffect(() => {
    if (!authed) return;
    getAdminSummary()
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load admin"));
  }, [authed]);

  if (!authed) return <Navigate to="/owner" replace />;

  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Ops</p>
        <h1>Company command center</h1>
        <p>Owner-only view of waitlist, orders, and forged products.</p>
        <Link to="/studio" className="btn btn-ghost" style={{ width: "fit-content", marginTop: "1rem" }}>
          Back to studio
        </Link>
      </section>

      {error ? <div className="shell notice error">{error}</div> : null}

      {summary ? (
        <>
          <section className="shell proof-bar four" style={{ marginTop: 0 }}>
            <div>
              <strong>{summary.counts.waitlist}</strong>
              <span>Waitlist</span>
            </div>
            <div>
              <strong>{summary.counts.products || 0}</strong>
              <span>Products</span>
            </div>
            <div>
              <strong>{summary.counts.orders}</strong>
              <span>Orders</span>
            </div>
            <div>
              <strong>{summary.counts.contacts}</strong>
              <span>Contacts</span>
            </div>
          </section>

          <section className="shell dash-grid" style={{ marginTop: "1.5rem" }}>
            <article className="ops-panel">
              <h2>Recent products</h2>
              <div className="product-list">
                {(summary.recentProducts || []).map((row) => (
                  <div key={String(row.id)} className="product-row">
                    <div>
                      <strong>{String(row.title)}</strong>
                      <span>{String(row.niche)}</span>
                    </div>
                    <em>{String(row.status)}</em>
                  </div>
                ))}
                {(summary.recentProducts || []).length === 0 ? (
                  <p className="muted">No forged products yet.</p>
                ) : null}
              </div>
            </article>
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
              </div>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
