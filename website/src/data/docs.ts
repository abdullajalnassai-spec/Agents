export type DocPage = {
  slug: string;
  title: string;
  section: string;
  summary: string;
  body: string[];
};

export const docPages: DocPage[] = [
  {
    slug: "hq-overview",
    title: "HQ overview",
    section: "Company",
    summary: "What Emonphenom is and how the headquarters runs.",
    body: [
      "Emonphenom is a private HQ for creating and selling AI digital products.",
      "Owner: Abdulla Alnassai. Public enrollment is closed.",
      "Operating loop: Develop → Distribute → Deliver → Scale.",
      "Everything lives here — forge, pipeline, launch packs, and this playbook — so Notion is optional.",
    ],
  },
  {
    slug: "forge-sop",
    title: "Forge SOP",
    section: "Procedure",
    summary: "Step-by-step procedure to forge a sellable digital product.",
    body: [
      "1. Sign in at Owner HQ.",
      "2. Open Studio → Forge.",
      "3. Enter niche/topic, buyer audience, and product type.",
      "4. Run full forge.",
      "5. Review research score, product deliverable, sales page, partner leads, and launch checklist.",
      "6. Export/copy the launch markdown into your storefront (Whop, Gumroad, Notion kit, etc.).",
      "7. Mark the product Live only after files + payment link are ready.",
      "Quality bar: faceless by default, usable in under 60 minutes, partner-first distribution before ads.",
    ],
  },
  {
    slug: "weekly-cadence",
    title: "Weekly cadence",
    section: "Procedure",
    summary: "The shipping rhythm that keeps offers moving.",
    body: [
      "Monday: Forge 1 new draft or upgrade an existing pack.",
      "Tue–Wed: Send 10 partner pitches from the distribution desk.",
      "Thursday: Soft-launch or update one live offer.",
      "Friday: Capture proof (sales, replies, testimonials) and log notes in HQ Notes.",
      "Weekend (optional): Iterate sales page copy from objections.",
    ],
  },
  {
    slug: "distribution",
    title: "Distribution desk",
    section: "Sell",
    summary: "How Emonphenom gets buyers without personal-brand content.",
    body: [
      "Prefer partners with warm audiences over cold ads for validation.",
      "Use the forge lead list: newsletters, Discords, creator channels, marketplace circles.",
      "Pitch script pattern: who it’s for → what they get → why faceless → what you offer the partner.",
      "Target: 10 pitches/week until first consistent sales channel.",
    ],
  },
  {
    slug: "launch-checklist",
    title: "Launch checklist",
    section: "Sell",
    summary: "Do not mark Live until these are done.",
    body: [
      "Upload deliverable files to storefront.",
      "Paste sales page copy.",
      "Connect payment link.",
      "Send 10 partner pitches.",
      "Open waitlist / soft launch.",
      "Ask first buyers for testimonials.",
    ],
  },
  {
    slug: "stack",
    title: "Stack & updates",
    section: "Ops",
    summary: "Where the company software lives and how it updates.",
    body: [
      "Official site auto-deploys to the gh-pages branch on every push.",
      "Weekly GitHub Action rebuild + forge self-check.",
      "Owner session + product packs store in your browser (private to this device/profile).",
      "No Render account required. Optional GitHub Pages toggle unlocks the github.io vanity URL.",
    ],
  },
];

export const docSections = ["Company", "Procedure", "Sell", "Ops"];
