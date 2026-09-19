import { Link } from "react-router-dom";
import "./SimplePages.css";

export function About() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Company</p>
        <h1>Meridian exists to make digital product businesses operable.</h1>
        <p>
          We build the AI studio, distribution tools, curriculum, and success ops that let
          operators launch faceless offers without stitching together ten subscriptions.
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
            <h3>Aligned incentives</h3>
            <p>When members sell, the ecosystem grows — so support is part of the product.</p>
          </article>
        </div>
      </section>
      <section className="shell content-block">
        <h2>Leadership snapshot</h2>
        <p>
          Meridian is a product company: engineering, coaching, and growth under one roof.
          Enrollment opens in cohorts so onboarding and support stay high-touch.
        </p>
        <Link to="/careers" className="btn btn-primary" style={{ marginTop: "1.25rem", width: "fit-content" }}>
          See open roles
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
        <p>From niche research to first sale — without hopping across disconnected tools.</p>
      </section>
      <section className="shell feature-grid">
        {[
          ["Product studio", "Research niches, outline offers, generate assets."],
          ["Copyforge OS", "Sales pages, emails, and launch copy on demand."],
          ["Signal Kit", "Find partner audiences and work pre-vetted leads."],
          ["Member hub", "Courses, community, calendar, and progress."],
          ["Storefront sync", "Track delivery and sales from one dashboard."],
          ["Success ops", "Onboarding, reviews, and escalation paths."],
        ].map(([title, body]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <section className="shell content-block cta-strip">
        <div>
          <h2>Tour it after you join the list</h2>
          <p>Members get full studio access. Waitlist gets launch timing first.</p>
        </div>
        <Link to="/waitlist" className="btn btn-lime">
          Join waitlist
        </Link>
      </section>
    </div>
  );
}

export function Pricing() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Pricing</p>
        <h1>Enrollment that feels like buying an operating system.</h1>
        <p>Core includes the AI tools, formula, leads, community, and launch insurance.</p>
      </section>
      <section className="shell pricing-grid">
        {[
          {
            name: "Waitlist",
            price: "Free",
            note: "Alerts + founder updates",
            href: "/waitlist",
            cta: "Join waitlist",
            items: ["Launch calendar", "Early access", "Product changelog"],
            hot: false,
          },
          {
            name: "Meridian Core",
            price: "$1,995",
            note: "One-time enrollment",
            href: "/checkout",
            cta: "Checkout — $1,995",
            items: [
              "Forge AI · 12 months",
              "Digital Product Formula",
              "Signal Kit + 100 leads",
              "Copyforge OS · 12 months",
              "Community + weekly Q&A",
              "Launch Insurance",
            ],
            hot: true,
          },
          {
            name: "Teams",
            price: "Custom",
            note: "Agencies & cohorts",
            href: "/contact",
            cta: "Talk to sales",
            items: ["Multi-seat access", "Private onboarding", "Shared playbooks", "Priority support"],
            hot: false,
          },
        ].map((tier) => (
          <article key={tier.name} className={tier.hot ? "hot" : undefined}>
            <p className="eyebrow">{tier.name}</p>
            <h2>{tier.price}</h2>
            <p>{tier.note}</p>
            <ul>
              {tier.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link to={tier.href} className={`btn ${tier.hot ? "btn-lime" : "btn-primary"}`}>
              {tier.cta}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
