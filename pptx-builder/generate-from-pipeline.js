#!/usr/bin/env node
/**
 * Ascenda Pipeline → Roadshow Presentation Bridge
 *
 * Takes brand data from the Ascenda pipeline (master sheet format)
 * and transforms it into the presentation generator's expected schema,
 * then generates the Roadshow 2026 presentation.
 *
 * Usage:
 *   node generate-from-pipeline.js --input pipeline-brand.json --output "BrandName Roadshow 2026.pptx"
 *   node generate-from-pipeline.js --sheets-csv export.csv --brand "CompanyName"
 *   node generate-from-pipeline.js --demo
 *
 * The pipeline data comes from either:
 *   1. Direct JSON from n8n webhook payload (WF-06 passes brand data)
 *   2. CSV export from Google Sheets master (Phase1_Submissions)
 *   3. Manual JSON with pipeline field names
 */

const { generateRoadshow } = require("./generate-roadshow");
const fs = require("fs");
const path = require("path");

// ─── Pipeline Field → Presentation Field Mapper ─────────────────────────
function mapPipelineToPresentation(pipeline) {
  const d = pipeline;

  // Parse financial model if it exists (from WF-05)
  const fm = d.financialModel || {};

  // Build items array from pipeline data
  const items = [];
  if (d.productName) {
    items.push({
      description: d.productName,
      cost: d.landedCost ? `$${d.landedCost}` : (fm.cogsPct ? `${fm.cogsPct}% COGS` : "TBD"),
      retail: d.msrp ? `$${d.msrp}` : (d.samsPrice ? `$${d.samsPrice}` : (fm.retailPrice ? `$${fm.retailPrice}` : "TBD")),
      scMargin: d.vendorMargin ? `${d.vendorMargin}%` : (fm.grossMarginPct ? `${fm.grossMarginPct}%` : "TBD"),
      lowestMarketRetail: d.msrp ? `$${d.msrp} (MSRP)` : "See competitive analysis",
      currentlySold: d.competitors || d.retailerPresence || "New to market",
      scValueToMarket: d.has20PctValue === "yes" ? "20%+ below market" : "Under review",
      prjSalesPerDay: fm.revenuePerEvent ? `$${Math.round(fm.revenuePerEvent / 4)}/day` : "TBD",
      prjUnitsPerDay: fm.projectedUnitsPerEvent ? `${Math.round(fm.projectedUnitsPerEvent / 4)} units` : "TBD",
    });
  }

  // Build annual plan from financial model
  const annualSales = fm.year1Projection || 0;
  const showCount = fm.recommendedClubCount || 100;
  const annualPlan = {
    q3: {
      showItems: d.productName || "Primary SKU",
      prjShowReach: `${Math.round(showCount * 0.3)} clubs`,
      prjShowSales: annualSales ? `$${Math.round(annualSales * 0.3 / 1000)}K` : "TBD",
    },
    q4: {
      showItems: d.productName ? `${d.productName} (Holiday)` : "Holiday Bundle",
      prjShowReach: `${Math.round(showCount * 0.35)} clubs`,
      prjShowSales: annualSales ? `$${Math.round(annualSales * 0.35 / 1000)}K` : "TBD",
    },
    q1: {
      showItems: d.productName || "Primary SKU",
      prjShowReach: `${Math.round(showCount * 0.2)} clubs`,
      prjShowSales: annualSales ? `$${Math.round(annualSales * 0.2 / 1000)}K` : "TBD",
    },
    q2: {
      showItems: d.productName ? `${d.productName} (Summer)` : "Summer Promo",
      prjShowReach: `${Math.round(showCount * 0.15)} clubs`,
      prjShowSales: annualSales ? `$${Math.round(annualSales * 0.15 / 1000)}K` : "TBD",
    },
  };

  return {
    // Slide 1: Title
    companyName: d.brandName || d.company || "Brand",
    supplierTeam: d.contactName || `${d.firstName || ""} ${d.lastName || ""}`.trim() || "TBD",
    contactEmail: d.email || "",
    contactPhone: d.phone || "",

    // Slide 2: Company Overview
    categories: d.category || "",
    brands: d.brandName || d.company || "",
    marketShareUS: "Per market analysis",
    retailerPresence: d.competitors || "Expanding",
    scPartnerships: `Category: ${d.category || "TBD"} — Managed by Ascenda Group`,
    vendorNumber: d.id || "Pending",
    longTermGoalCompany: d.memberValue || "Sam's Club channel expansion via Ascenda roadshow program",

    // Slide 2: Roadshow Category
    roadshowCategories: d.category || "",
    supplierMarketShareCategory: "Per competitive analysis",
    retailerPresenceCategory: d.multiClub === "yes" ? "Multi-club capable" : "Single-club start",
    scMerchantPartnership: "Managed through Ascenda Group",
    longTermGoalSC: d.memberValue || "Establish recurring roadshow presence and graduate to permanent shelf",

    // Slide 3: Event Details
    eventDescription: d.productDescription || "Branded product demo with sampling",
    palletSpace: fm.recommendedShowLength ? `${fm.recommendedShowLength} show` : "1-2 pallets (standard)",
    scheduleType: d.consignmentReady === "yes" ? "Consignment-based roadshow" : "Standard roadshow",
    clubReach: fm.recommendedClubCount ? `${fm.recommendedClubCount} clubs` : "TBD per approval",
    proposedLength: fm.recommendedShowLength || "4-day events",
    seasonalPeak: "Per category seasonal analysis",
    staffingPartner: "Ascenda Group staffing network",
    staffingHours: "8 hours/day, 2 staff per location",

    // Slide 3: Sales Projections
    prjDailySales: fm.revenuePerEvent ? `$${Math.round(fm.revenuePerEvent / 4).toLocaleString()}` : "TBD",
    prjSalesPerShow: fm.revenuePerEvent ? `$${fm.revenuePerEvent.toLocaleString()}` : "TBD",
    prjAnnualSales: fm.year1Projection ? `$${(fm.year1Projection / 1000000).toFixed(1)}M` : "TBD",
    prjAnnualShowCount: fm.recommendedClubCount ? `${fm.recommendedClubCount}` : "TBD",

    // Slide 4: Items
    items: items.length > 0 ? items : [{
      description: d.productName || "Primary Product",
      cost: "TBD", retail: "TBD", scMargin: "TBD",
      lowestMarketRetail: "TBD", currentlySold: "TBD",
      scValueToMarket: d.has20PctValue === "yes" ? "20%+ value advantage" : "TBD",
      prjSalesPerDay: "TBD", prjUnitsPerDay: "TBD",
    }],

    // Slide 5: Annual Plan
    isExistingSupplier: false,
    annualPlan,
  };
}

// ─── CSV Parser (for Google Sheets exports) ──────────────────────────────
function parseCSV(text) {
  const rows = [];
  let current = "";
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      row.push(current.trim()); current = "";
    } else if (ch === "\n" && !inQuotes) {
      row.push(current.trim()); rows.push(row); row = []; current = "";
    } else {
      current += ch;
    }
  }
  if (current || row.length) { row.push(current.trim()); rows.push(row); }
  return rows;
}

function csvToBrandData(csvText, brandName) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) throw new Error("CSV has no data rows");

  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);

  // Find the brand row
  const brandIdx = headers.findIndex(h => h.toLowerCase() === "brandname" || h.toLowerCase() === "company");
  let targetRow = dataRows[0]; // default to first row

  if (brandName && brandIdx >= 0) {
    const match = dataRows.find(r => r[brandIdx] && r[brandIdx].toLowerCase().includes(brandName.toLowerCase()));
    if (match) targetRow = match;
  }

  // Build object from headers + values
  const obj = {};
  headers.forEach((h, i) => { obj[h] = targetRow[i] || ""; });
  return obj;
}

// ─── CLI ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  console.log(`
Ascenda Pipeline → Roadshow Presentation Generator

Usage:
  node generate-from-pipeline.js --input brand.json [--output file.pptx]
  node generate-from-pipeline.js --sheets-csv export.csv --brand "CompanyName" [--output file.pptx]
  node generate-from-pipeline.js --demo

Options:
  --input FILE     JSON file with pipeline brand data (from WF-06 or manual)
  --sheets-csv FILE  CSV export from Google Sheets master
  --brand NAME     Brand name to find in CSV (used with --sheets-csv)
  --output FILE    Output PPTX filename (default: auto from brand name)
  --demo           Generate demo presentation with sample pipeline data
`);
  process.exit(0);
}

let pipelineData;
let outputFile;

if (args.includes("--demo")) {
  // Demo: simulate a brand that went through the pipeline
  pipelineData = {
    id: "BRAND-1234567890",
    brandName: "GreenLife Supplements",
    company: "GreenLife Supplements",
    contactName: "Maria Santos",
    firstName: "Maria",
    lastName: "Santos",
    email: "maria@greenlifesupps.com",
    phone: "(555) 987-6543",
    website: "https://greenlifesupps.com",
    productName: "GreenLife Organic Protein Powder 2lb",
    category: "Wellness/Supplements",
    productDescription: "USDA Organic plant-based protein powder with 25g protein per serving, zero artificial sweeteners, available in Vanilla and Chocolate. Made in FDA-registered facility with third-party testing.",
    differentiation: "Only organic protein powder with complete amino acid profile at club price point. Patent-pending taste technology eliminates chalky texture common in plant proteins.",
    memberValue: "Sam's Club members get 40 servings at $0.87/serving vs $1.49 at retail. 20oz larger than any competitor pack at lower per-unit cost.",
    competitors: "Orgain (Costco), Garden of Life (Amazon), Vega (Target)",
    revenue: "$5M – $20M",
    retailer: "Sam's Club",
    preferredModel: "Roadshow",
    has20PctValue: "yes",
    consignmentReady: "yes",
    multiClub: "yes",
    pricingWorks: "yes",
    canProvideCOGS: "yes",
    canBreakEven: "yes",
    hasInsurance: "yes",
    msrp: "59.99",
    samsPrice: "34.98",
    landedCost: "14.50",
    vendorMargin: "58.5",
    score: 87,
    readinessScore: 82,
    financialModel: {
      projectedUnitsPerEvent: 240,
      revenuePerEvent: 8400,
      retailPrice: 34.98,
      cogsPct: 41.5,
      grossMarginPct: 58.5,
      ascendaCommissionPct: 12,
      breakEvenEvents: 3,
      year1Projection: 2520000,
      year2Projection: 4200000,
      roi: 34,
      recommendedShowLength: "4-day events",
      recommendedClubCount: 300,
    },
  };
  outputFile = "GreenLife_Roadshow_2026.pptx";
  console.log("Generating DEMO presentation from pipeline data...");
} else {
  const inputIdx = args.indexOf("--input");
  const csvIdx = args.indexOf("--sheets-csv");
  const brandIdx = args.indexOf("--brand");
  const outputIdx = args.indexOf("--output");

  if (inputIdx >= 0 && args[inputIdx + 1]) {
    pipelineData = JSON.parse(fs.readFileSync(args[inputIdx + 1], "utf-8"));
  } else if (csvIdx >= 0 && args[csvIdx + 1]) {
    const csvText = fs.readFileSync(args[csvIdx + 1], "utf-8");
    const brandName = brandIdx >= 0 ? args[brandIdx + 1] : null;
    pipelineData = csvToBrandData(csvText, brandName);
  } else {
    console.error("Provide --input, --sheets-csv, or --demo");
    process.exit(1);
  }

  if (outputIdx >= 0 && args[outputIdx + 1]) {
    outputFile = args[outputIdx + 1];
  } else {
    const name = (pipelineData.brandName || pipelineData.company || "Brand").replace(/[^a-zA-Z0-9]/g, "_");
    outputFile = `${name}_Roadshow_2026.pptx`;
  }
}

// Map pipeline data to presentation schema
const presentationData = mapPipelineToPresentation(pipelineData);

console.log(`Brand: ${presentationData.companyName}`);
console.log(`Category: ${presentationData.categories}`);
console.log(`Items: ${presentationData.items.length}`);
console.log(`Output: ${outputFile}`);
console.log("");

// Generate
generateRoadshow(presentationData, outputFile)
  .then(() => {
    console.log(`\nPresentation saved: ${outputFile}`);
    console.log("Slides: Title → Overview → Event Details → Items → Annual Plan → Contact");
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });

// Export mapper for use in other scripts
module.exports = { mapPipelineToPresentation, csvToBrandData };
