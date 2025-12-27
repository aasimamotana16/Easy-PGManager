export const getFeatures = (req, res) => {
  res.json({
    title: "Everything You Need to Manage Your PG",
    description:
      "Powerful features designed to simplify daily operations for PG and hostel owners.",
    features: [
      {
        title: "Easy Room Management",
        description:
          "Add, edit, and manage rooms effortlessly with our intuitive interface."
      },
      {
        title: "Automated Billing",
        description:
          "Generate invoices automatically and keep track of payments with ease."
      },
      {
        title: "Tenant Tracking",
        description:
          "Monitor tenants’ details, lease periods, and history efficiently."
      },
      {
        title: "Attendance Management",
        description:
         "Keep track of tenant attendance and room usage for smooth operations."
      },
      {
        title: "Custom Notifications",
        description:
          "Send reminders, alerts, and announcements to tenants directly."
      },
      {
        title: "Reports & Analytics",
        description:
          "Gain insights with detailed reports and analytics for smarter decisions."
      }
    ]
  });
};