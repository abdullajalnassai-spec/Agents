import { Link } from "react-router-dom";
import { brand } from "../data/content";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <span className="brand-name">{brand.name}</span>
          </div>
          <p>
            The complete system for building, launching, and scaling digital product businesses —
            training, AI tools, distribution, and support in one place.
          </p>
        </div>
        <div>
          <h4>Product</h4>
          <Link to="/platform">Platform</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/login">Member hub</Link>
          <Link to="/admin">Ops admin</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/blog">Journal</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Legal</h4>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Meridian Systems. All rights reserved.</span>
        <span>Demo company website — not affiliated with monetise.com.</span>
      </div>
    </footer>
  );
}
