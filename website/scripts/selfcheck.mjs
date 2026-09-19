import { runFullForge } from "../server/forge.js";

function assert(cond, msg) {
  if (!cond) {
    console.error("SELFCHECK FAIL:", msg);
    process.exit(1);
  }
}

const pack = runFullForge({
  topic: "AI ops for freelancers",
  audience: "Faceless freelancers",
  productType: "Prompt pack",
});

assert(pack.product?.title, "product title");
assert(pack.sales?.headline, "sales headline");
assert(pack.distribution?.leads?.length >= 3, "distribution leads");
assert(pack.launch?.checklist?.length >= 4, "launch checklist");
console.log("SELFCHECK OK", pack.product.title);
