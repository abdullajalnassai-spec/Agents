import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Ops.css";
import "./SimplePages.css";

export function Checkout() {
  return (
    <div className="page simple-page">
      <section className="shell narrow">
        <p className="eyebrow">Private company</p>
        <h1>Enrollment is closed to the public</h1>
        <p className="muted" style={{ margin: "0.85rem 0 1.5rem" }}>
          Meridian is Abdulla Alnassai’s private digital-product company. Only the owner can access
          the AI product forge and ops tools.
        </p>
        <Link to="/owner" className="btn btn-lime">
          Owner sign in
        </Link>
      </section>
    </div>
  );
}

export function CheckoutSuccess() {
  return (
    <div className="page simple-page">
      <section className="shell narrow">
        <p className="eyebrow">Private</p>
        <h1>Use owner studio instead</h1>
        <p className="muted" style={{ margin: "0.85rem 0 1.5rem" }}>
          Public checkout is disabled. Sign in as owner to forge products.
        </p>
        <Link to="/owner" className="btn btn-lime">
          Go to owner login
        </Link>
      </section>
    </div>
  );
}

export function PrivateBanner() {
  const [email, setEmail] = useState("abdulla.j.alnassai@gmail.com");
  useEffect(() => {
    fetch("/api/owner/bootstrap")
      .then((r) => r.json())
      .then((data) => {
        if (data.ownerEmail) setEmail(data.ownerEmail);
      })
      .catch(() => undefined);
  }, []);
  return (
    <p className="muted">
      Owner: {email}
    </p>
  );
}
