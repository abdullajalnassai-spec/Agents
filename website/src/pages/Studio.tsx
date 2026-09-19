import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { brand } from "../data/content";
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
  const [state, setState] = useState<"loading" | "ok" | "deny">(
    getOwnerToken() && getOwnerUser() ? "ok" : getOwnerToken() ? "loading" : "deny",
  );

  useEffect(() => {
    const token = getOwnerToken();
    if (!token) {
      setState("deny");
      return;
    }
    fetchMe()
      .then(() => setState("ok"))
      .catch(() => {
        clearOwnerSession();
        setState("deny");
      });
  }, []);

  if (state === "loading") {
    return (
      <div className="page simple-page">
        <div className="shell narrow">
          <p className="eyebrow">HQ</p>
          <h1>Unlocking owner access…</h1>
        </div>
      </div>
    );
  }
  if (state === "deny") return <Navigate to="/owner" replace />;
  return <>{children}</>;
}

export function OwnerLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getOwnerToken() && getOwnerUser()) navigate("/studio", { replace: true });
  }, [navigate]);

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
        <p className="eyebrow">Private HQ</p>
        <h1>Emonphenom owner access</h1>
        <p className="muted" style={{ margin: "0.75rem 0 1.5rem" }}>
          Headquarters for {brand.owner} to create and sell AI digital products. Owner login only.
        </p>
        {error ? <div className="notice error">{error}</div> : null}
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Owner email</label>
            <input id="email" name="email" type="email" required defaultValue={brand.ownerEmail} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button className="btn btn-lime" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Enter HQ"}
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
          <p className="eyebrow">HQ studio</p>
          <h1>Welcome, {user?.name || "Owner"}</h1>
          <p>Create → distribute → deliver → scale AI digital products</p>
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
        <Link to="/docs" className="btn btn-ghost">
          HQ docs
        </Link>
        <Link to="/admin" className="btn btn-ghost">
          Ops admin
        </Link>
      </section>

      <section className="shell">
        <div className="section-head">
          <h2>Product pipeline</h2>
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
  const [result, setResult] = useState<(ForgeResultView & { id: string }) | null>(null);

  const steps = ["Brief", "Research", "Product", "Sales page", "Distribution", "Launch pack"];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const topic = String(data.get("topic") || "").trim();
    if (!topic) {
      setError("Enter a niche or topic.");
      return;
    }
    setBusy(true);
    setError("");
    setStep(1);
    try {
      const pack = await runForge({
        topic,
        audience: String(data.get("audience") || "").trim(),
        productType: String(data.get("productType") || "Template pack"),
      });
      setResult(pack as ForgeResultView & { id: string });
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Forge failed");
    } finally {
      setBusy(false);
    }
  }

  const research = result?.research;
  const product = result?.product;
  const sales = result?.sales;
  const distribution = result?.distribution;
  const launch = result?.launch;

  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">AI product forge</p>
        <h1>Build a faceless digital product end-to-end</h1>
        <p>Professional HQ procedure: research, build, copy, distribute, launch.</p>
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
              <strong>{research?.niche}</strong> · demand {research?.demand} · competition{" "}
              {research?.competition} · score {research?.opportunityScore}
            </p>
            <p className="muted">{research?.positioning}</p>
            <ul>
              {(research?.gaps || []).map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </article>

          <article className="ops-panel">
            <h2>2. Product</h2>
            <h3>{product?.title}</h3>
            <p className="muted">
              {product?.productType} · suggested ${product?.priceSuggestion}
            </p>
            <pre className="export-box">{product?.deliverable}</pre>
          </article>

          <article className="ops-panel">
            <h2>3. Sales page</h2>
            <h3>{sales?.headline}</h3>
            <p>{sales?.subhead}</p>
            <ul>
              {(sales?.bullets || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <pre className="export-box">{sales?.body}</pre>
          </article>

          <article className="ops-panel">
            <h2>4. Distribution</h2>
            <p>{distribution?.strategy}</p>
            <ul>
              {(distribution?.weeklyPlan || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="product-list">
              {(distribution?.leads || []).map((lead) => (
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
              {(launch?.checklist || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <pre className="export-box">{launch?.exportMarkdown}</pre>
            <div className="studio-actions" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate(`/studio/products/${result.id}`)}
              >
                Open saved product
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => navigate("/studio")}>
                Back to HQ
              </button>
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

type ForgeResultView = Awaited<ReturnType<typeof runForge>>;

export function StudioProduct() {
  return (
    <OwnerGate>
      <StudioProductInner />
    </OwnerGate>
  );
}

function StudioProductInner() {
  const { id = "" } = useParams();
  const [product, setProduct] = useState<Awaited<ReturnType<typeof getProduct>> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [id]);

  if (error) return <div className="page shell notice error">{error}</div>;
  if (!product) {
    return (
      <div className="page shell narrow">
        <p>Loading product…</p>
      </div>
    );
  }

  const launch = product.payload.launch;

  return (
    <div className="page simple-page">
      <section className="shell dash-head">
        <div>
          <p className="eyebrow">{product.status}</p>
          <h1>{product.title}</h1>
          <p>{product.niche}</p>
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
            {launch.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <pre className="export-box">{launch.exportMarkdown}</pre>
        </article>
      </section>
    </div>
  );
}
