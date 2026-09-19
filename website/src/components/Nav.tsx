import { NavLink, Link } from "react-router-dom";
import { brand } from "../data/content";
import "./Nav.css";

const links = [
  { to: "/platform", label: "Platform" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "Company" },
  { to: "/blog", label: "Journal" },
  { to: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="nav">
      <div className="shell nav-inner">
        <Link to="/" className="brand" aria-label={`${brand.name} home`}>
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">{brand.name}</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/login" className="nav-login">
            Member login
          </Link>
          <Link to="/waitlist" className="btn btn-primary nav-cta">
            Join waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
