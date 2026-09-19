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
            Private HQ for creating and selling AI digital products — research, forge, sales pages,
            distribution, and launch ops in one system.
          </p>
        </div>
        <div>
          <h4>Product</h4>
          <Link to="/platform">Platform</Link>
          <Link to="/studio">HQ studio</Link>
          <Link to="/studio/forge">Forge</Link>
          <Link to="/docs">Docs</Link>
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
        <span>
          © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
        </span>
        <span>Original company system — not affiliated with monetise.com.</span>
      </div>
    </footer>
  );
}
