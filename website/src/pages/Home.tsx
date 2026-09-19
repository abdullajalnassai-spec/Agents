import { Link } from "react-router-dom";
import { bonuses, brand, faqs, offers, stats, stories, testimonials } from "../data/content";
import "./Home.css";

export function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-media" aria-hidden>
          <div className="hero-glow" />
          <div className="hero-panel rise">
            <div className="hero-panel-top">
              <span>Product Forge</span>
              <span className="live-dot">HQ live</span>
            </div>
            <div className="hero-panel-body">
              <p className="hero-panel-kicker">Procedure locked</p>
              <h3>Develop → Scale</h3>
              <ul>
                <li>Research niche</li>
                <li>Build product pack</li>
                <li>Write sales + distribute</li>
              </ul>
              <div className="hero-progress">
                <span style={{ width: "86%" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="shell hero-copy">
          <p className="eyebrow rise">AI digital product HQ</p>
          <h1 className="rise rise-delay-1">
            <span className="brand-hero">{brand.name}</span>
            <span className="hero-line">creates the product.</span>
            <span className="hero-line soft">You sell it.</span>
          </h1>
          <p className="hero-support rise rise-delay-2">
            Private headquarters for {brand.owner} to research, forge, and sell faceless AI digital
            products — the full professional procedure from niche to launch.
          </p>
          <div className="hero-cta rise rise-delay-3">
            <Link to="/owner" className="btn btn-lime">
              Enter HQ
            </Link>
            <Link to="/studio/forge" className="btn btn-ghost">
              Open product forge
            </Link>
          </div>
        </div>
      </section>

      <section className="shell proof-bar">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="section shell">
        <div className="section-head">
          <p className="eyebrow">The procedure</p>
          <h2>Same operating loop elite digital-product HQs run</h2>
          <p>Develop. Distribute. Deliver. Scale. Every forge run produces the full pack.</p>
        </div>
        <div className="story-grid">
          {stories.map((story) => (
            <article key={story.name}>
              <h3>{story.name}</h3>
              <p>{story.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section offers-band">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">Inside the HQ</p>
            <h2>Everything required to create and sell</h2>
            <p>Forge, sales engine, distribution desk, and launch ops — one private system.</p>
          </div>
          <div className="offer-list">
            {offers.map((offer, index) => (
              <article key={offer.id} className="offer-row">
                <div className="offer-index">0{index + 1}</div>
                <div>
                  <div className="offer-title-row">
                    <h3>{offer.name}</h3>
                    <span>{offer.value}</span>
                  </div>
                  <p>{offer.blurb}</p>
                  <ul>
                    {offer.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-head">
          <p className="eyebrow">Operating layer</p>
          <h2>Built for shipping, not collecting courses</h2>
        </div>
        <div className="bonus-grid">
          {bonuses.map((bonus) => (
            <article key={bonus.name}>
              <h3>{bonus.name}</h3>
              <p>{bonus.blurb}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section guarantee">
        <div className="shell guarantee-inner">
          <p className="eyebrow">Owner HQ</p>
          <h2>Private. Professional. Self-updating.</h2>
          <p>
            Official site deploys from GitHub on every update. Only {brand.owner} can access the forge
            and ops desk.
          </p>
          <Link to="/owner" className="btn btn-primary">
            Sign in to HQ
          </Link>
        </div>
      </section>

      <section className="section shell">
        <div className="section-head">
          <p className="eyebrow">Standards</p>
          <h2>How Emonphenom ships offers</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <blockquote key={item.name}>
              <p>“{item.text}”</p>
              <footer>{item.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="section shell faq">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2>Straight answers</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="shell final-cta">
        <div>
          <h2>Open the headquarters</h2>
          <p>Forge the next AI digital product and move it to live sale.</p>
        </div>
        <Link to="/studio/forge" className="btn btn-lime">
          Start forge
        </Link>
      </section>
    </div>
  );
}
