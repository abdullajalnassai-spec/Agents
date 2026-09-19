import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import { db, initDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 8787);
const appUrl = process.env.APP_URL || `http://127.0.0.1:${port}`;

initDb();

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    stripe: Boolean(stripe),
    mode: stripe ? "stripe" : "demo",
  });
});

app.get("/api/waitlist", (_req, res) => {
  const rows = db.prepare("SELECT * FROM waitlist ORDER BY created_at DESC").all();
  res.json(rows);
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

app.post("/api/checkout", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const plan = String(req.body?.plan || "Meridian Core").trim();
  if (!name || !email.includes("@")) {
    res.status(400).json({ error: "Name and valid email required." });
    return;
  }

  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const amountCents = 199500;

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: {
                name: plan,
                description: "Digital product operating system enrollment",
              },
            },
          },
        ],
        metadata: { orderId, name, plan },
        success_url: `${appUrl}/checkout/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/checkout?canceled=1`,
      });
      db.prepare(
        `INSERT INTO orders (id, name, email, plan, amount_cents, status, provider, provider_ref, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(orderId, name, email, plan, amountCents, "pending", "stripe", session.id, createdAt);
      res.json({ mode: "stripe", url: session.url, orderId });
      return;
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Stripe checkout failed",
      });
      return;
    }
  }

  db.prepare(
    `INSERT INTO orders (id, name, email, plan, amount_cents, status, provider, provider_ref, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(orderId, name, email, plan, amountCents, "paid", "demo", null, createdAt);

  db.prepare(
    `INSERT INTO members (id, name, email, plan, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET name=excluded.name, plan=excluded.plan`,
  ).run(crypto.randomUUID(), name, email, plan, createdAt);

  res.json({
    mode: "demo",
    orderId,
    url: `/checkout/success?order=${orderId}&demo=1`,
  });
});

app.get("/api/orders/:id", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

app.post("/api/orders/:id/confirm", async (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.status === "paid") {
    res.json({ ok: true, order });
    return;
  }

  if (order.provider === "stripe" && stripe && order.provider_ref) {
    const session = await stripe.checkout.sessions.retrieve(order.provider_ref);
    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Payment not completed yet" });
      return;
    }
  }

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run("paid", order.id);
  db.prepare(
    `INSERT INTO members (id, name, email, plan, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET name=excluded.name, plan=excluded.plan`,
  ).run(crypto.randomUUID(), order.name, order.email, order.plan, new Date().toISOString());

  const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(order.id);
  res.json({ ok: true, order: updated });
});

app.post("/api/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const name = String(req.body?.name || "").trim();
  if (!email.includes("@")) {
    res.status(400).json({ error: "Valid email required" });
    return;
  }
  const member = db.prepare("SELECT * FROM members WHERE email = ?").get(email);

  if (member) {
    res.json({ name: member.name, email: member.email, plan: member.plan, member: true });
    return;
  }

  res.json({
    name: name || "Member",
    email,
    plan: "Guest preview",
    member: false,
  });
});

app.get("/api/admin/summary", (_req, res) => {
  const waitlist = db.prepare("SELECT COUNT(*) AS count FROM waitlist").get();
  const contacts = db.prepare("SELECT COUNT(*) AS count FROM contacts").get();
  const orders = db.prepare("SELECT COUNT(*) AS count FROM orders").get();
  const members = db.prepare("SELECT COUNT(*) AS count FROM members").get();
  const recentWaitlist = db.prepare("SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 10").all();
  const recentOrders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10").all();
  res.json({
    counts: {
      waitlist: waitlist.count,
      contacts: contacts.count,
      orders: orders.count,
      members: members.count,
    },
    recentWaitlist,
    recentOrders,
  });
});

if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Meridian API + site on ${appUrl} (stripe=${Boolean(stripe)})`);
});
