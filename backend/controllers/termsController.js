const Terms = require('../models/termsModel');

// Public: Get Terms & Conditions (returns array of sections)
exports.getTerms = async (req, res) => {
  try {
    const terms = await Terms.find({}).sort({ order: 1 });
    if (!terms || terms.length === 0) {
      // Fallback static content if DB is empty
        const fallback = [
          {
            title: '1. Acceptance of Terms',
            content: 'By accessing and using EasyPG Manager, you agree to comply with and be bound by these Terms and Conditions. Our platform serves as a management tool for property owners and tenants.',
            order: 0
          },
          {
            title: '2. User Accounts',
            content: 'Users must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials.',
            order: 1
          },
          {
            title: '3. Booking & Notice Period',
            content: 'Only logged-in users can make bookings. For long-term stays, tenants must provide a mandatory 2-month notice via the platform before a Final Move-out. Failure to provide sufficient notice may result in a deposit deduction equivalent to the notice period rent.',
            order: 2
          },
          {
            title: '4. Payments & Late Fines',
            content: 'Rent is due by the 5th of every month unless a different date is specified by the Owner. Late fines are calculated automatically by the system. Owners have the authority to "Grant Extensions" for genuine reasons, which pauses the daily fine calculation.',
            order: 3
          },
          {
            title: '5. Security Deposits & Deductions',
            content: 'A mandatory Security Deposit is collected at booking and held as escrow. Refunds are processed after a "Final Check-out" inspection. Owners may deduct for physical damages, unpaid utility bills, or rent arrears. EasyPG Manager acts solely as a processing agent for these transactions.',
            order: 4
          },
          {
            title: '6. Maintenance & Responsibility',
            content: 'EasyPG Manager is a technology platform and is not responsible for the physical condition of the property. All maintenance issues, repairs, or damages are strictly between the Property Owner and the Tenant as per individual house rules.',
            order: 5
          },
          {
            title: '7. Check-out Types (Vacation vs. Final)',
            content: 'Temporary Check-out (Vacation) does not terminate the rental agreement and rent remains payable. Final Move-out terminates the agreement and triggers the official Security Deposit refund process after a 48-hour inspection window.',
            order: 6
          },
          {
            title: '8. Limitation of Liability',
            content: 'We are not liable for disputes between owners and tenants, third-party actions, or indirect damages arising from the use of the property or the platform.',
            order: 7
          }
        ];
      return res.status(200).json({ success: true, data: fallback });
    }
    res.status(200).json({ success: true, data: terms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Protected: Update Terms (admin usage) - expects array of sections in body
exports.updateTerms = async (req, res) => {
  try {
    const sections = req.body.sections; // [{ title, content, order }]
    if (!Array.isArray(sections)) return res.status(400).json({ success: false, message: 'sections array required' });

    // Simple approach: remove existing and replace with new sections
    await Terms.deleteMany({});
    const created = await Terms.insertMany(sections.map((s, i) => ({
      title: s.title,
      content: s.content,
      order: typeof s.order === 'number' ? s.order : i
    })));

    res.status(200).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
