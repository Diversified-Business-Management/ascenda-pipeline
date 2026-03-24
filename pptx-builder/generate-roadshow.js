#!/usr/bin/env node
/**
 * Ascenda Sales — Roadshow 2026 Presentation Builder
 * Generates a professional Sam's Club Roadshow presentation from brand data.
 *
 * Usage:
 *   node generate-roadshow.js --input brand-data.json --output "BrandName Roadshow 2026.pptx"
 *   node generate-roadshow.js --demo   (generates a sample with demo data)
 *
 * Input JSON schema: see sample-brand-data.json
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ─── Color Palette (Sam's Club / Ascenda branding) ──────────────────────
const COLORS = {
  navy:       "0A3161",   // Sam's Club navy
  blue:       "0060A9",   // Sam's Club blue
  lightBlue:  "E8F4FD",   // Light blue background
  white:      "FFFFFF",
  offWhite:   "F8FAFB",
  gray:       "6B7280",
  darkGray:   "374151",
  charcoal:   "1F2937",
  green:      "059669",
  gold:       "D97706",
  red:        "DC2626",
  lightGray:  "E5E7EB",
  accent:     "0060A9",
};

const FONTS = {
  header: "Calibri",
  body: "Calibri",
};

// ─── Helper: Create shadow config (fresh object each time) ──────────────
function cardShadow() {
  return { type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.08 };
}

// ─── Helper: Add field row (label + value) ──────────────────────────────
function addFieldRow(slide, label, value, x, y, w, fontSize = 11) {
  slide.addText([
    { text: `${label}: `, options: { bold: true, color: COLORS.charcoal, fontSize } },
    { text: value || "—", options: { color: COLORS.darkGray, fontSize } },
  ], { x, y, w, h: 0.28, fontFace: FONTS.body, margin: 0 });
}

// ─── Helper: Section header bar ─────────────────────────────────────────
function addSectionHeader(slide, text, x, y, w) {
  slide.addShape("rect", {
    x, y, w, h: 0.38,
    fill: { color: COLORS.navy },
  });
  slide.addText(text, {
    x: x + 0.15, y, w: w - 0.3, h: 0.38,
    fontSize: 13, bold: true, color: COLORS.white,
    fontFace: FONTS.header, valign: "middle", margin: 0,
  });
}

// ─── SLIDE 1: Title Slide ───────────────────────────────────────────────
function buildTitleSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.navy };

  // Top accent bar
  slide.addShape("rect", {
    x: 0, y: 0, w: 10, h: 0.06,
    fill: { color: COLORS.gold },
  });

  // Main title
  slide.addText("Roadshow 2026\nPresentation", {
    x: 0.8, y: 0.8, w: 8.4, h: 2.2,
    fontSize: 44, bold: true, color: COLORS.white,
    fontFace: FONTS.header, align: "left", valign: "middle",
    lineSpacingMultiple: 1.1,
  });

  // Brand name subtitle
  slide.addText(data.companyName || "Brand Name", {
    x: 0.8, y: 2.9, w: 8.4, h: 0.7,
    fontSize: 24, color: COLORS.gold, bold: true,
    fontFace: FONTS.header, align: "left",
  });

  // Divider line
  slide.addShape("line", {
    x: 0.8, y: 3.7, w: 3, h: 0,
    line: { color: COLORS.gold, width: 2 },
  });

  // Supplier team
  slide.addText([
    { text: "Supplier Team: ", options: { bold: true, color: "B0C4DE" } },
    { text: data.supplierTeam || "—", options: { color: COLORS.white } },
  ], {
    x: 0.8, y: 3.9, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: FONTS.body,
  });

  // Contact info
  if (data.contactEmail || data.contactPhone) {
    slide.addText([
      { text: data.contactEmail || "", options: { color: "B0C4DE", fontSize: 11, breakLine: true } },
      { text: data.contactPhone || "", options: { color: "B0C4DE", fontSize: 11 } },
    ], { x: 0.8, y: 4.4, w: 8.4, h: 0.6, fontFace: FONTS.body });
  }

  // Footer
  slide.addText("Ascenda Sales  |  Sam's Club Roadshow Partner", {
    x: 0.5, y: 5.1, w: 9, h: 0.35,
    fontSize: 9, color: "7B8DA0", fontFace: FONTS.body, align: "left",
  });

  // Bottom accent
  slide.addShape("rect", {
    x: 0, y: 5.565, w: 10, h: 0.06,
    fill: { color: COLORS.gold },
  });
}

// ─── SLIDE 2: Company Overview & Category Overview ──────────────────────
function buildOverviewSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.offWhite };

  // Title
  slide.addText("Company Overview & Roadshow Category", {
    x: 0.5, y: 0.25, w: 9, h: 0.5,
    fontSize: 22, bold: true, color: COLORS.navy,
    fontFace: FONTS.header,
  });

  // Thin divider
  slide.addShape("line", {
    x: 0.5, y: 0.78, w: 9, h: 0,
    line: { color: COLORS.blue, width: 1.5 },
  });

  // ── LEFT: Company Overview Card ──
  slide.addShape("rect", {
    x: 0.4, y: 1.0, w: 4.35, h: 4.2,
    fill: { color: COLORS.white },
    shadow: cardShadow(),
  });

  addSectionHeader(slide, "Company Overview", 0.4, 1.0, 4.35);

  const coFields = [
    ["Company", data.companyName],
    ["Category(s)", data.categories],
    ["Brands", data.brands],
    ["Market Share (US)", data.marketShareUS],
    ["Retailer Presence", data.retailerPresence],
    ["SC Partnerships", data.scPartnerships],
    ["Vendor Number", data.vendorNumber],
    ["Long Term Goal", data.longTermGoalCompany],
  ];
  coFields.forEach(([label, val], i) => {
    addFieldRow(slide, label, val, 0.55, 1.48 + i * 0.35, 4.0, 10);
  });

  // ── RIGHT: Roadshow Category Card ──
  slide.addShape("rect", {
    x: 5.25, y: 1.0, w: 4.35, h: 4.2,
    fill: { color: COLORS.white },
    shadow: cardShadow(),
  });

  addSectionHeader(slide, "Roadshow Category Overview", 5.25, 1.0, 4.35);

  const rcFields = [
    ["RS Category(s)", data.roadshowCategories],
    ["Supplier Mkt Share", data.supplierMarketShareCategory],
    ["Retailer in Category", data.retailerPresenceCategory],
    ["SC Merchant Partner", data.scMerchantPartnership],
    ["Long Term Goal (SC)", data.longTermGoalSC],
  ];
  rcFields.forEach(([label, val], i) => {
    addFieldRow(slide, label, val, 5.4, 1.48 + i * 0.35, 4.0, 10);
  });
}

// ─── SLIDE 3: Roadshow Event Details ────────────────────────────────────
function buildEventDetailsSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.offWhite };

  slide.addText("Roadshow Event Details", {
    x: 0.5, y: 0.25, w: 9, h: 0.5,
    fontSize: 22, bold: true, color: COLORS.navy,
    fontFace: FONTS.header,
  });

  slide.addShape("line", {
    x: 0.5, y: 0.78, w: 9, h: 0,
    line: { color: COLORS.blue, width: 1.5 },
  });

  // Main details card
  slide.addShape("rect", {
    x: 0.4, y: 1.0, w: 5.7, h: 4.2,
    fill: { color: COLORS.white },
    shadow: cardShadow(),
  });

  addSectionHeader(slide, "Event Configuration", 0.4, 1.0, 5.7);

  const evFields = [
    ["Event Description", data.eventDescription],
    ["Pallet Space", data.palletSpace],
    ["Schedule Type", data.scheduleType],
    ["Club Reach", data.clubReach],
    ["Proposed Length", data.proposedLength],
    ["Seasonal Peak", data.seasonalPeak],
    ["Staffing Partner", data.staffingPartner],
    ["Staffing Hours", data.staffingHours],
  ];
  evFields.forEach(([label, val], i) => {
    addFieldRow(slide, label, val, 0.55, 1.48 + i * 0.35, 5.4, 10);
  });

  // Sales projections card
  slide.addShape("rect", {
    x: 6.3, y: 1.0, w: 3.3, h: 4.2,
    fill: { color: COLORS.white },
    shadow: cardShadow(),
  });

  addSectionHeader(slide, "Sales Projections", 6.3, 1.0, 3.3);

  // Big number callouts
  const projections = [
    { label: "Daily Sales", value: data.prjDailySales || "$0", color: COLORS.blue },
    { label: "Per Show", value: data.prjSalesPerShow || "$0", color: COLORS.green },
    { label: "Annual Sales", value: data.prjAnnualSales || "$0", color: COLORS.navy },
    { label: "Annual Shows", value: data.prjAnnualShowCount || "0", color: COLORS.gold },
  ];

  projections.forEach((proj, i) => {
    const py = 1.55 + i * 0.65;
    slide.addText(proj.value, {
      x: 6.5, y: py, w: 2.9, h: 0.32,
      fontSize: 20, bold: true, color: proj.color,
      fontFace: FONTS.header, align: "center", margin: 0,
    });
    slide.addText(proj.label, {
      x: 6.5, y: py + 0.3, w: 2.9, h: 0.22,
      fontSize: 9, color: COLORS.gray,
      fontFace: FONTS.body, align: "center", margin: 0,
    });
  });
}

// ─── SLIDE 4: Roadshow Item Details ─────────────────────────────────────
function buildItemDetailsSlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.offWhite };

  slide.addText("Roadshow Item Details", {
    x: 0.5, y: 0.25, w: 9, h: 0.5,
    fontSize: 22, bold: true, color: COLORS.navy,
    fontFace: FONTS.header,
  });

  slide.addShape("line", {
    x: 0.5, y: 0.78, w: 9, h: 0,
    line: { color: COLORS.blue, width: 1.5 },
  });

  const items = data.items || [data.item1 || {}, data.item2 || {}];

  items.slice(0, 2).forEach((item, idx) => {
    const cx = idx === 0 ? 0.4 : 5.1;

    // Item card
    slide.addShape("rect", {
      x: cx, y: 1.0, w: 4.5, h: 4.2,
      fill: { color: COLORS.white },
      shadow: cardShadow(),
    });

    addSectionHeader(slide, `Item ${idx + 1}: ${item.description || "—"}`, cx, 1.0, 4.5);

    // Image placeholder
    if (item.imagePath && fs.existsSync(item.imagePath)) {
      slide.addImage({
        path: item.imagePath,
        x: cx + 1.25, y: 1.5, w: 2, h: 1.5,
        sizing: { type: "contain", w: 2, h: 1.5 },
      });
    } else {
      slide.addShape("rect", {
        x: cx + 1.25, y: 1.5, w: 2, h: 1.5,
        fill: { color: COLORS.lightGray },
      });
      slide.addText("Product Image", {
        x: cx + 1.25, y: 1.5, w: 2, h: 1.5,
        fontSize: 10, color: COLORS.gray, align: "center", valign: "middle",
        fontFace: FONTS.body,
      });
    }

    const itemFields = [
      ["Cost", item.cost],
      ["Retail", item.retail],
      ["SC Margin", item.scMargin],
      ["Lowest Mkt Retail", item.lowestMarketRetail],
      ["Currently Sold", item.currentlySold],
      ["SC Value to Mkt %", item.scValueToMarket],
      ["PRJ Sales/Day", item.prjSalesPerDay],
      ["PRJ Units/Day", item.prjUnitsPerDay],
    ];

    itemFields.forEach(([label, val], i) => {
      addFieldRow(slide, label, val, cx + 0.15, 3.1 + i * 0.26, 4.2, 9);
    });
  });
}

// ─── SLIDE 5: Annual Plan (New Supplier) ────────────────────────────────
function buildAnnualPlanSlide(pres, data, isExisting = false) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.offWhite };

  const title = isExisting
    ? "Existing Supplier 2026 Roadshow Annual Plan"
    : "2026 Roadshow Annual Plan — Newness Goals";

  slide.addText(title, {
    x: 0.5, y: 0.25, w: 9, h: 0.5,
    fontSize: 20, bold: true, color: COLORS.navy,
    fontFace: FONTS.header,
  });

  slide.addShape("line", {
    x: 0.5, y: 0.78, w: 9, h: 0,
    line: { color: COLORS.blue, width: 1.5 },
  });

  const quarters = [
    { label: "Q3 (Aug–Oct)", key: "q3", color: COLORS.blue },
    { label: "Q4 (Nov–Jan)", key: "q4", color: COLORS.navy },
    { label: "Q1 (Feb–Apr)", key: "q1", color: COLORS.green },
    { label: "Q2 (May–Jul)", key: "q2", color: COLORS.gold },
  ];

  const planData = isExisting ? (data.existingPlan || {}) : (data.annualPlan || {});

  quarters.forEach((q, i) => {
    const cx = 0.3 + i * 2.38;
    const qd = planData[q.key] || {};

    // Quarter card
    slide.addShape("rect", {
      x: cx, y: 1.0, w: 2.25, h: 4.3,
      fill: { color: COLORS.white },
      shadow: cardShadow(),
    });

    // Quarter header
    slide.addShape("rect", {
      x: cx, y: 1.0, w: 2.25, h: 0.38,
      fill: { color: q.color },
    });
    slide.addText(q.label, {
      x: cx, y: 1.0, w: 2.25, h: 0.38,
      fontSize: 11, bold: true, color: COLORS.white,
      fontFace: FONTS.header, align: "center", valign: "middle", margin: 0,
    });

    // Rendering placeholder
    if (qd.renderingPath && fs.existsSync(qd.renderingPath)) {
      slide.addImage({
        path: qd.renderingPath,
        x: cx + 0.25, y: 1.5, w: 1.75, h: 1.2,
        sizing: { type: "contain", w: 1.75, h: 1.2 },
      });
    } else {
      slide.addShape("rect", {
        x: cx + 0.25, y: 1.5, w: 1.75, h: 1.2,
        fill: { color: COLORS.lightGray },
      });
      slide.addText("Show Rendering", {
        x: cx + 0.25, y: 1.5, w: 1.75, h: 1.2,
        fontSize: 8, color: COLORS.gray, align: "center", valign: "middle",
        fontFace: FONTS.body,
      });
    }

    // Quarter fields
    const fields = isExisting
      ? [
          ["Show Items", qd.showItems],
          ["Item #s", qd.itemNumbers],
          ["PRJ Reach", qd.prjShowReach],
          ["PRJ Sales", qd.prjShowSales],
          ["LY Sales", qd.lySales],
        ]
      : [
          ["Show Items", qd.showItems],
          ["PRJ Reach", qd.prjShowReach],
          ["PRJ Sales", qd.prjShowSales],
        ];

    fields.forEach(([label, val], fi) => {
      slide.addText([
        { text: `${label}:`, options: { bold: true, fontSize: 8, color: COLORS.charcoal } },
      ], { x: cx + 0.1, y: 2.85 + fi * 0.5, w: 2.05, h: 0.18, fontFace: FONTS.body, margin: 0 });

      slide.addText(val || "—", {
        x: cx + 0.1, y: 3.02 + fi * 0.5, w: 2.05, h: 0.2,
        fontSize: 9, color: COLORS.darkGray,
        fontFace: FONTS.body, margin: 0,
      });
    });
  });
}

// ─── SLIDE 6: Summary / Contact ─────────────────────────────────────────
function buildSummarySlide(pres, data) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.navy };

  slide.addShape("rect", {
    x: 0, y: 0, w: 10, h: 0.06,
    fill: { color: COLORS.gold },
  });

  slide.addText("Thank You", {
    x: 0.8, y: 0.8, w: 8.4, h: 1,
    fontSize: 40, bold: true, color: COLORS.white,
    fontFace: FONTS.header,
  });

  slide.addText(data.companyName || "Brand Name", {
    x: 0.8, y: 1.7, w: 8.4, h: 0.6,
    fontSize: 22, color: COLORS.gold, bold: true,
    fontFace: FONTS.header,
  });

  slide.addShape("line", {
    x: 0.8, y: 2.5, w: 3, h: 0,
    line: { color: COLORS.gold, width: 2 },
  });

  // Contact details
  const contacts = [
    { label: "Supplier Team", value: data.supplierTeam },
    { label: "Email", value: data.contactEmail },
    { label: "Phone", value: data.contactPhone },
  ];

  contacts.forEach((c, i) => {
    if (c.value) {
      slide.addText([
        { text: `${c.label}: `, options: { bold: true, color: "B0C4DE" } },
        { text: c.value, options: { color: COLORS.white } },
      ], {
        x: 0.8, y: 2.8 + i * 0.4, w: 8, h: 0.35,
        fontSize: 13, fontFace: FONTS.body,
      });
    }
  });

  // Ascenda footer
  slide.addText("Prepared by Ascenda Sales\nSam's Club Roadshow Partner", {
    x: 0.8, y: 4.4, w: 8.4, h: 0.7,
    fontSize: 11, color: "7B8DA0", fontFace: FONTS.body,
  });

  slide.addShape("rect", {
    x: 0, y: 5.565, w: 10, h: 0.06,
    fill: { color: COLORS.gold },
  });
}

// ─── Main: Build Presentation ───────────────────────────────────────────
function generateRoadshow(data, outputPath) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Ascenda Sales";
  pres.title = `${data.companyName || "Brand"} — Roadshow 2026 Presentation`;
  pres.subject = "Sam's Club Roadshow Planning";

  buildTitleSlide(pres, data);
  buildOverviewSlide(pres, data);
  buildEventDetailsSlide(pres, data);
  buildItemDetailsSlide(pres, data);
  buildAnnualPlanSlide(pres, data, false);

  // Only add existing supplier slide if data says existing
  if (data.isExistingSupplier) {
    buildAnnualPlanSlide(pres, data, true);
  }

  buildSummarySlide(pres, data);

  return pres.writeFile({ fileName: outputPath })
    .then(() => console.log(`Presentation saved: ${outputPath}`));
}

// ─── Demo Data ──────────────────────────────────────────────────────────
const DEMO_DATA = {
  companyName: "NutriPure Foods",
  supplierTeam: "Sarah Chen, VP of Retail | Marcus Johnson, National Accounts",
  contactEmail: "sarah.chen@nutripure.com",
  contactPhone: "(555) 234-5678",
  categories: "Health & Wellness, Organic Snacks",
  brands: "NutriPure, VitaBites, CleanBar",
  marketShareUS: "4.2% (Organic Snacks)",
  retailerPresence: "Whole Foods, Target, Kroger, Costco",
  scPartnerships: "Category: Organic Snacks — Merchant: Lisa Park",
  vendorNumber: "VN-2024-0891",
  longTermGoalCompany: "Become #1 organic snack brand in club channel by 2028",
  roadshowCategories: "Organic Snacks, Protein Bars",
  supplierMarketShareCategory: "12.3% of club channel organic snacks",
  retailerPresenceCategory: "Present in 85% of Sam's Club locations",
  scMerchantPartnership: "Active partnership since Q2 2024",
  longTermGoalSC: "Expand from 2 SKUs to 5 SKUs, achieve $8M annual in-club",
  eventDescription: "Live sampling station with branded display and digital engagement",
  palletSpace: "2 pallets (double-stack)",
  scheduleType: "Ongoing — Year-round rotation",
  clubReach: "450+ clubs nationwide",
  proposedLength: "3-day events (Thu–Sat)",
  seasonalPeak: "January (New Year wellness), September (Back to School)",
  staffingPartner: "Club Demos Inc.",
  staffingHours: "8 hours/day, 2 staff per location",
  prjDailySales: "$2,400",
  prjSalesPerShow: "$7,200",
  prjAnnualSales: "$3.2M",
  prjAnnualShowCount: "450",
  isExistingSupplier: false,
  items: [
    {
      description: "NutriPure Organic Trail Mix 24oz",
      cost: "$8.50",
      retail: "$14.98",
      scMargin: "43.3%",
      lowestMarketRetail: "$16.99 (Whole Foods)",
      currentlySold: "Target, Kroger, Whole Foods, Amazon",
      scValueToMarket: "12% below market",
      prjSalesPerDay: "$1,400",
      prjUnitsPerDay: "94 units",
    },
    {
      description: "VitaBites Protein Bar 12-Pack",
      cost: "$12.00",
      retail: "$19.98",
      scMargin: "39.9%",
      lowestMarketRetail: "$22.99 (Target)",
      currentlySold: "Target, GNC, Amazon",
      scValueToMarket: "13% below market",
      prjSalesPerDay: "$1,000",
      prjUnitsPerDay: "50 units",
    },
  ],
  annualPlan: {
    q3: { showItems: "Trail Mix 24oz, Protein Bars 12pk", prjShowReach: "120 clubs", prjShowSales: "$864K" },
    q4: { showItems: "Holiday Gift Sampler, Trail Mix", prjShowReach: "150 clubs", prjShowSales: "$1.08M" },
    q1: { showItems: "New Year Wellness Pack, Protein Bars", prjShowReach: "100 clubs", prjShowSales: "$720K" },
    q2: { showItems: "Summer Snack Bundle, Trail Mix", prjShowReach: "80 clubs", prjShowSales: "$576K" },
  },
};

// ─── CLI ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDemo = args.includes("--demo");
const inputIdx = args.indexOf("--input");
const outputIdx = args.indexOf("--output");

let brandData = DEMO_DATA;
let outputFile = "Roadshow_2026_Presentation.pptx";

if (inputIdx >= 0 && args[inputIdx + 1]) {
  const inputPath = args[inputIdx + 1];
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }
  brandData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
}

if (outputIdx >= 0 && args[outputIdx + 1]) {
  outputFile = args[outputIdx + 1];
}

if (isDemo) {
  console.log("Generating DEMO Roadshow 2026 presentation...");
}

generateRoadshow(brandData, outputFile)
  .then(() => {
    console.log("Done! Slides generated:");
    console.log("  1. Title Slide");
    console.log("  2. Company Overview & Category");
    console.log("  3. Roadshow Event Details");
    console.log("  4. Item Details");
    console.log("  5. Annual Plan");
    if (brandData.isExistingSupplier) {
      console.log("  6. Existing Supplier Plan");
    }
    console.log("  6. Thank You / Contact");
  })
  .catch(err => {
    console.error("Error generating presentation:", err);
    process.exit(1);
  });

// Export for use as module
module.exports = { generateRoadshow, DEMO_DATA };
