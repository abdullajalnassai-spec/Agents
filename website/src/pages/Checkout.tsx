import { Link } from "react-router-dom";
import { brand } from "../data/content";
import "./Ops.css";
import "./SimplePages.css";

export function Checkout() {
  return (
    <div className="page simple-page">
      <section className="shell narrow">
        <p className="eyebrow">Private HQ</p>
        <h1>Emonphenom is owner-operated</h1>
        <p className="muted" style={{ margin: "0.85rem 0 1.5rem" }}>
          This headquarters creates and sells AI digital products for {brand.owner}. Public
          enrollment is closed — sign in to run the forge.
        </p>
        <Link to="/owner" className="btn btn-lime">
          Owner sign in
        </Link>
      </section>
    </div>
  );
}

export function CheckoutSuccess() {
  return <Checkout />;
}
