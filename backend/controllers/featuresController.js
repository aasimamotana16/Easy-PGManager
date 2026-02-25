const Feature = require("../models/featureModel");

const DEFAULT_HOME_FEATURES = [
  {
    _id: "owner-1",
    title: "Easy Room Management",
    desc: "Add, edit, and manage rooms effortlessly with our intuitive interface.",
    category: "home",
    role: "owner",
    iconName: "room"
  },
  {
    _id: "owner-2",
    title: "Automated Billing",
    desc: "Generate invoices automatically and keep track of payments with ease.",
    category: "home",
    role: "owner",
    iconName: "payment"
  },
  {
    _id: "owner-3",
    title: "Tenant Tracking",
    desc: "Monitor tenants' details, lease periods, and history efficiently.",
    category: "home",
    role: "owner",
    iconName: "tenant"
  },
  {
    _id: "owner-4",
    title: "Reports & Analytics",
    desc: "Gain insights with detailed reports and analytics for smarter decisions.",
    category: "home",
    role: "owner",
    iconName: "analytics"
  },
  {
    _id: "owner-5",
    title: "Booking Oversight",
    desc: "Track incoming bookings, approvals, and occupancy from one clear panel.",
    category: "home",
    role: "owner",
    iconName: "booking"
  },
  {
    _id: "owner-6",
    title: "Agreement Control",
    desc: "Create and manage tenant agreements digitally with complete audit visibility.",
    category: "home",
    role: "owner",
    iconName: "verified"
  },
  {
    _id: "tenant-1",
    title: "Find My PG",
    desc: "Search through verified listings to find the perfect stay near your university.",
    category: "home",
    role: "tenant",
    iconName: "verified"
  },
  {
    _id: "tenant-2",
    title: "Instant Mobile Updates",
    desc: "Receive real-time notifications for rent reminders and announcements.",
    category: "home",
    role: "tenant",
    iconName: "updates"
  },
  {
    _id: "tenant-3",
    title: "Easy Payments",
    desc: "Pay your rent securely online and download receipts instantly.",
    category: "home",
    role: "tenant",
    iconName: "payment"
  },
  {
    _id: "tenant-4",
    title: "24/7 Support",
    desc: "Raise maintenance requests and get support directly through the app.",
    category: "home",
    role: "tenant",
    iconName: "support"
  },
  {
    _id: "tenant-5",
    title: "Owner Contact",
    desc: "Connect with your property owner quickly for rent, move-in, and agreement help.",
    category: "home",
    role: "tenant",
    iconName: "support"
  },
  {
    _id: "tenant-6",
    title: "Digital Agreements",
    desc: "View and download your agreement anytime with transparent rental terms.",
    category: "home",
    role: "tenant",
    iconName: "verified"
  }
];

// camelCase function name
const getHomeFeatures = async (req, res) => {
  try {
    const homeFeatures = await Feature.find({ category: "home" }).lean();
    const hasRoleAwareData = homeFeatures.some((f) => {
      const role = String(f?.role || "").toLowerCase();
      return role === "owner" || role === "tenant";
    });

    if (homeFeatures.length === 0 || !hasRoleAwareData) {
      return res.status(200).json(DEFAULT_HOME_FEATURES);
    }

    const normalized = homeFeatures.map((f) => ({
      ...f,
      role: String(f?.role || "").toLowerCase()
    }));

    res.status(200).json(normalized);
  } catch (err) {
    res.status(500).json({ message: "Error fetching features", error: err });
  }
};

module.exports = { getHomeFeatures };
