import { Link } from "react-router-dom";
import {
  bonuses,
  brand,
  faqs,
  offers,
  stats,
  stories,
  testimonials,
} from "../data/content";
import "./Home.css";

export function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-media" aria-hidden>
          <div className="hero-glow" />
          <div className="hero-panel rise">
            <div className="hero-panel-top">
              <span>Forge AI</span>
              <span className="live-dot">Live studio</span>
            </div>
            <div className="hero-panel-body">
              <p className="hero-panel-kicker">Niche scan complete</p>
              <h3>Remote ops playbook</h3>
              <ul>
                <li>Buyer demand: high</li>
                <li>Competition gap: open</li>
                <li>Assets: 14 generated</li>
              </ul>
              <div className="hero-progress">
                <span style={{ width: "78%" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="shell hero-copy">
          <p className="eyebrow rise">Digital product system</p>
          <h1 className="rise rise-delay-1">
            <span className="brand-hero">{brand.name}</span>
            <span className="hero-line">builds the business.</span>
            <span className="hero-line soft">You ship the product.</span>
          </h1>
          <p className="hero-support rise rise-delay-2">
            AI product creation for <strong style={{ color: "inherit" }}>Abdulla Alnassai</strong> —
            research, build, sales copy, distribution, and launch packs in one private company OS.
          </p>
          <div className="hero-cta rise rise-delay-3">
            <Link to="/owner" className="btn btn-lime">
              Owner studio
            </Link>
            <Link to="/studio/forge" className="btn btn-ghost">
              Open AI forge
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
          <p className="eyebrow">It works wherever you are</p>
          <h2>Builders with different lives. Same system.</h2>
          <p>No face. No follower count. No quitting your day job on day one.</p>
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
            <p className="eyebrow">Inside Meridian</p>
            <h2>Everything you get in one enrollment</h2>
            <p>Software, training, leads, and a safety net — packaged like an operating company, not a lonely course.</p>
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
          <p className="eyebrow">Bonuses</p>
          <h2>Plus the operating layer most programs skip</h2>
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
          <p className="eyebrow">Guarantee</p>
          <h2>Work with you until you win</h2>
          <p>
            Either you multiply your investment with the system, or we keep consulting and updating
            with you under the published support terms. Plus 7 days to change your mind.
          </p>
          <Link to="/checkout" className="btn btn-primary">
            Enroll now
          </Link>
        </div>
      </section>

      <section className="section shell">
        <div className="section-head">
          <p className="eyebrow">Social proof</p>
          <h2>What members say after they ship</h2>
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
          <h2>Straight answers before you join</h2>
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
          <h2>Ready when enrollment opens</h2>
          <p>Join the waitlist for launch access, onboarding slots, and founder updates.</p>
        </div>
        <Link to="/checkout" className="btn btn-lime">
          Enroll now
        </Link>
      </section>
    </div>
  );
}
