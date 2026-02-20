const Profile = require('../models/profileModel');
const User = require('../models/userModel');

// 1. Fetch the FULL profile for initial load
exports.getProfile = async (req, res) => {
  try {
    // Get userId from the decoded token (authMiddleware)
    const userId = req.user.id; 
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      // Return an empty object if no profile exists yet so frontend doesn't crash
      return res.status(200).json({ success: true, data: {} });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Fetch SPECIFIC sections (To stop the 404 errors)
// Use camelCase naming as requested [cite: 2026-01-01]

// Personal section only
exports.getPersonalProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).select("personalInfo");
    res.status(200).json({ success: true, data: profile?.personalInfo || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Academic section only
exports.getAcademicProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).select("academicInfo");
    const academic = profile?.academicInfo || {};
    res.status(200).json({
      success: true,
      data: { ...academic, collegeYear: academic.collegeYear ?? "NOT SET" }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmergencyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).select("emergencyContact");
    res.status(200).json({ success: true, data: profile?.emergencyContact || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).select("paymentDetails");
    res.status(200).json({ success: true, data: profile?.paymentDetails || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: calculate profile completion based on Profile + User data
const calculateProfileCompletion = (user, profile) => {
  if (!user || !profile) return user?.profileCompletion || 0;

  const hasAny = (obj, keys) =>
    keys.some((k) => {
      const v = obj?.[k];
      return v && v !== "NOT SET";
    });

  let filledSections = 0;
  const totalSections = 5; // personal, academic, emergency, payment, picture

  if (
    hasAny(profile.personalInfo || {}, [
      "fullName",
      "phone",
      "age",
      "bloodGroup",
      "city",
      "state",
      "email",
    ])
  ) {
    filledSections++;
  }

  if (
    hasAny(profile.academicInfo || {}, [
      "status",
      "qualification",
      "company",
      "workAddress",
    ])
  ) {
    filledSections++;
  }

  if (
    hasAny(profile.emergencyContact || {}, [
      "guardianName",
      "relationship",
      "guardianPhone",
    ])
  ) {
    filledSections++;
  }

  if (
    hasAny(profile.paymentDetails || {}, [
      "holder",
      "bank",
      "ifsc",
      "account",
    ])
  ) {
    filledSections++;
  }

  // Profile picture from User model
  if (user.profilePicture) {
    filledSections++;
  }

  const completion = Math.round((filledSections / totalSections) * 100);
  return Math.max(0, Math.min(100, completion));
};

// 3. Update profile sections
exports.updateProfile = async (req, res) => {
  try {
    const { section, data } = req.body; 
    const userId = req.user.id;

    if (!section || typeof data !== "object") {
      return res.status(400).json({ success: false, message: "Invalid payload for profile update" });
    }

    // Dynamically build the update path (e.g., "academicInfo": { ... })
    const updatePath = {};
    updatePath[section] = data;

    const userRole = req.user.role === "owner" ? "owner" : "tenant";
    await Profile.findOneAndUpdate(
      { userId },
      { $set: updatePath, $setOnInsert: { userRole } },
      { new: true, upsert: true }
    );

    // Fetch full, updated profile and user to recalculate completion
    const [fullProfile, user] = await Promise.all([
      Profile.findOne({ userId }),
      User.findById(userId).select("+profilePicture +profileCompletion"),
    ]);

    if (user && fullProfile) {
      // Keep legacy User document in sync with Profile personal/emergency sections.
      if (section === "personalInfo") {
        user.fullName = data.fullName || user.fullName;
        user.phone = data.phone || user.phone;
        user.city = data.city || user.city;
        user.state = data.state || user.state;
      }
      if (section === "emergencyContact") {
        user.emergencyContact = user.emergencyContact || {};
        user.emergencyContact.contactName = data.guardianName || user.emergencyContact.contactName;
        user.emergencyContact.relationship = data.relationship || user.emergencyContact.relationship;
        user.emergencyContact.phoneNumber = data.guardianPhone || user.emergencyContact.phoneNumber;
      }
      user.profileCompletion = calculateProfileCompletion(user, fullProfile);
      await user.save();
    }

    // Return ONLY the updated section so frontend can patch its local state
    const updatedSection = fullProfile ? fullProfile[section] : null;

    res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
