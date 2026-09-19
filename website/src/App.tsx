import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { Admin } from "./pages/Admin";
import { Checkout, CheckoutSuccess } from "./pages/Checkout";
import { About, Platform, Pricing } from "./pages/CompanyPages";
import { Home } from "./pages/Home";
import {
  Blog,
  Careers,
  Contact,
  Privacy,
  Terms,
  Waitlist,
} from "./pages/OpsPages";
import { DocsArticle, DocsIndex, DocsNotes } from "./pages/Docs";
import { OwnerLogin, StudioForge, StudioHome, StudioProduct } from "./pages/Studio";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="platform" element={<Platform />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="about" element={<About />} />
        <Route path="docs" element={<DocsIndex />} />
        <Route path="docs/notes" element={<DocsNotes />} />
        <Route path="docs/:slug" element={<DocsArticle />} />
        <Route path="waitlist" element={<Waitlist />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="checkout/success" element={<CheckoutSuccess />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Navigate to="/owner" replace />} />
        <Route path="dashboard" element={<Navigate to="/studio" replace />} />
        <Route path="owner" element={<OwnerLogin />} />
        <Route path="studio" element={<StudioHome />} />
        <Route path="studio/forge" element={<StudioForge />} />
        <Route path="studio/products/:id" element={<StudioProduct />} />
        <Route path="admin" element={<Admin />} />
        <Route path="blog" element={<Blog />} />
        <Route path="careers" element={<Careers />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
