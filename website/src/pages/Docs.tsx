import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { docPages, docSections } from "../data/docs";
import { getOwnerToken } from "../lib/owner";
import "./Ops.css";
import "./SimplePages.css";
import "./Docs.css";

const NOTES_KEY = "emonphenom.hqNotes";

function readNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) || "";
  } catch {
    return "";
  }
}

export function DocsIndex() {
  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Playbook</p>
        <h1>Emonphenom docs — the Notion alternative inside HQ</h1>
        <p>
          Operating pages, forge SOP, and weekly cadence live here. No Notion required. Owner notes
          save privately in this browser.
        </p>
      </section>
      <DocsShell>
        <DocsHome />
      </DocsShell>
    </div>
  );
}

export function DocsArticle() {
  const { slug = "" } = useParams();
  const page = docPages.find((p) => p.slug === slug);
  if (!page) return <Navigate to="/docs" replace />;

  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">{page.section}</p>
        <h1>{page.title}</h1>
        <p>{page.summary}</p>
      </section>
      <DocsShell active={slug}>
        <article className="ops-panel docs-article">
          <ol className="docs-body">
            {page.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <div className="studio-actions" style={{ marginTop: "1.25rem" }}>
            <Link to="/studio/forge" className="btn btn-lime">
              Open forge
            </Link>
            <Link to="/docs/notes" className="btn btn-ghost">
              HQ notes
            </Link>
          </div>
        </article>
      </DocsShell>
    </div>
  );
}

export function DocsNotes() {
  const authed = Boolean(getOwnerToken());
  const [notes, setNotes] = useState(readNotes);
  const [saved, setSaved] = useState(false);

  if (!authed) return <Navigate to="/owner" replace />;

  function onSave(event: FormEvent) {
    event.preventDefault();
    localStorage.setItem(NOTES_KEY, notes);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="page simple-page">
      <section className="shell page-hero">
        <p className="eyebrow">Owner vault</p>
        <h1>HQ notes</h1>
        <p>Private scratchpad for pitches, proofs, and weekly outcomes. Replaces a Notion page.</p>
      </section>
      <DocsShell active="notes">
        <form className="ops-panel form-grid" onSubmit={onSave}>
          {saved ? <div className="notice">Notes saved on this device.</div> : null}
          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Partner replies, revenue notes, next forge ideas…"
              style={{ minHeight: 260 }}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Save notes
          </button>
        </form>
      </DocsShell>
    </div>
  );
}

function DocsHome() {
  return (
    <div className="docs-home">
      {docSections.map((section) => (
        <section key={section} className="ops-panel">
          <h2>{section}</h2>
          <div className="product-list">
            {docPages
              .filter((p) => p.section === section)
              .map((page) => (
                <Link key={page.slug} to={`/docs/${page.slug}`} className="product-row">
                  <div>
                    <strong>{page.title}</strong>
                    <span>{page.summary}</span>
                  </div>
                  <em>Open</em>
                </Link>
              ))}
          </div>
        </section>
      ))}
      <section className="ops-panel">
        <h2>Owner vault</h2>
        <p className="muted">Private notes stored locally — your lightweight Notion replacement.</p>
        <Link to="/docs/notes" className="btn btn-lime" style={{ marginTop: "1rem", width: "fit-content" }}>
          Open HQ notes
        </Link>
      </section>
    </div>
  );
}

function DocsShell({ children, active }: { children: ReactNode; active?: string }) {
  const grouped = useMemo(
    () =>
      docSections.map((section) => ({
        section,
        pages: docPages.filter((p) => p.section === section),
      })),
    [],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  return (
    <section className="shell docs-layout">
      <aside className="docs-nav ops-panel">
        <p className="eyebrow">Contents</p>
        {grouped.map((group) => (
          <div key={group.section} className="docs-nav-group">
            <strong>{group.section}</strong>
            {group.pages.map((page) => (
              <Link key={page.slug} to={`/docs/${page.slug}`} className={active === page.slug ? "active" : undefined}>
                {page.title}
              </Link>
            ))}
          </div>
        ))}
        <Link to="/docs/notes" className={active === "notes" ? "active" : undefined}>
          HQ notes
        </Link>
        <Link to="/docs">All docs</Link>
      </aside>
      <div className="docs-main">{children}</div>
    </section>
  );
}
