exports.getAboutPageData = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        intro: {
          since: "Since 2026",
          headingMain: "Redefining",
          headingHighlight: "PG Management",
          description:
            "We bridge the gap between PG owners and tenants through an intuitive, all-in-one digital dashboard.",
          mission:
            "Our mission is to simplify bookings, automate payments, and provide real-time tracking for every property.",
        },
        whoWeServe: [
          {
            role: "Tenants",
            desc: "Find PGs, manage billing, raise complaints, and connect directly with owners.",
          },
          {
            role: "Owners",
            desc: "Manage rules, billing, agreements, and tenant communication effortlessly.",
          },
          {
            role: "Students & Professionals",
            desc: "Flexible rental plans and transparent agreements for peace of mind.",
          },
        ],
        features: {
          ownerFeatures: [
            {
              title: "Property Management",
              desc: "Easily track rooms, beds, and availability across multiple buildings.",
            },
            {
              title: "Revenue Tracking",
              desc: "Real-time analytics for rent collection and pending payments.",
            },
            {
              title: "Tenant Onboarding",
              desc: "Quick digital registration with document verification support.",
            },
            {
              title: "Notice Board",
              desc: "Broadcast important announcements to all tenants instantly.",
            },
          ],
          userFeatures: [
            {
              title: "Rent Payments",
              desc: "Pay rent online securely and keep track of your payment history.",
            },
            {
              title: "Issue Reporting",
              desc: "Raise maintenance requests directly to the owner with status updates.",
            },
            {
              title: "Digital Docs",
              desc: "Access your rental agreement and receipts anytime, anywhere.",
            },
            {
              title: "Secure Living",
              desc: "Verified owner details and secure digital check-in process.",
            },
          ],
        },
        whyChooseUs: {
          description:
            "We believe PG living should be stress-free. Our platform ensures transparency, convenience, and trust between tenants and owners. With a premium design and intuitive features, EasyPG Manager makes smart living truly simplified.",
          points: [
            {
              title: "Smart Automation",
              desc: "Automate rent reminders and payment tracking effortlessly.",
            },
            {
              title: "Secure Data",
              desc: "Your tenant and property data is protected with enterprise-level security.",
            },
            {
              title: "Real-time Analytics",
              desc: "Get instant insights into your PG's occupancy and revenue.",
            },
            {
              title: "Easy Communication",
              desc: "Bridge the gap between owners and tenants with built-in tools.",
            },
          ],
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
