import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  clearOwnerSession,
  fetchMe,
  getOwnerToken,
  getOwnerUser,
  getProduct,
  listProducts,
  ownerLogin,
  ownerLogout,
  runForge,
  setProductStatus,
} from "../lib/owner";
import "./Ops.css";
import "./SimplePages.css";
import "./Studio.css";

function OwnerGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(Boolean(getOwnerToken()));

  useEffect(() => {
    const token = getOwnerToken();
    if (!token) {
      setOk(false);
      setReady(true);
      return;
    }
    fetchMe()
      .then(() => setOk(true))
      .catch(() => {
        clearOwnerSession();
        setOk(false);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="page simple-page shell"><p>Checking owner access…</p></div>;
  if (!ok) return <Navigate to="/owner" replace />;
  return <>{children}</>;
}

export function OwnerLogin() {
  const navigate = useNavigate();
  const existing = getOwnerUser();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (existing && getOwnerToken()) return <Navigate to="/studio" replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await ownerLogin(String(data.get("email") || ""), String(data.get("password") || ""));
      navigate("/studio");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="page simple-page">
      <section className="shell narrow">
        <p className="eyebrow">Private company</p>
        <h1>Owner access only</h1>
        <p className="muted" style={{ margin: "0.75rem 0 1.5rem" }}>
          Meridian is Abdulla Alnassai’s private digital-product company OS. Sign in to run the AI
          product forge.
        </p>
        {error ? <div className="notice error">{error}</div> : null}
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Owner email</label>
            <input id="email" name="email" type="email" required defaultValue="abdulla.j.alnassai@gmail.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button className="btn btn-lime" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Enter studio"}
          </button>
        </form>
      </section>
    </div>
  );
}

export function StudioHome() {
  return (
    <OwnerGate>
      <StudioHomeInner />
    </OwnerGate>
  );
}

function StudioHomeInner() {
  const user = getOwnerUser();
  const navigate = useNavigate();
  const [products, setProducts] = useState<
    Array<{ id: string; title: string; niche: string; status: string; updated_at: string }>
  >([]);

  useEffect(() => {
    listProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  return (
    <div className="page simple-page">
      <section className="shell dash-head">
        <div>
          <p className="eyebrow">Studio</p>
          <h1>Welcome, {user?.name || "Owner"}</h1>
          <p>Private AI digital product company — Develop → Distribute → Deliver → Scale</p>
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={async () => {
            await ownerLogout();
            navigate("/owner");
          }}
        >
          Log out
        </button>
      </section>

      <section className="shell studio-actions">
        <Link to="/studio/forge" className="btn btn-lime">
          Forge a new product
        </Link>
        <Link to="/admin" className="btn btn-ghost">
          Ops admin
        </Link>
      </section>

      <section className="shell">
        <div className="section-head">
          <h2>Your product pipeline</h2>
          <p>Every forge run saves a full launch pack you can reopen anytime.</p>
        </div>
        <div className="product-list ops-panel">
          {products.length === 0 ? <p className="muted">No products yet — run the forge.</p> : null}
          {products.map((product) => (
            <Link key={product.id} to={`/studio/products/${product.id}`} className="product-row">
              <div>
                <strong>{product.title}</strong>
                <span>{product.niche}</span>
              </div>
              <em>{product.status}</em>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function StudioForge() {
  return (
    <OwnerGate>
      <StudioForgeInner />
    </OwnerGate>
  );
}

function StudioForgeInner() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const steps = ["Brief", "Research", "Product", "Sales page", "Distribution", "Launch pack"];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setStep(1);
    try {
      const pack = await runForge({
        topic: String(data.get("topic") || ""),
        audience: String(data.get("audience") || ""),
        productType: String(data.get("productType") || "Template pack"),
      });
      setResult(pack);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Forge failed");
    } finally {
      setBusy(false);
    }
  }

  const research = result?.research as Record<string, unknown> | undefined;
  const product = result?.product as Record<string, unknown> | undefined;
  const sales = result?.sales as Record<string, unknown> | undefined;
  const distribution = result?.distribution as Record<string, unknown> | undefined;
  const launch = result?.launch as Record<string, unknown> | undefined;

  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">AI product forge</p>
        <h1>Build a faceless digital product end-to-end</h1>
        <p>Same operating procedure as elite digital-product systems — research, build, copy, distribute, launch.</p>
      </section>

      <section className="shell step-rail">
        {steps.map((label, index) => (
          <div key={label} className={index <= step ? "active" : undefined}>
            <strong>0{index + 1}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      {!result ? (
        <section className="shell">
          <form className="ops-panel form-grid forge-form" onSubmit={onSubmit}>
            {error ? <div className="notice error">{error}</div> : null}
            <div className="field">
              <label htmlFor="topic">What niche or topic?</label>
              <input id="topic" name="topic" required placeholder="AI ops for freelancers" />
            </div>
            <div className="field">
              <label htmlFor="audience">Who is the buyer?</label>
              <input
                id="audience"
                name="audience"
                defaultValue="Faceless beginners who want results without a personal brand"
                placeholder="Busy freelancers who hate showing their face"
              />
            </div>
            <div className="field">
              <label htmlFor="productType">Product type</label>
              <select id="productType" name="productType" defaultValue="Template pack">
                <option>Template pack</option>
                <option>Prompt pack</option>
                <option>Mini course</option>
                <option>SOP system</option>
                <option>Notion kit</option>
              </select>
            </div>
            <button className="btn btn-lime" type="submit" disabled={busy}>
              {busy ? "Forging research → launch pack…" : "Run full forge"}
            </button>
          </form>
        </section>
      ) : (
        <section className="shell forge-results">
          <article className="ops-panel">
            <h2>1. Research</h2>
            <p>
              <strong>{String(research?.niche)}</strong> · demand {String(research?.demand)} · competition{" "}
              {String(research?.competition)} · score {String(research?.opportunityScore)}
            </p>
            <p className="muted">{String(research?.positioning)}</p>
            <ul>
              {((research?.gaps as string[]) || []).map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </article>

          <article className="ops-panel">
            <h2>2. Product</h2>
            <h3>{String(product?.title)}</h3>
            <p className="muted">
              {String(product?.productType)} · suggested ${String(product?.priceSuggestion)}
            </p>
            <pre className="export-box">{String(product?.deliverable)}</pre>
          </article>

          <article className="ops-panel">
            <h2>3. Sales page</h2>
            <h3>{String(sales?.headline)}</h3>
            <p>{String(sales?.subhead)}</p>
            <ul>
              {((sales?.bullets as string[]) || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <pre className="export-box">{String(sales?.body)}</pre>
          </article>

          <article className="ops-panel">
            <h2>4. Distribution</h2>
            <p>{String(distribution?.strategy)}</p>
            <ul>
              {((distribution?.weeklyPlan as string[]) || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="product-list">
              {((distribution?.leads as Array<Record<string, string>>) || []).map((lead) => (
                <div key={lead.name} className="product-row">
                  <div>
                    <strong>{lead.name}</strong>
                    <span>
                      {lead.type} · fit {lead.fit}
                    </span>
                  </div>
                  <em>{lead.why}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="ops-panel">
            <h2>5. Launch pack</h2>
            <ul className="checklist">
              {((launch?.checklist as string[]) || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <pre className="export-box">{String((launch as { exportMarkdown?: string })?.exportMarkdown)}</pre>
            <div className="studio-actions" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate(`/studio/products/${String(result.id)}`)}
              >
                Open saved product
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => navigate("/studio")}>
                Back to studio
              </button>
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

export function StudioProduct() {
  return (
    <OwnerGate>
      <StudioProductInner />
    </OwnerGate>
  );
}

function StudioProductInner() {
  const { id = "" } = useParams();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [id]);

  if (error) return <div className="page shell notice error">{error}</div>;
  if (!product) return <div className="page shell"><p>Loading product…</p></div>;

  const payload = product.payload as Record<string, unknown>;
  const launch = payload.launch as { exportMarkdown?: string; checklist?: string[] };

  return (
    <div className="page simple-page">
      <section className="shell dash-head">
        <div>
          <p className="eyebrow">{String(product.status)}</p>
          <h1>{String(product.title)}</h1>
          <p>{String(product.niche)}</p>
        </div>
        <button
          className="btn btn-lime"
          type="button"
          onClick={async () => {
            await setProductStatus(id, "Live");
            setProduct({ ...product, status: "Live" });
          }}
        >
          Mark live
        </button>
      </section>
      <section className="shell">
        <article className="ops-panel">
          <h2>Launch checklist</h2>
          <ul className="checklist">
            {(launch?.checklist || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <pre className="export-box">{launch?.exportMarkdown}</pre>
        </article>
      </section>
    </div>
  );
}
