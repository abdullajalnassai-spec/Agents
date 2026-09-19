import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { blogPosts, careers, brand } from "../data/content";
import {
  addContactEntry,
  addProduct,
  addWaitlistEntry,
  clearSession,
  getProducts,
  getSession,
  getWaitlist,
  setSession,
} from "../lib/store";
import "./SimplePages.css";
import "./Ops.css";

export function Waitlist() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const count = useMemo(() => getWaitlist().length, [done]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const goal = String(data.get("goal") || "").trim();
    if (!name || !email.includes("@")) {
      setError("Enter your name and a valid email.");
      return;
    }
    addWaitlistEntry({ name, email, goal: goal || "Launch a digital product" });
    setError("");
    setDone(true);
    event.currentTarget.reset();
  }

  return (
    <div className="page simple-page">
      <section className="shell split ops-hero">
        <div>
          <p className="eyebrow">Waitlist</p>
          <h1>Get launch access before enrollment fills.</h1>
          <p>
            Spots open in cohorts. Join the list for timing, onboarding slots, and early studio
            walkthroughs. {count > 0 ? `${count} saved on this device.` : null}
          </p>
        </div>
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          {done ? <div className="notice">You’re on the list. We’ll email when the next cohort opens.</div> : null}
          {error ? <div className="notice error">{error}</div> : null}
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required placeholder="Alex Rivera" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="alex@company.com" />
          </div>
          <div className="field">
            <label htmlFor="goal">What do you want to build?</label>
            <input id="goal" name="goal" placeholder="Faceless template pack for freelancers" />
          </div>
          <button className="btn btn-lime" type="submit">
            Join waitlist
          </button>
        </form>
      </section>
    </div>
  );
}

export function Contact() {
  const [done, setDone] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addContactEntry({
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      topic: String(data.get("topic") || "General"),
      message: String(data.get("message") || "").trim(),
    });
    setDone(true);
    event.currentTarget.reset();
  }

  return (
    <div className="page simple-page">
      <section className="shell split ops-hero">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Sales, support, and partnerships.</h1>
          <p>
            Email {brand.supportEmail} or WhatsApp {brand.whatsapp}. For Teams pricing, pick
            “Sales” below.
          </p>
        </div>
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          {done ? <div className="notice">Message saved. In production this routes to your CRM or inbox.</div> : null}
          <div className="form-grid two">
            <div className="field">
              <label htmlFor="cname">Name</label>
              <input id="cname" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="cemail">Email</label>
              <input id="cemail" name="email" type="email" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="topic">Topic</label>
            <select id="topic" name="topic" defaultValue="Support">
              <option>Support</option>
              <option>Sales</option>
              <option>Partnerships</option>
              <option>Press</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required />
          </div>
          <button className="btn btn-primary" type="submit">
            Send message
          </button>
        </form>
      </section>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const existing = getSession();
  if (existing) return <Navigate to="/dashboard" replace />;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSession({
      name: String(data.get("name") || "Member").trim() || "Member",
      email: String(data.get("email") || "").trim(),
      plan: "Meridian Core",
    });
    navigate("/dashboard");
  }

  return (
    <div className="page simple-page">
      <section className="shell narrow">
        <p className="eyebrow">Member hub</p>
        <h1>Log in to your studio</h1>
        <p className="muted" style={{ margin: "0.75rem 0 1.5rem" }}>
          Demo auth — any email works. Your session stays in this browser.
        </p>
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="lname">Name</label>
            <input id="lname" name="name" placeholder="Alex" />
          </div>
          <div className="field">
            <label htmlFor="lemail">Email</label>
            <input id="lemail" name="email" type="email" required placeholder="you@email.com" />
          </div>
          <button className="btn btn-lime" type="submit">
            Enter dashboard
          </button>
        </form>
      </section>
    </div>
  );
}

export function Dashboard() {
  const user = getSession();
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => getProducts());
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");

  if (!user) return <Navigate to="/login" replace />;

  function createProduct(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const product = addProduct({ title: title.trim(), niche: niche.trim() || "General" });
    setProducts(getProducts());
    setTitle("");
    setNiche("");
    return product;
  }

  return (
    <div className="page simple-page">
      <section className="shell dash-head">
        <div>
          <p className="eyebrow">Member hub</p>
          <h1>Welcome back, {user.name}</h1>
          <p>
            Plan: {user.plan} · {user.email}
          </p>
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            clearSession();
            navigate("/login");
          }}
        >
          Log out
        </button>
      </section>

      <section className="shell dash-grid">
        <article className="ops-panel">
          <h2>Forge a new product</h2>
          <p className="muted">Demo studio — saves drafts in your browser.</p>
          <form className="form-grid" onSubmit={createProduct} style={{ marginTop: "1rem" }}>
            <div className="field">
              <label htmlFor="ptitle">Product title</label>
              <input id="ptitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pniche">Niche</label>
              <input id="pniche" value={niche} onChange={(e) => setNiche(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">
              Generate draft pack
            </button>
          </form>
        </article>

        <article className="ops-panel">
          <h2>Your pipeline</h2>
          <div className="product-list">
            {products.map((product) => (
              <div key={product.id} className="product-row">
                <div>
                  <strong>{product.title}</strong>
                  <span>{product.niche}</span>
                </div>
                <em>{product.status}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="ops-panel">
          <h2>This week</h2>
          <ul className="checklist">
            <li>Finish Digital Product Formula module 2</li>
            <li>Send 5 Signal Kit partner pitches</li>
            <li>Join Thursday Q&A with success team</li>
          </ul>
          <Link to="/platform" className="btn btn-ghost" style={{ marginTop: "1rem" }}>
            Open platform overview
          </Link>
        </article>
      </section>
    </div>
  );
}

export function Blog() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Journal</p>
        <h1>Notes on building and selling digital products.</h1>
      </section>
      <section className="shell blog-list">
        {blogPosts.map((post) => (
          <article key={post.slug}>
            <time dateTime={post.date}>{post.date}</time>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function Careers() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Careers</p>
        <h1>Help operators ship products that sell.</h1>
        <p>Remote-first roles across coaching, design, and growth.</p>
      </section>
      <section className="shell career-list">
        {careers.map((job) => (
          <article key={job.role}>
            <div>
              <h2>{job.role}</h2>
              <p>{job.blurb}</p>
            </div>
            <div className="career-meta">
              <span>{job.loc}</span>
              <Link to="/contact" className="btn btn-primary">
                Apply
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="page simple-page">
      <section className="shell legal">
        <p className="eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p>
          Meridian Systems collects account, waitlist, and support information to operate the
          product and communicate about enrollment. Demo data on this site is stored only in your
          browser via localStorage and is not sent to a server.
        </p>
        <p>
          In production, we would process payments through a PCI-compliant provider, retain logs for
          security, and honor deletion requests at {brand.supportEmail}.
        </p>
      </section>
    </div>
  );
}

export function Terms() {
  return (
    <div className="page simple-page">
      <section className="shell legal">
        <p className="eyebrow">Legal</p>
        <h1>Terms & Conditions</h1>
        <p>
          Meridian provides software access, training, and support under cohort enrollment terms.
          Earnings depend on your execution. Guarantees refer to continued support access as
          described at purchase — not a promise of income.
        </p>
        <p>
          This demo website is an original company template inspired by the structure of high-converting
          digital-product funnels. It is not affiliated with monetise.com or its owners.
        </p>
      </section>
    </div>
  );
}
