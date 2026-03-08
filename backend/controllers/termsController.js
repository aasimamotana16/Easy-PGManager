const Terms = require('../models/termsModel');

const DEFAULT_TERMS = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using EasyPG Manager, you agree to comply with these Terms and Conditions. The platform provides digital management services for property owners and tenants, including booking management, payments, and tenant communication.',
    order: 0
  },
  {
    title: '2. User Accounts',
    content:
      'Users must provide accurate and complete information during registration. Each user is responsible for maintaining the confidentiality of their login credentials, including username and password. Any activity performed through a user account will be considered the responsibility of that account holder.',
    order: 1
  },
  {
    title: '3. Booking Confirmation & Security Deposit',
    content:
      'A booking is considered confirmed only after the tenant pays the required security deposit through the EasyPG Manager platform. The security deposit reserves the selected room or bed for the tenant until the move-in date.',
    order: 2
  },
  {
    title: '4. Move-In Requirement & No-Show Policy',
    content:
      'Tenants must complete the rent payment and move-in process on or before the scheduled check-in date. If the tenant does not complete move-in before the check-in date, the booking will automatically be marked as a No-Show. In such cases: the reserved room may be released and made available for other tenants; 15% of the security deposit will be deducted as a reservation fee; the remaining 85% of the security deposit may be refunded after the tenant completes the booking cancellation process.',
    order: 3
  },
  {
    title: '5. Booking Cancellation',
    content:
      'Tenants may cancel their booking through the platform dashboard. If cancellation occurs after a No-Show status is applied, the refund will follow the No-Show deduction policy described above.',
    order: 4
  },
  {
    title: '6. Booking & Notice Period',
    content:
      'These rules apply only to long-term stays. Tenants must provide a minimum notice period of 1 month before their final move-out date. If the tenant provides less than 1 month notice: a fixed fine of INR 5,000 will be applied; the fine is applied once per move-out request, not per day; the INR 5,000 fine will be deducted from the security deposit during final settlement; if the security deposit is less than INR 5,000, the remaining amount will be shown as payable by the tenant. If the tenant provides 1 month or more notice, no notice fine will be charged. If the tenant leaves the property earlier than the selected move-out date, the system calculates pro-rated rent based on the actual number of days stayed, which may be deducted from the security deposit during final settlement.',
    order: 5
  },
  {
    title: '7. Payments & Late Fines',
    content:
      "Monthly rent must be paid through the EasyPG Manager platform. If payment is delayed beyond the system-defined due date, late payment fines may be automatically applied according to the platform's configured rules.",
    order: 6
  },
  {
    title: '8. Security Deposits & Deductions',
    content:
      'A security deposit is collected at the time of booking and held by the platform as an escrow amount until the tenant completes their stay. After final move-out: a final inspection of the property is conducted by the owner; security deposit refunds are processed after a 48-hour inspection window. Owners may deduct reasonable amounts for physical damages to property, unpaid utility bills, pending rent payments, and applicable fines or penalties defined in the system. EasyPG Manager acts only as a transaction processing platform and does not make decisions in disputes.',
    order: 7
  },
  {
    title: '9. Maintenance & Responsibility',
    content:
      'EasyPG Manager is strictly a technology platform that connects property owners and tenants. The platform is not responsible for the physical condition of the property, maintenance issues, repairs, or damages. All such matters must be resolved directly between the property owner and the tenant according to individual property rules.',
    order: 8
  },
  {
    title: '10. Check-out Types (Vacation vs Final Move-out)',
    content:
      'Temporary Check-out (Vacation): the tenant leaves the property temporarily while the rental agreement remains active, and rent payments must continue during this period. Final Move-out: the tenant permanently leaves the property, the rental agreement is terminated, and the security deposit refund process begins after the 48-hour inspection period.',
    order: 9
  },
  {
    title: '11. Limitation of Liability',
    content:
      'EasyPG Manager shall not be held liable for disputes between property owners and tenants, actions or services provided by third parties, or any indirect or incidental damages related to the use of the platform or property. The platform only provides digital management tools and payment processing services.',
    order: 10
  },
  {
    title: '12. Booking, Payment, Commission, and Move-In Process',
    content:
      'PG Booking: The user searches for a PG on the platform, reviews property details, room types, facilities, and rent details, then books a selected room. Payment Process: To confirm booking, payment must be completed through the platform payment gateway. After successful payment, booking status becomes Confirmed Booking. Platform Commission: EasyPG Manager charges a 10% service commission on platform payments and automatically calculates it during transaction processing. Example: if monthly rent is INR 6000, platform commission is INR 600 and amount transferred to PG owner is INR 5400. Monthly Rent Payments: If the tenant continues paying rent through the platform each month, the same commission rule applies for every payment cycle. Move-In Request: After booking and payment, the tenant must physically visit the PG on the selected move-in date and send a move-in request in the system. Owner Verification: The PG owner verifies tenant arrival offline at property and approves move-in from owner dashboard after physical confirmation. Move-In Confirmation: Once owner approves, tenant status updates to Moved In or Active Tenant. Important Note: EasyPG Manager provides listing, booking, and payment management tools; physical verification of arrival is the responsibility of the PG owner.',
    order: 11
  },
  {
    title: '13. Refund Policy',
    content:
      'Booking Cancellation Before Move-In: If the tenant cancels before move-in date, a partial refund may be processed based on cancellation timing. Platform service commission is non-refundable because booking service has been provided. Example: if tenant paid INR 6000 and commission is 10% (INR 600), commission will not be refunded, and remaining amount may be refunded as per cancellation policy. Cancellation After Move-In: If tenant has already moved in, refunds are generally not applicable; any refund decision depends on agreement between PG owner and tenant. Owner Cancellation: If PG owner cancels before tenant moves in, tenant receives full refund of booking amount. Platform Responsibility: EasyPG Manager acts only as a platform connecting tenants and PG owners; final decisions on accommodation issues, disputes, or special refund cases may involve the PG owner.',
    order: 12
  }
];

// Public: Get Terms & Conditions (returns array of sections)
exports.getTerms = async (req, res) => {
  try {
    const terms = await Terms.find({}).sort({ order: 1 });
    if (!terms || terms.length === 0) {
      return res.status(200).json({ success: true, data: DEFAULT_TERMS });
    }
    return res.status(200).json({ success: true, data: terms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    return res.status(200).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
