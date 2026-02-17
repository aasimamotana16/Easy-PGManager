// Public: Get Privacy Policy content for frontend page.
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const fallback = {
      title: "Privacy Policy",
      intro: "",
      lastUpdated: "February 2026",
      sections: [
        {
          heading: "Information We Collect",
          content:
            "We collect personal details such as name, email, phone number, and booking information."
        },
        {
          heading: "Usage of Information",
          content:
            "Your information is used to process bookings, improve services, and communicate updates."
        },
        {
          heading: "Data Security",
          content:
            "We use industry-standard security practices to protect your data."
        },
        {
          heading: "Third-Party Sharing",
          content:
            "We do not sell or share your personal information with third parties except when required by law."
        },
        {
          heading: "User Rights",
          content:
            "You may request access, correction, or deletion of your data by contacting us."
        }
      ]
    };

    return res.status(200).json({ success: true, data: fallback });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
