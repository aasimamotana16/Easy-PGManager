const getServicesPageData = async (req, res) => {
  try {
    const services = [
      {
        id: 1,
        title: "PG Management",
        description: "Streamline tenant records, rent tracking, and PG operations with ease.",
        icon: "\ud83c\udfe0",
      },
      {
        id: 2,
        title: "Billing & Payments",
        description: "Automated invoices, reminders, and secure payment integrations.",
        icon: "\ud83d\udcb3",
      },
      {
        id: 3,
        title: "Support & Maintenance",
        description: "Track service requests and manage maintenance schedules efficiently.",
        icon: "\ud83d\udee0\ufe0f",
      },
      {
        id: 4,
        title: "Verified Listings",
        description: "Browse verified PGs and hostels with all the details you need.",
        icon: "\ud83d\udccb",
      },
    ];

    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch services data" });
  }
};

module.exports = { getServicesPageData };
