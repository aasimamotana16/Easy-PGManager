const normalizeVariantKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const toVariantArray = (roomPrices) => {
  if (Array.isArray(roomPrices)) return roomPrices;
  if (!roomPrices || typeof roomPrices !== "object") return [];

  return Object.entries(roomPrices).map(([key, value]) => {
    if (value && typeof value === "object") {
      return {
        variantName: key,
        ...value
      };
    }
    return {
      variantName: key,
      price: Number(value) || 0
    };
  });
};

const mergeRoomPriceVariants = (existingRoomPrices, incomingRoomPrices) => {
  const existing = toVariantArray(existingRoomPrices);
  const incoming = toVariantArray(incomingRoomPrices);
  if (incoming.length === 0) return existing;

  const byKey = new Map();
  existing.forEach((variant) => {
    const key = normalizeVariantKey(
      variant?.variantName ||
      variant?.variantLabel ||
      variant?.roomType ||
      variant?.type ||
      variant?.label ||
      variant?.name
    );
    if (key) byKey.set(key, { ...variant });
  });

  incoming.forEach((variant) => {
    const key = normalizeVariantKey(
      variant?.variantName ||
      variant?.variantLabel ||
      variant?.roomType ||
      variant?.type ||
      variant?.label ||
      variant?.name
    );
    if (!key) return;
    const current = byKey.get(key) || {};
    byKey.set(key, { ...current, ...variant });
  });

  return Array.from(byKey.values());
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const pickVariantLabel = (variant, fallbackRoomType = "") => {
  return (
    variant?.variantName ||
    variant?.variantLabel ||
    variant?.roomType ||
    variant?.type ||
    variant?.label ||
    variant?.name ||
    fallbackRoomType ||
    "Standard"
  );
};

const resolveVariantPricing = ({
  roomPrices,
  roomType,
  variantLabel,
  fallbackRent = 0,
  fallbackDeposit = 0
}) => {
  const variants = toVariantArray(roomPrices);
  const roomKey = normalizeVariantKey(roomType);
  const labelKey = normalizeVariantKey(variantLabel);

  let matched = null;
  const candidates = variants.filter(Boolean);

  if (candidates.length > 0) {
    matched = candidates.find((variant) => {
      const key = normalizeVariantKey(
        variant?.variantName ||
        variant?.variantLabel ||
        variant?.roomType ||
        variant?.type ||
        variant?.label ||
        variant?.name
      );
      if (!key) return false;
      if (labelKey && key === labelKey) return true;
      if (roomKey && key === roomKey) return true;
      if (labelKey && (key.includes(labelKey) || labelKey.includes(key))) return true;
      if (roomKey && (key.includes(roomKey) || roomKey.includes(key))) return true;
      return false;
    }) || null;
  }

  if (!matched && !Array.isArray(roomPrices) && roomPrices && typeof roomPrices === "object") {
    if (roomKey.includes("single") && roomPrices.single !== undefined) {
      matched = { variantName: "Single", price: roomPrices.single };
    } else if (roomKey.includes("double") && roomPrices.double !== undefined) {
      matched = { variantName: "Double", price: roomPrices.double };
    } else if (roomKey.includes("triple") && roomPrices.triple !== undefined) {
      matched = { variantName: "Triple", price: roomPrices.triple };
    } else if (roomPrices.other !== undefined) {
      matched = { variantName: "Other", price: roomPrices.other };
    }
  }

  const rentAmount = toNumber(
    matched?.rent ??
    matched?.price ??
    matched?.pricePerMonth ??
    matched?.monthlyRent ??
    fallbackRent
  );
  const securityDeposit = toNumber(
    matched?.securityDeposit ??
    matched?.deposit ??
    matched?.advancePayment ??
    fallbackDeposit
  );

  return {
    matched,
    variantLabel: pickVariantLabel(matched, roomType),
    rentAmount,
    securityDeposit,
    billingCycle: matched?.billingCycle || matched?.rentCycle || "Monthly",
    acType: matched?.acType || "Non-AC",
    features: matched?.features && typeof matched.features === "object" ? matched.features : {}
  };
};

module.exports = {
  normalizeVariantKey,
  toVariantArray,
  mergeRoomPriceVariants,
  resolveVariantPricing
};

