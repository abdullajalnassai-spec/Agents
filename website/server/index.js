import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import {
  ensureOwner,
  getSessionUser,
  loginOwner,
  logoutOwner,
  OWNER_EMAIL,
  OWNER_NAME,
  requireOwner,
} from "./auth.js";
import { db, initDb } from "./db.js";
import {
  buildDistribution,
  buildProduct,
  researchNiche,
  runFullForge,
  writeSalesPage,
  buildLaunchPack,
} from "./forge.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 8787);
const renderHost = process.env.RENDER_EXTERNAL_URL || process.env.RENDER_EXTERNAL_HOSTNAME;
const appUrl =
  process.env.APP_URL ||
  (renderHost
    ? renderHost.startsWith("http")
      ? renderHost
      : `https://${renderHost}`
    : `http://127.0.0.1:${port}`);

initDb();
const ownerInfo = ensureOwner();

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "2mb" }));

function tokenFrom(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return req.headers["x-meridian-token"];
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    stripe: Boolean(stripe),
    mode: stripe ? "stripe" : "demo",
    company: "Meridian",
    ownerOnly: true,
    ownerEmail: OWNER_EMAIL,
  });
});

app.get("/api/owner/bootstrap", (_req, res) => {
  res.json({
    company: "Meridian",
    ownerName: OWNER_NAME,
    ownerEmail: OWNER_EMAIL,
    hint: "Private company OS — owner login required for Studio.",
  });
});

app.post("/api/owner/login", (req, res) => {
  const result = loginOwner(req.body?.email, req.body?.password);
  if (result.error) {
    res.status(401).json({ error: result.error });
    return;
  }
  res.json(result);
});

app.post("/api/owner/logout", (req, res) => {
  logoutOwner(tokenFrom(req));
  res.json({ ok: true });
});

app.get("/api/owner/me", (req, res) => {
  const user = getSessionUser(tokenFrom(req));
  if (!user) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  res.json({ user });
});

app.post("/api/waitlist", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const goal = String(req.body?.goal || "Launch a digital product").trim();
  if (!name || !email.includes("@")) {
    res.status(400).json({ error: "Name and valid email required." });
    return;
  }
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO waitlist (id, name, email, goal, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, name, email, goal, createdAt);
  res.status(201).json({ id, name, email, goal, createdAt });
});

app.post("/api/contact", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const topic = String(req.body?.topic || "General").trim();
  const message = String(req.body?.message || "").trim();
  if (!name || !email.includes("@") || !message) {
    res.status(400).json({ error: "Name, email, and message required." });
    return;
  }
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO contacts (id, name, email, topic, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(id, name, email, topic, message, createdAt);
  res.status(201).json({ id, name, email, topic, message, createdAt });
});

app.post("/api/checkout", (_req, res) => {
  res.status(403).json({
    error: "Meridian is a private owner-operated company. Public enrollment is closed.",
    ownerEmail: OWNER_EMAIL,
  });
});

app.get("/api/products", requireOwner, (_req, res) => {
  const rows = db.prepare("SELECT id, title, niche, status, stage, created_at, updated_at FROM products ORDER BY updated_at DESC").all();
  res.json(rows);
});

app.get("/api/products/:id", requireOwner, (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ ...row, payload: JSON.parse(row.payload) });
});

app.post("/api/forge/run", requireOwner, (req, res) => {
  const topic = String(req.body?.topic || "").trim();
  const audience = String(req.body?.audience || "").trim();
  const productType = String(req.body?.productType || "Template pack").trim();
  if (!topic) {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  const pack = runFullForge({ topic, audience, productType });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO products (id, title, niche, status, stage, payload, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    pack.product.title,
    pack.research.niche,
    "Draft",
    "launch",
    JSON.stringify(pack),
    now,
    now,
  );

  res.status(201).json({ id, ...pack });
});

app.post("/api/forge/step/:step", requireOwner, (req, res) => {
  const step = req.params.step;
  const body = req.body || {};

  if (step === "research") {
    res.json({ research: researchNiche(body) });
    return;
  }
  if (step === "product") {
    const research = body.research || researchNiche(body);
    res.json({ research, product: buildProduct({ research, productType: body.productType }) });
    return;
  }
  if (step === "sales") {
    const research = body.research || researchNiche(body);
    const product = body.product || buildProduct({ research, productType: body.productType });
    res.json({ research, product, sales: writeSalesPage({ research, product }) });
    return;
  }
  if (step === "distribution") {
    const research = body.research || researchNiche(body);
    const product = body.product || buildProduct({ research, productType: body.productType });
    const sales = body.sales || writeSalesPage({ research, product });
    const distribution = buildDistribution({ research, product });
    res.json({ research, product, sales, distribution });
    return;
  }
  if (step === "launch") {
    const research = body.research || researchNiche(body);
    const product = body.product || buildProduct({ research, productType: body.productType });
    const sales = body.sales || writeSalesPage({ research, product });
    const distribution = body.distribution || buildDistribution({ research, product });
    const launch = buildLaunchPack({ research, product, sales, distribution });
    res.json({ research, product, sales, distribution, launch });
    return;
  }

  res.status(400).json({ error: "Unknown step" });
});

app.patch("/api/products/:id/status", requireOwner, (req, res) => {
  const status = String(req.body?.status || "Draft");
  const updatedAt = new Date().toISOString();
  const result = db
    .prepare("UPDATE products SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, updatedAt, req.params.id);
  if (!result.changes) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ ok: true, status, updatedAt });
});

app.get("/api/admin/summary", requireOwner, (_req, res) => {
  const waitlist = db.prepare("SELECT COUNT(*) AS count FROM waitlist").get();
  const contacts = db.prepare("SELECT COUNT(*) AS count FROM contacts").get();
  const orders = db.prepare("SELECT COUNT(*) AS count FROM orders").get();
  const members = db.prepare("SELECT COUNT(*) AS count FROM members").get();
  const products = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  const recentWaitlist = db.prepare("SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 10").all();
  const recentOrders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10").all();
  const recentProducts = db
    .prepare("SELECT id, title, niche, status, stage, updated_at FROM products ORDER BY updated_at DESC LIMIT 10")
    .all();
  res.json({
    counts: {
      waitlist: waitlist.count,
      contacts: contacts.count,
      orders: orders.count,
      members: members.count,
      products: products.count,
    },
    recentWaitlist,
    recentOrders,
    recentProducts,
  });
});

if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Meridian private company OS on ${appUrl}`);
  console.log(`Owner: ${ownerInfo.email}`);
});
