// Generates trackers/stargate-tracker.xlsx — StarGate sales + finance tracker.
// Run: npm run tracker
// Sheets: README, Outreach, Merchant_Stats, Product_Feedback, Customers, Finance, Dashboard.
// Template only: one sample row per sheet (slug=test-cafe), no real PII.
import ExcelJS from "exceljs";
import path from "node:path";

const OUT = path.join(process.cwd(), "trackers", "stargate-tracker.xlsx");
const DATA_ROWS = 300; // validated/formatted rows (2..301)
const firstDataRow = 2;
const lastRow = DATA_ROWS + 1;

const STAGES = ["Prospect", "Lead", "Walk-in", "Demo", "Negotiation", "Closed", "Lost"];
const CATEGORIES = ["Cafe", "Salon", "Dental", "Gym", "Other"];
const OBJECTIONS = ["No time", "Has reviews", "Price", "Complaints fear", "Other", ""];
const YES_NO = ['"Y,N"'];
const PLANS = ['"Monthly \u20B9299,Yearly \u20B92999"'];
const STATUS = ['"Active,Lapsed,Cancelled"'];
const PAY_MODES = ['"UPI,Cash,Other"'];
const FIN_TYPES = ['"Revenue,Expense"'];
const REV_CATS = ['"Subscription-Monthly,Subscription-Yearly,Setup fee \u20B9499,Other Revenue"'];
const EXP_CATS = ['"Domain,Printing/Poster,Travel/Fuel,Gateway fee,Other Expense"'];
const YN_BLANK = ['"Y,N,"'];
const FB_CHANNELS = ['"Revisit,WhatsApp,Call,Telegram,Dashboard inbox,Other"'];
const FB_TYPES = ['"Bug,UX issue,Feature request,Pricing,Onboarding,Praise,Churn risk"'];
const FB_PRIORITY = ['"P1-critical,P2-important,P3-later"'];
const FB_STATUS = ['"Open,In Progress,Done,Won\'t fix"'];

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
const HEADER_FONT = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };

function styleHeader(ws, colCount) {
  const header = ws.getRow(1);
  header.height = 22;
  for (let c = 1; c <= colCount; c++) {
    const cell = header.getCell(c);
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", wrapText: true };
  }
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: colCount } };
}

function colLetter(col) {
  let s = "";
  let n = col;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function addValidation(ws, col, formula, allowBlank = true) {
  ws.dataValidations.add(`${colLetter(col)}2:${colLetter(col)}${lastRow}`, {
    type: "list",
    allowBlank,
    showDropDown: false,
    formulae: [formula],
  });
}

const wb = new ExcelJS.Workbook();
wb.creator = "StarGate";
wb.created = new Date();

// ---------- README ----------
{
  const ws = wb.addWorksheet("README");
  ws.columns = [{ width: 22 }, { width: 110 }];
  const lines = [
    ["Sheet", "How to use"],
    ["Outreach", "Log every prospect. When Stage -> Closed, copy Shop/Slug into Customers + Finance (revenue row). Set Next_FollowUp; overdue dates highlight red."],
    ["Merchant_Stats", "Every Monday copy per-shop numbers from /dashboard. Total + Conversion% auto-calc. 1 row per merchant per week."],
    ["Product_Feedback", "Every merchant comment about StarGate itself (bug, UX, feature, pricing, churn risk). Triage weekly: Priority + Status; follow up with the merchant before renewals."],
    ["Customers", "One row per PAYING shop. Renewal_Due within 7 days highlights amber. Overdue + Active highlights red."],
    ["Finance", "One row per money movement. Balance + Month auto-calc. Revenue cats: Subscription-Monthly/Yearly, Setup fee. Expense cats: Domain, Printing/Poster, Travel/Fuel, Gateway fee."],
    ["Dashboard", "Formulas only — do not type here. Funnel counts, conversion %, Active MRR, cash MTD, renewals due."],
    ["Privacy", "Template ships with test-cafe sample only. Do NOT commit real phones / txn refs — keep business data in your local copy."],
    ["Regenerate", "Edit scripts/generate-tracker.mjs then run: npm run tracker"],
  ];
  lines.forEach(([a, b], i) => {
    const r = ws.getRow(i + 1);
    r.getCell(1).value = a;
    r.getCell(2).value = b;
    r.getCell(2).alignment = { wrapText: true, vertical: "top" };
    if (i === 0) {
      r.getCell(1).fill = HEADER_FILL;
      r.getCell(2).fill = HEADER_FILL;
      r.getCell(1).font = HEADER_FONT;
      r.getCell(2).font = HEADER_FONT;
    }
  });
}

// ---------- Outreach ----------
{
  const ws = wb.addWorksheet("Outreach");
  const headers = [
    "ID", "Date_Added", "Shop_Name", "Category", "Owner_Name", "Phone", "Area",
    "Stage", "Last_Contact", "Next_FollowUp", "Demo_Done", "Objection",
    "Expected_MRR", "Lost_Reason", "Notes", "Days_In_Stage",
  ];
  ws.columns = [
    { header: headers[0], key: "id", width: 8 },
    { header: headers[1], key: "date", width: 13 },
    { header: headers[2], key: "shop", width: 24 },
    { header: headers[3], key: "cat", width: 12 },
    { header: headers[4], key: "owner", width: 18 },
    { header: headers[5], key: "phone", width: 16 },
    { header: headers[6], key: "area", width: 16 },
    { header: headers[7], key: "stage", width: 13 },
    { header: headers[8], key: "last", width: 14 },
    { header: headers[9], key: "next", width: 14 },
    { header: headers[10], key: "demo", width: 11 },
    { header: headers[11], key: "obj", width: 16 },
    { header: headers[12], key: "mrr", width: 14 },
    { header: headers[13], key: "lost", width: 20 },
    { header: headers[14], key: "notes", width: 32 },
    { header: headers[15], key: "days", width: 14 },
  ];
  styleHeader(ws, headers.length);
  // Sample row (test-cafe only, no PII)
  ws.addRow({
    id: 1, date: new Date(), shop: "Test Cafe", cat: "Cafe", owner: "Sample Owner",
    phone: "", area: "Sample Area", stage: "Demo", last: new Date(), next: new Date(Date.now() + 2 * 864e5),
    demo: "Y", obj: "Price", mrr: 299, lost: "", notes: "Sample — replace with your first real prospect.",
  });
  // Days_In_Stage formulas for all data rows
  for (let r = firstDataRow; r <= lastRow; r++) {
    ws.getCell(`P${r}`).value = { formula: `IF(H${r}="Closed","",IF(I${r}="","",TODAY()-I${r}))` };
    if (r > 2) ws.getRow(r).height = 18;
  }
  // Number/date formats
  for (let r = firstDataRow; r <= lastRow; r++) {
    for (const c of ["B", "I", "J"]) ws.getCell(`${c}${r}`).numFmt = "yyyy-mm-dd";
    ws.getCell(`M${r}`).numFmt = "#,##0";
  }
  addValidation(ws, 4, `"${CATEGORIES.join(",")}"`);
  addValidation(ws, 8, `"${STAGES.join(",")}"`, false);
  addValidation(ws, 11, YES_NO[0]);
  addValidation(ws, 12, `"${OBJECTIONS.filter(Boolean).join(",")}"`);
  // Conditional formatting
  ws.addConditionalFormatting({
    ref: `J2:J${lastRow}`,
    rules: [{
      type: "cellIs", operator: "lessThan", priority: 1,
      formulae: ["TODAY()"],
      style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFECACA" } } },
    }],
  });
  ws.addConditionalFormatting({
    ref: `H2:H${lastRow}`,
    rules: [
      { type: "cellIs", operator: "equal", priority: 2, formulae: ['"Closed"'], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFBBF7D0" } } } },
      { type: "cellIs", operator: "equal", priority: 3, formulae: ['"Lost"'], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFE5E7EB" } } } },
    ],
  });
}

// ---------- Merchant_Stats ----------
{
  const ws = wb.addWorksheet("Merchant_Stats");
  const headers = [
    "Week_Start_Mon", "Slug", "Shop_Name", "Count_1_3_Private", "Count_4_5",
    "Total_Feedbacks", "Review_Clicks", "Review_Conversion_Pct", "Poster_On_Wall", "ROI_Sent", "Notes",
  ];
  ws.columns = [
    { header: headers[0], width: 16 }, { header: headers[1], width: 18 }, { header: headers[2], width: 24 },
    { header: headers[3], width: 18 }, { header: headers[4], width: 12 }, { header: headers[5], width: 16 },
    { header: headers[6], width: 14 }, { header: headers[7], width: 20 }, { header: headers[8], width: 14 },
    { header: headers[9], width: 11 }, { header: headers[10], width: 32 },
  ];
  styleHeader(ws, headers.length);
  ws.addRow([new Date(), "test-cafe", "Test Cafe", 2, 6, null, 4, null, "Y", "Y", "Sample — copy real numbers from /dashboard each Monday."]);
  for (let r = firstDataRow; r <= lastRow; r++) {
    ws.getCell(`F${r}`).value = { formula: `IF(AND(D${r}="",E${r}=""),"",SUM(D${r}:E${r}))` };
    ws.getCell(`H${r}`).value = { formula: `IFERROR(IF(E${r}="","",G${r}/E${r}),"")` };
    ws.getCell(`A${r}`).numFmt = "yyyy-mm-dd";
    ws.getCell(`H${r}`).numFmt = "0%";
    if (r > 2) ws.getRow(r).height = 18;
  }
  addValidation(ws, 9, YN_BLANK[0]);
  addValidation(ws, 10, YN_BLANK[0]);
}

// ---------- Product_Feedback (merchant feedback about StarGate itself) ----------
{
  const ws = wb.addWorksheet("Product_Feedback");
  const headers = [
    "ID", "Date", "Slug", "Shop_Name", "Given_By", "Channel", "Type",
    "Feedback_Verbatim", "Priority", "Status", "Action_Taken", "Followed_Up",
    "Days_Open", "Notes",
  ];
  ws.columns = [
    { header: headers[0], width: 8 }, { header: headers[1], width: 13 },
    { header: headers[2], width: 18 }, { header: headers[3], width: 24 },
    { header: headers[4], width: 18 }, { header: headers[5], width: 16 },
    { header: headers[6], width: 16 }, { header: headers[7], width: 44 },
    { header: headers[8], width: 14 }, { header: headers[9], width: 13 },
    { header: headers[10], width: 30 }, { header: headers[11], width: 12 },
    { header: headers[12], width: 11 }, { header: headers[13], width: 30 },
  ];
  styleHeader(ws, headers.length);
  ws.addRow([1, new Date(), "test-cafe", "Test Cafe", "Sample Owner", "Revisit", "Feature request", "Sample — QR poster text too small to read from the wall.", "P2-important", "Open", "", "N", null, "Sample — replace with the first real merchant comment."]);
  for (let r = firstDataRow; r <= lastRow; r++) {
    ws.getCell(`B${r}`).numFmt = "yyyy-mm-dd";
    ws.getCell(`H${r}`).alignment = { wrapText: true, vertical: "top" };
    ws.getCell(`M${r}`).value = { formula: `IF(OR(J${r}="Done",J${r}="Won't fix"),"",IF(B${r}="","",TODAY()-B${r}))` };
    if (r > 2) ws.getRow(r).height = 30;
  }
  addValidation(ws, 6, FB_CHANNELS[0]);
  addValidation(ws, 7, FB_TYPES[0], false);
  addValidation(ws, 9, FB_PRIORITY[0], false);
  addValidation(ws, 10, FB_STATUS[0], false);
  addValidation(ws, 12, YN_BLANK[0]);
  // P1-critical priority -> red fill
  ws.addConditionalFormatting({
    ref: `I2:I${lastRow}`,
    rules: [{
      type: "cellIs", operator: "equal", priority: 1,
      formulae: ['"P1-critical"'],
      style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFECACA" } } },
    }],
  });
  // Open status -> amber fill
  ws.addConditionalFormatting({
    ref: `J2:J${lastRow}`,
    rules: [{
      type: "cellIs", operator: "equal", priority: 2,
      formulae: ['"Open"'],
      style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFEF3C7" } } },
    }],
  });
  // Churn-risk type -> red text
  ws.addConditionalFormatting({
    ref: `G2:G${lastRow}`,
    rules: [{
      type: "cellIs", operator: "equal", priority: 3,
      formulae: ['"Churn risk"'],
      style: { font: { color: { argb: "FFDC2626" }, bold: true } },
    }],
  });
}

// ---------- Customers ----------
{
  const ws = wb.addWorksheet("Customers");
  const headers = [
    "Customer_ID", "Shop_Name", "Slug", "Plan", "Start_Date", "Renewal_Due",
    "Amount_Paid", "Pay_Mode", "Txn_Ref", "Status", "Phone", "Notes",
  ];
  ws.columns = [
    { header: headers[0], width: 13 }, { header: headers[1], width: 24 }, { header: headers[2], width: 18 },
    { header: headers[3], width: 16 }, { header: headers[4], width: 13 }, { header: headers[5], width: 13 },
    { header: headers[6], width: 13 }, { header: headers[7], width: 11 }, { header: headers[8], width: 18 },
    { header: headers[9], width: 11 }, { header: headers[10], width: 16 }, { header: headers[11], width: 30 },
  ];
  styleHeader(ws, headers.length);
  const start = new Date();
  const due = new Date(start.getTime() + 30 * 864e5);
  ws.addRow(["C-001", "Test Cafe", "test-cafe", "Monthly \u20B9299", start, due, 299, "UPI", "", "Active", "", "Sample — replace with first paying shop."]);
  for (let r = firstDataRow; r <= lastRow; r++) {
    ws.getCell(`E${r}`).numFmt = "yyyy-mm-dd";
    ws.getCell(`F${r}`).numFmt = "yyyy-mm-dd";
    ws.getCell(`G${r}`).numFmt = "#,##0";
    if (r > 2) ws.getRow(r).height = 18;
  }
  addValidation(ws, 4, PLANS[0], false);
  addValidation(ws, 8, PAY_MODES[0]);
  addValidation(ws, 10, STATUS[0], false);
  // Due within 7 days -> amber
  ws.addConditionalFormatting({
    ref: `F2:F${lastRow}`,
    rules: [{
      type: "cellIs", operator: "between", priority: 1,
      formulae: ["TODAY()", "TODAY()+7"],
      style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFEF3C7" } } },
    }],
  });
}

// ---------- Finance ----------
{
  const ws = wb.addWorksheet("Finance");
  const headers = ["Date", "Type", "Category", "Detail_Merchant", "Amount_In", "Amount_Out", "Balance", "Month"];
  ws.columns = [
    { header: headers[0], width: 13 }, { header: headers[1], width: 11 }, { header: headers[2], width: 22 },
    { header: headers[3], width: 28 }, { header: headers[4], width: 13 }, { header: headers[5], width: 13 },
    { header: headers[6], width: 14 }, { header: headers[7], width: 10 },
  ];
  styleHeader(ws, headers.length);
  ws.addRow([new Date(), "Revenue", "Subscription-Monthly", "test-cafe — sample", 299, "", null, null]);
  ws.addRow([new Date(), "Expense", "Printing/Poster", "Laminated demo poster (~Rs 20)", "", 20, null, null]);
  for (let r = firstDataRow; r <= lastRow; r++) {
    ws.getCell(`A${r}`).numFmt = "yyyy-mm-dd";
    ws.getCell(`E${r}`).numFmt = "#,##0";
    ws.getCell(`F${r}`).numFmt = "#,##0";
    ws.getCell(`G${r}`).numFmt = "#,##0";
    ws.getCell(`G${r}`).value = r === 2
      ? { formula: `IF(AND(E2="",F2=""),"",SUM(E2)-SUM(F2))` }
      : { formula: `IF(AND(E${r}="",F${r}=""),"",G${r - 1}+IF(E${r}="",0,E${r})-IF(F${r}="",0,F${r}))` };
    ws.getCell(`H${r}`).value = { formula: `IF(A${r}="","",TEXT(A${r},"yyyy-mm"))` };
    if (r > 3) ws.getRow(r).height = 18;
  }
  addValidation(ws, 2, FIN_TYPES[0], false);
  // Category depends on Type only by convention (two lists merged); keep single open validation note in README.
  // Apply combined revenue+expense list so no false rejections:
  addValidation(ws, 3, '"Subscription-Monthly,Subscription-Yearly,Setup fee \u20B9499,Other Revenue,Domain,Printing/Poster,Travel/Fuel,Gateway fee,Other Expense"');
  void REV_CATS;
  void EXP_CATS;
}

// ---------- Dashboard ----------
{
  const ws = wb.addWorksheet("Dashboard");
  ws.columns = [{ width: 30 }, { width: 22 }, { width: 46 }];
  ws.getRow(1).values = ["Metric", "Value", "Formula / note"];
  styleHeader(ws, 3);
  const rows = [
    ["Funnel — Prospect", { formula: 'COUNTIF(Outreach!H2:H301,"Prospect")' }, "Count of Outreach Stage"],
    ["Funnel — Lead", { formula: 'COUNTIF(Outreach!H2:H301,"Lead")' }, ""],
    ["Funnel — Walk-in", { formula: 'COUNTIF(Outreach!H2:H301,"Walk-in")' }, ""],
    ["Funnel — Demo", { formula: 'COUNTIF(Outreach!H2:H301,"Demo")' }, ""],
    ["Funnel — Negotiation", { formula: 'COUNTIF(Outreach!H2:H301,"Negotiation")' }, ""],
    ["Funnel — Closed", { formula: 'COUNTIF(Outreach!H2:H301,"Closed")' }, ""],
    ["Funnel — Lost", { formula: 'COUNTIF(Outreach!H2:H301,"Lost")' }, ""],
    ["Close rate (Closed / decided)", { formula: 'IFERROR(COUNTIF(Outreach!H2:H301,"Closed")/MAX(1,COUNTIF(Outreach!H2:H301,"Closed")+COUNTIF(Outreach!H2:H301,"Lost")),"")' }, "Format as % in Excel"],
    ["Active Monthly subs", { formula: `COUNTIFS(Customers!D2:D301,"Monthly \u20B9299",Customers!J2:J301,"Active")` }, "Plan strings must match dropdown"],
    ["Active Yearly subs", { formula: `COUNTIFS(Customers!D2:D301,"Yearly \u20B92999",Customers!J2:J301,"Active")` }, ""],
    ["Active MRR (Rs)", { formula: 'B10*299+B11*2999/12' }, "Yearly amortised /12"],
    ["Cash IN this month (Rs)", { formula: 'SUMIFS(Finance!E2:E301,Finance!H2:H301,TEXT(TODAY(),"yyyy-mm"))' }, "Uses Finance Month col"],
    ["Cash OUT this month (Rs)", { formula: 'SUMIFS(Finance!F2:F301,Finance!H2:H301,TEXT(TODAY(),"yyyy-mm"))' }, ""],
    ["Net this month (Rs)", { formula: "B13-B14" }, ""],
    ["Renewals due next 7d", { formula: 'COUNTIFS(Customers!F2:F301,">="&TODAY(),Customers!F2:F301,"<="&TODAY()+7,Customers!J2:J301,"Active")' }, "Chase on WhatsApp (SALES.md Day-30 loop)"],
    ["Renewals OVERDUE", { formula: 'COUNTIFS(Customers!F2:F301,"<"&TODAY(),Customers!J2:J301,"Active")' }, "Visit beats 3 messages"],
    ["Feedbacks last 28d", { formula: 'SUMIFS(Merchant_Stats!F2:F301,Merchant_Stats!A2:A301,">="&TODAY()-28)' }, ""],
    ["Review clicks last 28d", { formula: 'SUMIFS(Merchant_Stats!G2:G301,Merchant_Stats!A2:A301,">="&TODAY()-28)' }, "ROI line for renewal WhatsApp"],
    ["Product feedback — Open", { formula: 'COUNTIF(Product_Feedback!J2:J301,"Open")' }, "Triage weekly; follow up before renewals"],
    ["Product feedback — P1 open", { formula: 'COUNTIFS(Product_Feedback!I2:I301,"P1-critical",Product_Feedback!J2:J301,"Open")+COUNTIFS(Product_Feedback!I2:I301,"P1-critical",Product_Feedback!J2:J301,"In Progress")' }, "Fix first"],
    ["Churn risks open", { formula: 'COUNTIFS(Product_Feedback!G2:G301,"Churn risk",Product_Feedback!J2:J301,"Open")+COUNTIFS(Product_Feedback!G2:G301,"Churn risk",Product_Feedback!J2:J301,"In Progress")' }, "Visit beats 3 messages"],
    ["Product feedback — Done 28d", { formula: 'COUNTIFS(Product_Feedback!J2:J301,"Done",Product_Feedback!B2:B301,">="&TODAY()-28)' }, "Velocity; reuse as renewal-WA proof"],
  ];
  rows.forEach(([label, val, note]) => { ws.addRow([label, val, note]); });
  ws.getColumn(2).numFmt = "#,##0";
  for (let r = 2; r <= rows.length + 1; r++) {
    ws.getCell(`C${r}`).alignment = { wrapText: true, vertical: "top" };
  }
  ws.sheetProtection = undefined;
}

await wb.xlsx.writeFile(OUT);
console.log(`Wrote ${OUT}`);
