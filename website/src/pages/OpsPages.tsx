import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { blogPosts, careers, brand } from "../data/content";
import { addContactEntry, addWaitlistEntry } from "../lib/store";
import "./SimplePages.css";
import "./Ops.css";

export function Waitlist() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const goal = String(data.get("goal") || "").trim() || "Launch a digital product";
    if (!name || !email.includes("@")) {
      setError("Enter your name and a valid email.");
      return;
    }
    addWaitlistEntry({ name, email, goal });
    setError("");
    setDone(true);
    form.reset();
  }

  return (
    <div className="page simple-page">
      <section className="shell split ops-hero">
        <div>
          <p className="eyebrow">Interest list</p>
          <h1>Leave your details for future public offers.</h1>
          <p>
            Emonphenom HQ is owner-operated. This list captures interest for products {brand.owner}{" "}
            launches publicly.
          </p>
        </div>
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          {done ? <div className="notice">Saved. You’ll hear when a public offer opens.</div> : null}
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
            <label htmlFor="goal">What do you want?</label>
            <input id="goal" name="goal" placeholder="Faceless AI product pack" />
          </div>
          <button className="btn btn-lime" type="submit">
            Join list
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
    const form = event.currentTarget;
    const data = new FormData(form);
    addContactEntry({
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      topic: String(data.get("topic") || "General"),
      message: String(data.get("message") || "").trim(),
    });
    setDone(true);
    form.reset();
  }

  return (
    <div className="page simple-page">
      <section className="shell split ops-hero">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Reach Emonphenom HQ</h1>
          <p>
            Email {brand.supportEmail}. For partnerships or press, use the form — messages save in
            this browser for the owner workflow.
          </p>
        </div>
        <form className="ops-panel form-grid" onSubmit={onSubmit}>
          {done ? <div className="notice">Message saved locally for HQ follow-up.</div> : null}
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
            <select id="topic" name="topic" defaultValue="Partnerships">
              <option>Partnerships</option>
              <option>Press</option>
              <option>Support</option>
              <option>Sales</option>
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

export function Blog() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Journal</p>
        <h1>Notes on building and selling AI digital products.</h1>
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
        <h1>Owner-operated headquarters.</h1>
        <p>External roles open when Emonphenom expands beyond solo HQ operations.</p>
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
                Contact
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
          Emonphenom HQ stores owner session and forged product packs in your browser localStorage
          so the official GitHub Pages site can operate without a hosted backend.
        </p>
        <p>
          Contact messages and interest-list entries stay on-device unless you later connect a CRM.
          Questions: {brand.supportEmail}.
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
          Emonphenom is a private company system for creating and selling AI digital products. It is
          not affiliated with monetise.com or its owners.
        </p>
        <p>
          Earnings depend on execution. The HQ provides process, forge outputs, and ops tools — not
          income guarantees.
        </p>
      </section>
    </div>
  );
}
