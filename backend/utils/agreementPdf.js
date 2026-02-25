const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Booking = require("../models/bookingModel");
const Pg = require("../models/pgModel");
const User = require("../models/userModel");
const AdminConfig = require("../models/adminConfigModel");
const { resolveVariantPricing } = require("./pricingUtils");

const getAgreementSettingsFromAdminConfig = async () => {
  // Shape 1: new model style -> { key: "global", agreementSettings: {...} }
  const globalConfig = await AdminConfig.findOne({ key: "global" }).lean();
  if (globalConfig?.agreementSettings) return globalConfig.agreementSettings;

  // Shape 2: key/value style in adminconfigs -> { key: "agreementSettings", value: {...} }
  const keyValueConfig = await AdminConfig.findOne({ key: "agreementSettings" }).lean();
  if (keyValueConfig?.value && typeof keyValueConfig.value === "object") {
    return keyValueConfig.value;
  }

  return {
    fixedClauses: [],
    jurisdiction: "",
    platformDisclaimer: "",
    esignConsentText: ""
  };
};

const pickFirstNumeric = (...values) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
};

const parseInventoryObject = (rawInventory) => {
  if (rawInventory && typeof rawInventory === "object") return rawInventory;
  if (typeof rawInventory === "string") {
    try {
      const parsed = JSON.parse(rawInventory);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (_) {
      return {};
    }
  }
  return {};
};

const resolveInventory = (pgDoc) => {
  const inventory = parseInventoryObject(pgDoc?.inventory);
  const derivedRoomsCount = Array.isArray(pgDoc?.rooms)
    ? pgDoc.rooms.reduce((sum, room) => sum + (Number(room?.totalRooms) || 0), 0)
    : 0;
  const derivedBedsFromRooms = Array.isArray(pgDoc?.rooms)
    ? pgDoc.rooms.reduce((sum, room) => {
        const totalRooms = Number(room?.totalRooms) || 0;
        const bedsPerRoom = Number(room?.bedsPerRoom) || 0;
        return sum + (totalRooms * bedsPerRoom);
      }, 0)
    : 0;

  const bedCount = pickFirstNumeric(
    inventory.bedCount,
    inventory.bedsCount,
    inventory.bed,
    inventory.beds,
    pgDoc?.bedCount,
    pgDoc?.bedsCount,
    pgDoc?.bed,
      pgDoc?.beds,
      derivedBedsFromRooms
  );
  const fallbackMattressCount = bedCount;
  const fallbackRoomFixtures = derivedRoomsCount || 0;

  return {
    bedCount,
    fanCount: pickFirstNumeric(
      inventory.fanCount,
      inventory.fansCount,
      inventory.fanscount,
      inventory.fan,
      inventory.fans,
      inventory.Fan,
      inventory.Fans,
      pgDoc?.fanCount,
      pgDoc?.fansCount,
      pgDoc?.fan,
      pgDoc?.fans,
      fallbackRoomFixtures
    ),
    lightCount: pickFirstNumeric(
      inventory.lightCount,
      inventory.lightsCount,
      inventory.lightcount,
      inventory.light,
      inventory.lights,
      inventory.Light,
      inventory.Lights,
      pgDoc?.lightCount,
      pgDoc?.lightsCount,
      pgDoc?.light,
      pgDoc?.lights,
      fallbackRoomFixtures
    ),
    mattressCount: pickFirstNumeric(
      inventory.mattressCount,
      inventory.mattressesCount,
      inventory.matterssCount,
      inventory.mattress,
      inventory.mattresses,
      inventory.matterss,
      pgDoc?.mattressCount,
      pgDoc?.mattressesCount,
      pgDoc?.mattress,
      pgDoc?.mattresses,
      fallbackMattressCount
    ),
    cupboardCount: pickFirstNumeric(
      inventory.cupboardCount,
      inventory.cupboardsCount,
      inventory.cupBoardCount,
      inventory.cupboard,
      inventory.cupboards,
      inventory.cupBoard,
      pgDoc?.cupboardCount,
      pgDoc?.cupboardsCount,
      pgDoc?.cupboard,
      pgDoc?.cupboards,
      fallbackRoomFixtures
    )
  };
};

const getBookingByIdentifier = async (bookingId) => {
  let booking = null;
  if (bookingId && String(bookingId).match(/^[a-fA-F0-9]{24}$/)) {
    booking = await Booking.findById(bookingId);
  }
  if (!booking) {
    booking = await Booking.findOne({ bookingId: String(bookingId || "") });
  }
  return booking;
};

const ensurePageSpace = (doc, minSpace = 80) => {
  if (doc.y > doc.page.height - minSpace) {
    doc.addPage();
  }
};

const CONTENT_LEFT = 50;
const CONTENT_WIDTH = 495;

const writeBodyLine = (doc, text) => {
  doc.text(text, CONTENT_LEFT, doc.y, { width: CONTENT_WIDTH });
};

const normalizeListValues = (...candidateLists) => {
  const set = new Set();
  candidateLists.forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      const normalized = String(item || "").trim();
      if (normalized) set.add(normalized);
    });
  });
  return Array.from(set);
};

const formatRuleStatus = (label, value) => `${label}: ${value ? "Allowed" : "Not Allowed"}`;

const drawSectionTitle = (doc, title) => {
  ensurePageSpace(doc, 120);
  doc.moveDown(0.4);
  doc.x = CONTENT_LEFT;
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111").text(title, CONTENT_LEFT, doc.y, {
    underline: true,
    width: CONTENT_WIDTH
  });
  doc.moveDown(0.3);
  doc.x = CONTENT_LEFT;
  doc.font("Helvetica").fontSize(10.5).fillColor("#111111");
};

const drawInventoryTable = (doc, inventoryRows) => {
  ensurePageSpace(doc, 220);

  const tableLeft = 55;
  const tableTop = doc.y;
  const tableWidth = 500;
  const rowHeight = 24;
  const col1Width = 360;
  const col2Width = tableWidth - col1Width;
  const totalRows = 1 + inventoryRows.length;
  const tableHeight = totalRows * rowHeight;

  doc.rect(tableLeft, tableTop, tableWidth, tableHeight).stroke("#1F2937");
  doc.moveTo(tableLeft + col1Width, tableTop).lineTo(tableLeft + col1Width, tableTop + tableHeight).stroke("#1F2937");

  for (let i = 1; i < totalRows; i += 1) {
    const y = tableTop + i * rowHeight;
    doc.moveTo(tableLeft, y).lineTo(tableLeft + tableWidth, y).stroke("#1F2937");
  }

  doc.font("Helvetica-Bold").fontSize(10.5);
  doc.text("Item", tableLeft + 8, tableTop + 7, { width: col1Width - 16 });
  doc.text("Quantity", tableLeft + col1Width + 8, tableTop + 7, { width: col2Width - 16 });

  doc.font("Helvetica").fontSize(10.5);
  inventoryRows.forEach((row, index) => {
    const y = tableTop + (index + 1) * rowHeight + 7;
    doc.text(row.item, tableLeft + 8, y, { width: col1Width - 16 });
    doc.text(String(row.quantity), tableLeft + col1Width + 8, y, { width: col2Width - 16 });
  });

  doc.y = tableTop + tableHeight + 8;
  doc.x = CONTENT_LEFT;
};

const writePdf = async ({ outputPath, agreementData }) => {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  doc.font("Helvetica-Bold").fontSize(18).fillColor("#111111").text("ELECTRONIC RENTAL AGREEMENT", {
    align: "center"
  });
  doc.moveDown(0.7);
  doc.moveDown(0.4);

  drawSectionTitle(doc, "Parties & Booking Details");
  writeBodyLine(doc, `Booking ID: ${agreementData.bookingCode}`);
  writeBodyLine(doc, `Owner (First Party): ${agreementData.ownerName}`);
  writeBodyLine(doc, `Tenant (Second Party): ${agreementData.tenantName}`);
  writeBodyLine(doc, `Property Name: ${agreementData.propertyName}`);
  writeBodyLine(doc, `City: ${agreementData.city}`);
  writeBodyLine(doc, `Area/Landmark: ${agreementData.area}`);
  writeBodyLine(doc, `Full Address: ${agreementData.address}`);
  writeBodyLine(doc, `Accommodation Variant: ${agreementData.variantLabel}`);
  writeBodyLine(doc, `Check-In Date: ${agreementData.checkInDate}`);
  writeBodyLine(doc, `Check-Out Date: ${agreementData.checkOutDate}`);
  writeBodyLine(doc, `Room Type Selected: ${agreementData.roomTypeLabel}`);
  writeBodyLine(doc, `Bed Type: ${agreementData.acTypeLabel}`);

  drawSectionTitle(doc, "Financial Terms");
  writeBodyLine(doc, `Monthly Rent: INR ${agreementData.rentAmount}`);
  writeBodyLine(doc, `Security Deposit: INR ${agreementData.securityDeposit}`);

  drawSectionTitle(doc, "Property Facilities");
  writeBodyLine(doc, `Total Facilities Provided: ${agreementData.facilityCount}`);
  if (agreementData.facilities.length > 0) {
    writeBodyLine(doc, `Facilities List: ${agreementData.facilities.join(", ")}`);
  } else {
    writeBodyLine(doc, "Facilities List: Not specified by owner");
  }

  drawSectionTitle(doc, "Property Rules");
  if (agreementData.rules.length > 0) {
    agreementData.rules.forEach((rule, index) => {
      writeBodyLine(doc, `${index + 1}. ${rule}`);
    });
  } else {
    writeBodyLine(doc, "No house rules specified by owner.");
  }

  drawSectionTitle(doc, "Schedule A: Property Inventory");
  drawInventoryTable(doc, agreementData.inventoryRows);
  doc.font("Helvetica").fontSize(10.5);
  writeBodyLine(
    doc,
    "The Tenant accepts the premises with the above-listed fixtures in good working condition."
  );

  drawSectionTitle(doc, "Administrative Clauses");
  if (agreementData.fixedClauses.length > 0) {
    agreementData.fixedClauses.forEach((clause, index) => {
      writeBodyLine(doc, `${index + 1}. ${clause}`);
    });
  } else {
    writeBodyLine(doc, "No fixed clauses configured.");
  }
  doc.moveDown(0.2);
  writeBodyLine(doc, `Jurisdiction: ${agreementData.jurisdiction || "Not specified"}`);
  writeBodyLine(doc, `Platform Disclaimer: ${agreementData.platformDisclaimer || "Not specified"}`);

  drawSectionTitle(doc, "Signature & Digital Verification");
  const signTop = doc.y + 8;
  const boxWidth = 235;
  const boxHeight = 95;
  const leftX = 50;
  const rightX = 310;
  ensurePageSpace(doc, boxHeight + 40);
  const signY = doc.y;
  doc.rect(leftX, signY, boxWidth, boxHeight).stroke("#1F2937");
  doc.rect(rightX, signY, boxWidth, boxHeight).stroke("#1F2937");
  doc.font("Helvetica-Bold").fontSize(10.5);
  doc.text("First Party (Owner)", leftX + 8, signY + 8, { width: boxWidth - 16 });
  doc.text("Second Party (Tenant)", rightX + 8, signY + 8, { width: boxWidth - 16 });
  doc.font("Helvetica").fontSize(10);
  doc.text("Signature: ____________________", leftX + 8, signY + 35);
  doc.text("Digitally Verified At: ____________________", leftX + 8, signY + 56);
  doc.text("Signature: ____________________", rightX + 8, signY + 35);
  doc.text("Digitally Verified At: ____________________", rightX + 8, signY + 56);
  doc.y = signY + boxHeight + 10;

  if (agreementData.esignConsentText) {
    doc.font("Helvetica-Oblique").fontSize(9.5).fillColor("#374151").text(agreementData.esignConsentText);
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

const generateAgreementPdf = async (bookingId) => {
  const booking = await getBookingByIdentifier(bookingId);
  if (!booking) {
    throw new Error("Booking not found for agreement PDF generation");
  }

  const pgDoc = booking.pgId
    ? await Pg.findById(booking.pgId).lean()
    : await Pg.findOne({ pgName: booking.pgName }).lean();
  if (!pgDoc) {
    throw new Error("PG not found for booking");
  }

  const [owner, tenantUser, agreementSettings] = await Promise.all([
    booking.ownerId ? User.findById(booking.ownerId).select("fullName").lean() : null,
    booking.tenantUserId ? User.findById(booking.tenantUserId).select("fullName").lean() : null,
    getAgreementSettingsFromAdminConfig()
  ]);

  // Locked booking values are source of truth
  let rentAmount = Number(booking.rentAmount || booking.bookingAmount || 0);
  let securityDeposit = Number(booking.securityDeposit || 0);
  let variantLabel = String(booking.variantLabel || "").trim();

  // Fallback using mixed roomPrices if locked values are missing
  if (!rentAmount || !securityDeposit || !variantLabel) {
    const variantPricing = resolveVariantPricing({
      roomPrices: pgDoc?.roomPrices,
      roomType: booking.roomType || "",
      variantLabel: booking.variantLabel || "",
      fallbackRent: Number(pgDoc?.price || 0),
      fallbackDeposit: Number(pgDoc?.securityDeposit || 0)
    });

    if (!rentAmount) rentAmount = Number(variantPricing.rentAmount || 0);
    if (!securityDeposit) securityDeposit = Number(variantPricing.securityDeposit || 0);
    if (!variantLabel) variantLabel = String(variantPricing.variantLabel || booking.roomType || "Standard");
  }

  const inventory = resolveInventory(pgDoc);
  const fixedClauses = Array.isArray(agreementSettings?.fixedClauses) ? agreementSettings.fixedClauses : [];
  const jurisdiction = String(agreementSettings?.jurisdiction || "").trim();
  const platformDisclaimer = String(agreementSettings?.platformDisclaimer || "").trim();
  const esignConsentText = String(agreementSettings?.esignConsentText || "").trim();

  const tenantName = String(booking.tenantName || tenantUser?.fullName || "Tenant");
  const ownerName = String(owner?.fullName || "Owner");
  const propertyName = String(pgDoc?.pgName || booking.pgName || "PG Property");
  const checkInDate = String(booking.checkInDate || "");
  const checkOutDate = String(booking.checkOutDate || "Long Term");
  const city = String(pgDoc?.city || "").trim() || "Not specified";
  const area = String(pgDoc?.area || "").trim() || "Not specified";
  const address = String(pgDoc?.address || pgDoc?.location || "").trim() || "Not specified";
  const facilities = normalizeListValues(pgDoc?.facilities, pgDoc?.amenities);
  const rules = [
    formatRuleStatus("Smoking", Boolean(pgDoc?.rules?.smoking)),
    formatRuleStatus("Alcohol", Boolean(pgDoc?.rules?.alcohol)),
    formatRuleStatus("Visitors", Boolean(pgDoc?.rules?.visitors)),
    formatRuleStatus("Pets", Boolean(pgDoc?.rules?.pets))
  ];
  const curfew = String(pgDoc?.rules?.curfew || "").trim();
  if (curfew) {
    rules.push(`Gate Closing Time: ${curfew}`);
  }
  const roomTypeLabel = String(booking.roomType || booking.variantLabel || pgDoc?.occupancy || "Not specified");
  const acTypeLabel = String(booking.acType || booking.acPreference || "Not specified");

  const safeBookingToken = String(booking.bookingId || booking._id).replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `agreement-${safeBookingToken}-${Date.now()}.pdf`;
  const absolutePath = path.join(__dirname, "..", "uploads", "agreements", fileName);
  const publicUrl = `/uploads/agreements/${fileName}`;

  await writePdf({
    outputPath: absolutePath,
    agreementData: {
      bookingCode: String(booking.bookingId || booking._id),
      ownerName,
      tenantName,
      propertyName,
      city,
      area,
      address,
      variantLabel,
      checkInDate,
      checkOutDate,
      roomTypeLabel,
      acTypeLabel,
      rentAmount,
      securityDeposit,
      facilityCount: facilities.length,
      facilities,
      rules,
      inventoryRows: [
        { item: "Fans", quantity: Number(inventory.fanCount ?? 0) || 0 },
        { item: "Lights", quantity: Number(inventory.lightCount ?? 0) || 0 },
        { item: "Beds", quantity: Number(inventory.bedCount ?? 0) || 0 },
        { item: "Mattresses", quantity: Number(inventory.mattressCount ?? 0) || 0 },
        { item: "Cupboards", quantity: Number(inventory.cupboardCount ?? 0) || 0 }
      ],
      fixedClauses: fixedClauses.map((clause) => String(clause || "").trim()).filter(Boolean),
      jurisdiction,
      platformDisclaimer,
      esignConsentText: esignConsentText || "By proceeding, both parties consent to digital agreement execution."
    }
  });

  booking.agreementPdfUrl = publicUrl;
  await booking.save();

  return {
    bookingId: booking._id,
    bookingCode: booking.bookingId,
    agreementPdfUrl: publicUrl,
    absolutePath
  };
};

const generateAgreementPreviewPdfByPgId = async (pgId) => {
  const pgDoc = await Pg.findById(pgId).lean();
  if (!pgDoc) {
    throw new Error("PG not found for agreement preview");
  }

  const owner = pgDoc?.ownerId ? await User.findById(pgDoc.ownerId).select("fullName").lean() : null;
  const agreementSettings = await getAgreementSettingsFromAdminConfig();

  const previewPricing = resolveVariantPricing({
    roomPrices: pgDoc?.roomPrices,
    roomType: pgDoc?.occupancy || "Single",
    variantLabel: "",
    fallbackRent: Number(pgDoc?.price || 0),
    fallbackDeposit: Number(pgDoc?.securityDeposit || 0)
  });
  const inventory = resolveInventory(pgDoc);

  const ownerName = String(owner?.fullName || "Owner");
  const tenantName = "Prospective Tenant";
  const propertyName = String(pgDoc?.pgName || "PG Property");
  const checkInDate = "To be decided";
  const checkOutDate = "As per booking";
  const city = String(pgDoc?.city || "").trim() || "Not specified";
  const area = String(pgDoc?.area || "").trim() || "Not specified";
  const address = String(pgDoc?.address || pgDoc?.location || "").trim() || "Not specified";
  const facilities = normalizeListValues(pgDoc?.facilities, pgDoc?.amenities);
  const rules = [
    formatRuleStatus("Smoking", Boolean(pgDoc?.rules?.smoking)),
    formatRuleStatus("Alcohol", Boolean(pgDoc?.rules?.alcohol)),
    formatRuleStatus("Visitors", Boolean(pgDoc?.rules?.visitors)),
    formatRuleStatus("Pets", Boolean(pgDoc?.rules?.pets))
  ];
  const curfew = String(pgDoc?.rules?.curfew || "").trim();
  if (curfew) rules.push(`Gate Closing Time: ${curfew}`);

  const roomTypeLabel = String(previewPricing.variantLabel || pgDoc?.occupancy || "Not specified");
  const acTypeLabel = String(previewPricing.acType || "Not specified");
  const rentAmount = Number(previewPricing.rentAmount || pgDoc?.price || 0);
  const securityDeposit = Number(previewPricing.securityDeposit || pgDoc?.securityDeposit || 0);

  const safePgToken = String(pgDoc?._id || pgId).replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `agreement-preview-${safePgToken}-${Date.now()}.pdf`;
  const absolutePath = path.join(__dirname, "..", "uploads", "agreements", fileName);
  const publicUrl = `/uploads/agreements/${fileName}`;

  await writePdf({
    outputPath: absolutePath,
    agreementData: {
      bookingCode: `PREVIEW-${safePgToken}`,
      ownerName,
      tenantName,
      propertyName,
      city,
      area,
      address,
      variantLabel: roomTypeLabel,
      checkInDate,
      checkOutDate,
      roomTypeLabel,
      acTypeLabel,
      rentAmount,
      securityDeposit,
      facilityCount: facilities.length,
      facilities,
      rules,
      inventoryRows: [
        { item: "Fans", quantity: Number(inventory.fanCount ?? 0) || 0 },
        { item: "Lights", quantity: Number(inventory.lightCount ?? 0) || 0 },
        { item: "Beds", quantity: Number(inventory.bedCount ?? 0) || 0 },
        { item: "Mattresses", quantity: Number(inventory.mattressCount ?? 0) || 0 },
        { item: "Cupboards", quantity: Number(inventory.cupboardCount ?? 0) || 0 }
      ],
      fixedClauses: (Array.isArray(agreementSettings?.fixedClauses) ? agreementSettings.fixedClauses : [])
        .map((clause) => String(clause || "").trim())
        .filter(Boolean),
      jurisdiction: String(agreementSettings?.jurisdiction || "").trim(),
      platformDisclaimer: String(agreementSettings?.platformDisclaimer || "").trim(),
      esignConsentText: String(agreementSettings?.esignConsentText || "").trim() || "Preview copy for booking terms."
    }
  });

  return {
    pgId: pgDoc._id,
    agreementPdfUrl: publicUrl,
    absolutePath
  };
};

module.exports = {
  generateAgreementPdf,
  generateAgreementPreviewPdfByPgId
};
