type Niche = {
  key: string;
  label: string;
  demand: string;
  competition: string;
  angle: string;
};

const niches: Niche[] = [
  {
    key: "freelance",
    label: "Freelance / remote work",
    demand: "High",
    competition: "Medium",
    angle: "Systems for landing clients without posting your face",
  },
  {
    key: "fitness",
    label: "Busy-professional fitness",
    demand: "High",
    competition: "High",
    angle: "Short home routines + habit trackers sold as a pack",
  },
  {
    key: "ai-ops",
    label: "AI for small operators",
    demand: "Very high",
    competition: "Medium",
    angle: "Prompt packs + SOPs that replace expensive freelancers",
  },
  {
    key: "creators",
    label: "Creator monetization",
    demand: "High",
    competition: "High",
    angle: "Faceless productized offers for newsletter / marketplace sellers",
  },
  {
    key: "students",
    label: "Career switchers & students",
    demand: "Medium-high",
    competition: "Medium",
    angle: "Portfolio + interview kits with weekly action plans",
  },
];

function titleCase(value: string) {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pickNiche(topic: string) {
  const hay = String(topic || "").toLowerCase();
  return (
    niches.find((n) => hay.includes(n.key) || hay.includes(n.label.toLowerCase().split(" ")[0])) ||
    niches[2]
  );
}

export type Research = ReturnType<typeof researchNiche>;
export type ProductPack = ReturnType<typeof buildProduct>;
export type SalesPack = ReturnType<typeof writeSalesPage>;
export type DistributionPack = ReturnType<typeof buildDistribution>;
export type LaunchPack = ReturnType<typeof buildLaunchPack>;
export type ForgeResult = {
  research: Research;
  product: ProductPack;
  sales: SalesPack;
  distribution: DistributionPack;
  launch: LaunchPack;
};

export function researchNiche({ topic, audience }: { topic?: string; audience?: string }) {
  const niche = pickNiche(topic || "");
  const focus = topic?.trim() || niche.label;
  const who = audience?.trim() || "ambitious beginners who want results without a personal brand";
  return {
    topic: focus,
    audience: who,
    niche: niche.label,
    demand: niche.demand,
    competition: niche.competition,
    opportunityScore: niche.demand === "Very high" ? 92 : niche.demand === "High" ? 86 : 78,
    gaps: [
      `${focus} packs that ship as downloadable assets, not vague courses`,
      `Templates buyers can use in under 60 minutes`,
      `Distribution via partners instead of cold posting`,
    ],
    positioning: niche.angle,
    keywords: [
      `${focus} template`,
      `${focus} checklist`,
      `faceless ${focus}`,
      `${focus} SOP`,
      `${focus} starter kit`,
    ],
    recommendedOffer: `${titleCase(focus)} Operating Pack`,
  };
}

export function buildProduct({
  research,
  productType,
}: {
  research: Research;
  productType?: string;
}) {
  const type = productType || "Template pack";
  const title = research.recommendedOffer;
  const modules = [
    {
      name: "Quickstart",
      items: ["Positioning one-pager", "Offer statement", "7-day launch calendar"],
    },
    {
      name: "Core assets",
      items: [`${type} workbook (PDF/Notion)`, "Swipe-file prompts", "Delivery checklist for buyers"],
    },
    {
      name: "Sales kit",
      items: ["Sales page outline", "3 emails", "Partner pitch script"],
    },
    {
      name: "Scale layer",
      items: ["Upsell idea", "Testimonial ask script", "Monthly content prompts"],
    },
  ];

  const outline = modules
    .map(
      (mod, index) =>
        `## Module ${index + 1}: ${mod.name}\n${mod.items.map((item) => `- ${item}`).join("\n")}`,
    )
    .join("\n\n");

  const deliverable = `# ${title}

Built for: ${research.audience}

## Promise
Help ${research.audience} get a clear win in ${research.topic} without showing their face or building an audience first.

## What's inside
${outline}

## How to use (buyer)
1. Complete Quickstart in 30 minutes.
2. Install the core assets into your workflow.
3. Ship your first offer using the sales kit.
4. Use the scale layer after first revenue.

## Delivery format
- PDF / Notion export
- Prompt pack (.txt / .md)
- Email swipe file
`;

  return {
    title,
    productType: type,
    priceSuggestion: type.toLowerCase().includes("course") ? 97 : 47,
    modules,
    outline,
    deliverable,
  };
}

export function writeSalesPage({ research, product }: { research: Research; product: ProductPack }) {
  const price = product.priceSuggestion;
  return {
    headline: `The ${product.title} that helps ${research.audience} win without going viral`,
    subhead: `A complete ${product.productType.toLowerCase()} for ${research.topic} — built to sell faceless.`,
    bullets: [
      `Clear offer positioning in under an hour`,
      `Ready-to-use assets for ${research.topic}`,
      `Sales page + email kit included`,
      `Partner pitch script for distribution without ads`,
    ],
    body: `If you've been collecting ideas but never shipping a digital product, this is the shortcut.

${product.title} gives you the research-backed structure, assets, and sales copy to launch a faceless offer around ${research.topic}.

You don't need an audience. You need a sharp product and a distribution path.

## Who this is for
${research.audience}

## What's included
${product.modules.map((m) => `- **${m.name}**: ${m.items.join(", ")}`).join("\n")}

## Price
$${price} one-time access.
`,
    emails: [
      {
        subject: `Your ${product.title} is ready`,
        body: `Hey — inside you'll find the quickstart, assets, and sales kit. Start with Module 1 today.`,
      },
      {
        subject: `The 60-minute path to first draft`,
        body: `Block one hour. Complete Quickstart + Core assets. Reply when your offer statement is done.`,
      },
      {
        subject: `How operators get distribution without ads`,
        body: `Use the partner pitch script. Send 5 pitches this week. One yes beats 100 posts.`,
      },
    ],
    cta: `Get ${product.title} — $${price}`,
  };
}

export function buildDistribution({
  research,
  product,
}: {
  research: Research;
  product: ProductPack;
}) {
  const leads = [
    {
      name: `${titleCase(research.topic)} Newsletter`,
      type: "Newsletter",
      fit: "High",
      why: "Already warms buyers who pay for tools and templates",
      pitch: `I built ${product.title} for your readers who want ${research.topic} results without a personal brand. Happy to offer your list 20% and a free teardown call.`,
    },
    {
      name: "Remote ops Discord",
      type: "Community",
      fit: "High",
      why: "Active operators buy SOPs and packs",
      pitch: `Would your members want a plug-and-play ${product.productType.toLowerCase()} for ${research.topic}? I can drop a free mini-checklist first.`,
    },
    {
      name: "Career switcher YouTube",
      type: "Creator",
      fit: "Medium",
      why: "Affiliate-friendly educational audience",
      pitch: `Open to featuring ${product.title} as a resource for viewers starting from zero?`,
    },
    {
      name: "Digital sellers circle",
      type: "Marketplace community",
      fit: "High",
      why: "Buyers already understand digital product delivery",
      pitch: `Looking for 2 partners to test ${product.title} with their audience this month.`,
    },
    {
      name: "Freelance social lists",
      type: "Social list",
      fit: "Medium",
      why: "Fast feedback loop for positioning",
      pitch: `Built a faceless ${research.topic} pack — looking for 3 creators to review before public launch.`,
    },
  ];

  return {
    strategy: "Partner-first distribution (no ad spend required for validation)",
    weeklyPlan: [
      "Day 1–2: Finalize sales page + delivery files",
      "Day 3–4: Send 10 partner pitches from the lead desk",
      "Day 5: Soft launch to warm contacts / waitlist",
      "Day 6–7: Collect proof, iterate price/page, book next partners",
    ],
    leads,
  };
}

export function buildLaunchPack({
  research,
  product,
  sales,
  distribution,
}: {
  research: Research;
  product: ProductPack;
  sales: SalesPack;
  distribution: DistributionPack;
}) {
  return {
    checklist: [
      "Upload deliverable files to storefront",
      "Paste sales page copy",
      "Connect payment link",
      "Send 10 partner pitches",
      "Open waitlist / soft launch",
      "Ask first buyers for testimonials",
    ],
    summary: {
      niche: research.niche,
      title: product.title,
      price: product.priceSuggestion,
      audience: research.audience,
      partnersToContact: distribution.leads.length,
    },
    exportMarkdown: `# Launch pack — ${product.title}

## Research
- Niche: ${research.niche}
- Demand: ${research.demand}
- Competition: ${research.competition}
- Audience: ${research.audience}

## Product
${product.deliverable}

## Sales page
# ${sales.headline}

${sales.subhead}

${sales.body}

CTA: ${sales.cta}

## Distribution
${distribution.weeklyPlan.map((step) => `- ${step}`).join("\n")}

### Leads
${distribution.leads.map((lead) => `- ${lead.name} (${lead.type}, fit ${lead.fit})`).join("\n")}
`,
  };
}

export function runFullForge(input: {
  topic: string;
  audience?: string;
  productType?: string;
}): ForgeResult {
  const research = researchNiche(input);
  const product = buildProduct({ research, productType: input.productType });
  const sales = writeSalesPage({ research, product });
  const distribution = buildDistribution({ research, product });
  const launch = buildLaunchPack({ research, product, sales, distribution });
  return { research, product, sales, distribution, launch };
}
