import { Link } from "react-router-dom";
import { brand, platformFeatures } from "../data/content";
import "./SimplePages.css";

export function About() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Company</p>
        <h1>{brand.name} is the HQ that creates and sells AI digital products.</h1>
        <p>
          Owned and operated by {brand.owner}. The system mirrors elite digital-product procedures:
          research, forge, sales pages, partner distribution, and launch ops.
        </p>
      </section>
      <section className="shell content-block">
        <h2>What we believe</h2>
        <div className="pillars">
          <article>
            <h3>Systems over hype</h3>
            <p>Launch cadence, distribution, and delivery beat motivational fluff.</p>
          </article>
          <article>
            <h3>Faceless by default</h3>
            <p>You shouldn’t need a personal brand to sell a useful digital product.</p>
          </article>
          <article>
            <h3>Owner-grade ops</h3>
            <p>One private HQ. Full procedure. Products that can actually sell.</p>
          </article>
        </div>
      </section>
      <section className="shell content-block">
        <Link to="/owner" className="btn btn-primary" style={{ width: "fit-content" }}>
          Enter HQ
        </Link>
      </section>
    </div>
  );
}

export function Platform() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Platform</p>
        <h1>One hub for product, copy, distribution, and delivery.</h1>
        <p>From niche research to first sale — the full monetise-style operating loop.</p>
      </section>
      <section className="shell feature-grid">
        {platformFeatures.map((feature) => (
          <article key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>
      <section className="shell content-block cta-strip">
        <div>
          <h2>Run it from HQ</h2>
          <p>Owner studio includes the forge and launch pipeline.</p>
        </div>
        <Link to="/studio/forge" className="btn btn-lime">
          Open forge
        </Link>
      </section>
    </div>
  );
}

export function Pricing() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Access</p>
        <h1>Private owner HQ — not a public enrollment offer.</h1>
        <p>Emonphenom is built for {brand.owner} to create and sell products, not to sell seats.</p>
      </section>
      <section className="shell pricing-grid">
        <article>
          <p className="eyebrow">Public</p>
          <h2>Closed</h2>
          <p>No public checkout</p>
          <ul>
            <li>Marketing site</li>
            <li>Company pages</li>
            <li>Contact</li>
          </ul>
          <Link to="/contact" className="btn btn-ghost">
            Contact
          </Link>
        </article>
        <article className="hot">
          <p className="eyebrow">Owner HQ</p>
          <h2>Included</h2>
          <p>Full forge + ops</p>
          <ul>
            <li>Product forge</li>
            <li>Sales engine</li>
            <li>Distribution desk</li>
            <li>Launch pipeline</li>
          </ul>
          <Link to="/owner" className="btn btn-lime">
            Owner sign in
          </Link>
        </article>
        <article>
          <p className="eyebrow">Official site</p>
          <h2>GitHub</h2>
          <p>Self-updating Pages</p>
          <ul>
            <li>Deploys on every push</li>
            <li>Weekly health rebuild</li>
            <li>No Render account</li>
          </ul>
          <a
            className="btn btn-primary"
            href="https://abdullajalnassai-spec.github.io/Agents/"
            target="_blank"
            rel="noreferrer"
          >
            Open official link
          </a>
        </article>
      </section>
    </div>
  );
}
