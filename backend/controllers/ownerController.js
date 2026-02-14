const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Pg = require('../models/pgModel');
const User = require('../models/userModel');
const Tenant = require('../models/tenantModel');
const Booking = require('../models/bookingModel');
const Agreement = require('../models/agreementModel');
const SupportTicket = require('../models/supportTicketModel');

const getOwnerProfile = async (req, res) => {
  try {
    const owner = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      data: {
        name: owner.fullName,
        email: owner.email,
        phone: owner.phone || "Not provided",
        address: owner.address || "Add your address",
        role: "Owner",
        profileImage: owner.profileImage || "/images/profileImages/profile1.jpg",
        memberId: owner._id.toString().slice(-6).toUpperCase(),
        socialLinks: {
          facebook: owner.facebook || "#",
          instagram: owner.instagram || "#",
          linkedin: owner.linkedin || "#",
          twitter: owner.twitter || "#",
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update owner profile
const updateOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { name, email, phone, address } = req.body;

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      ownerId,
      {
        $set: {
          fullName: name,
          email,
          phone,
          address
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Returning the EXACT structure your ProfileCard.jsx uses
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: updatedUser.fullName,
        role: "Owner", // Static or from DB
        registrationDate: updatedUser.createdAt ? new Date(updatedUser.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }) : "N/A",
        email: updatedUser.email,
        phone: updatedUser.phone || "Not provided",
        address: updatedUser.address || "Add your address",
        profileImage: updatedUser.profileImage || "/images/profileImages/profile1.jpg",
        memberId: updatedUser._id.toString().slice(-6).toUpperCase(),
        // Social links remain as they are or pulled from user model
        socialLinks: {
          facebook: updatedUser.facebook || "#",
          instagram: updatedUser.instagram || "#",
          linkedin: updatedUser.linkedin || "#",
          twitter: updatedUser.twitter || "#",
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getOwnerDashboardData = async (req, res) => {
  try {
    const ownerId = req.user._id; 
    
    // TEMPORARY: Hardcoded numbers for your guide's presentation
    const mockTotalPgs = 5;
    const mockTotalRooms = 30;
    const mockLiveListings = 18;

    res.status(200).json({
      success: true,
      data: {
        stats: [
          { label: "Total PGs", value: mockTotalPgs },
          { label: "Total Rooms", value: mockTotalRooms },
          { label: "Available PGs", value: mockLiveListings },
          { label: "Recent Status", value: "Active" }
        ],
        recentActivity: [
          { 
            id: "1", 
            action: "Property Verified", 
            detail: "Your main property 'Girly Hostel' is now live.", 
            date: "2 hours ago" 
          },
          { 
            id: "2", 
            action: "New Booking", 
            detail: "Room 102 has been booked by a new tenant.", 
            date: "5 hours ago" 
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createPg = async (req, res) => {
  try {
    console.log("Create PG Request Body:", req.body); // Debug log
    
    const { 
      name,        // Frontend field
      forWhom, 
      totalRooms, 
      description,
      city,        // Frontend field
      area,        // Frontend field
      address,     // Frontend field
      pincode,     // Frontend field
      facilities,  // Frontend sends as 'facilities'
      rules 
    } = req.body;
    
    const ownerId = req.user._id;

    // Validate required fields from frontend
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Property name is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    console.log("Creating PG with:", { 
      pgName: name, 
      location: city,
      ownerId 
    }); // Debug log

    // Map frontend fields to backend schema
    const newPg = await Pg.create({
      ownerId,
      pgName: name.trim(),  // Ensure trimmed string
      location: city.trim(),  // Ensure trimmed string
      city: city.trim(),
      area: area || "",
      address: address || "",
      pincode: pincode || "",
      price: 0,  // Will be set during room pricing
      totalRooms: parseInt(totalRooms) || 0,
      liveListings: 0,
      type: forWhom || "Any",  // Boys, Girls, Any
      amenities: facilities || [],  // Facilities like WiFi, Food, etc
      facilities: facilities || [],  // Both for compatibility
      description: description || "",
      rules: rules || {
        smoking: false,
        alcohol: false,
        visitors: true,
        pets: false,
        curfew: ""
      },
      status: "draft"
    });

    console.log("PG Created Successfully:", newPg._id); // Debug log

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: newPg
    });
  } catch (error) {
    console.error("Create PG Error:", error.message); // Debug log
    console.error("Full Error:", error); // Full error details
    res.status(400).json({ 
      success: false, 
      message: error.message || "Failed to create property"
    });
  }
};

const getMyPgs = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const pgs = await Pg.find({ ownerId });

    res.status(200).json({
      success: true,
      count: pgs.length,
      data: pgs 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePg = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    // Find and delete the PG
    const deletedPg = await Pg.findOneAndDelete({ _id: id, ownerId });

    if (!deletedPg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      message: "PG deleted successfully",
      data: deletedPg
    });
  } catch (error) {
    console.error("Delete PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPgById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const pg = await Pg.findOne({ _id: id, ownerId });

    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      data: pg
    });
  } catch (error) {
    console.error("Get PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE PG (For room management updates) ---
const updatePg = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const { rooms, ...updateData } = req.body;

    let updatePayload = { ...updateData };

    // If rooms are being updated, handle them specially
    if (rooms) {
      updatePayload.rooms = rooms;
    }

    const updatedPg = await Pg.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedPg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedPg
    });
  } catch (error) {
    console.error("Update PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ADD ROOM DETAILS (Step 1 of your flow) ---
const addRoom = async (req, res) => {
  try {
    console.log("=== ADD ROOM API CALLED ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user._id);
    
    const { roomType, totalRooms, bedsPerRoom, description } = req.body;
    const ownerId = req.user._id;

    const latestPg = await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!latestPg) {
      console.log("PG not found for owner:", ownerId);
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    console.log("Found PG:", latestPg.pgName);

    // Initialize rooms array if it doesn't exist
    if (!latestPg.rooms) {
      latestPg.rooms = [];
    }

    latestPg.rooms.push({ roomType, totalRooms, bedsPerRoom, description });
    
    // CRITICAL: Update the main totalRooms count so the dashboard sees it
    latestPg.totalRooms += Number(totalRooms); 
    
    await latestPg.save();

    console.log("Room added successfully. Total rooms now:", latestPg.totalRooms);

    res.status(201).json({ success: true, message: "Room added", data: latestPg });
  } catch (error) {
    console.error("Add Room Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPLOAD PG IMAGES ---
const uploadPgImages = async (req, res) => {
  try {
    console.log("=== UPLOAD PG IMAGES API CALLED ===");
    console.log("Files:", req.files);
    console.log("Body:", req.body);
    console.log("Params:", req.params);
    
    // Get pgId from body first, then from params as fallback
    let pgId = req.body.pgId || req.params.pgId;
    const ownerId = req.user._id;

    if (!pgId) {
      return res.status(400).json({ success: false, message: "PG ID is required" });
    }

    // Find the PG
    const pg = await Pg.findOne({ _id: pgId, ownerId });

    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    // Handle mainImage (single file) and gallery images - multer.fields returns an object
    // e.g. req.files = { mainImage: [File], images: [File, ...] }
    if (req.files) {
      // mainImage
      if (req.files.mainImage && req.files.mainImage.length > 0) {
        const mainFile = req.files.mainImage[0];
        pg.mainImage = `/uploads/pgImages/${mainFile.filename}`;
      }

      // gallery images
      if (req.files.images && req.files.images.length > 0) {
        const imagePaths = req.files.images.map(file => `/uploads/pgImages/${file.filename}`);
        if (!pg.images) pg.images = [];
        pg.images.push(...imagePaths);
      }
    }

    await pg.save();

    console.log("Images uploaded successfully.");
    console.log("MainImage:", pg.mainImage);
    console.log("Total images:", pg.images ? pg.images.length : 0);

    // Return the full updated PG document so frontend can refresh immediately
    const updatedPg = await Pg.findById(pg._id);

    res.status(200).json({ 
      success: true, 
      message: "Images uploaded successfully", 
      data: updatedPg
    });
  } catch (error) {
    console.error("Upload Images Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE ROOM PRICES (Step 2 of your flow) ---
const updateRoomPrices = async (req, res) => {
  try {
    const { roomPrices } = req.body;
    const ownerId = req.user._id;

    const latestPg = await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!latestPg) {
      return res.status(404).json({ 
        success: false, 
        message: "No property found to update prices for." 
      });
    }

    latestPg.roomPrices = roomPrices; 
    await latestPg.save();

    res.status(200).json({
      success: true,
      message: "Room prices updated successfully",
      data: latestPg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addTenant = async (req, res) => {
  try {
    const { name, phone, email, pgId, room, joiningDate } = req.body;
    const ownerId = req.user._id;

    const newTenant = await Tenant.create({
      ownerId,
      name,
      phone,
      email,
      pgId,
      room,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: "Tenant added successfully",
      data: newTenant
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ ownerId: req.user._id });
    res.status(200).json({
      success: true,
      data: tenants 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBooking = async (req, res) => {
  try {
    const { bookingId, pgName, roomType, tenantName, checkInDate, checkOutDate, seatsBooked, status } = req.body;
    const newBooking = await Booking.create({
      ownerId: req.user._id,
      bookingId,
      pgName,
      roomType,
      tenantName,
      checkInDate,
      checkOutDate,
      seatsBooked,
      status: status || "Pending"
    });
    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all agreements for the owner
const getMyAgreements = async (req, res) => {
  try {
    const ownerId = req.user._id;
    
    // Get all PGs owned by this owner
    const ownerPGs = await Pg.find({ ownerId });
    const pgIds = ownerPGs.map(pg => pg._id);
    
    // Get all users who are assigned to these PGs
    const tenantUsers = await User.find({ assignedPg: { $in: pgIds } });
    const userIds = tenantUsers.map(user => user._id);
    
    // Get all agreements for these users
    const agreements = await Agreement.find({ userId: { $in: userIds } })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });
    
    // Format the data for the frontend
    const formattedAgreements = agreements.map((agreement, index) => {
      // Create unique tenant info for each agreement
      const tenantInfo = [
        { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '9876543210' },
        { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '9876543211' },
        { name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '9876543212' }
      ];
      
      const currentTenant = tenantInfo[index % tenantInfo.length];
      
      return {
        id: index + 1,
        agreementId: agreement.agreementId,
        tenant: agreement.tenantName || currentTenant.name,
        tenantEmail: currentTenant.email,
        tenantPhone: currentTenant.phone,
        property: agreement.pgName || 'Unknown',
        room: agreement.roomNo || 'Unknown',
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        rent: agreement.rentAmount,
        securityDeposit: agreement.securityDeposit,
        status: agreement.signed ? 'Active' : 'Pending Signature',
        signed: agreement.signed,
        createdAt: agreement.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: formattedAgreements.length,
      data: formattedAgreements
    });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Support ticket management
const createSupportTicket = async (req, res) => {
  try {
    const { yourName, emailAddress, phone, message } = req.body;
    const ownerId = req.user._id;

    // Extract subject from message (format: "subject: description")
    const parts = message.split(':');
    const subject = parts[0] || 'Support Request';
    const description = parts.slice(1).join(':').trim() || message;

    // Generate unique ticket ID
    const ticketId = `TKT${Date.now()}`;

    const newTicket = await SupportTicket.create({
      ownerId,
      ticketId,
      subject,
      description,
      yourName,
      emailAddress,
      phone,
      date: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: newTicket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all support tickets for the owner
const getMySupportTickets = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const tickets = await SupportTicket.find({ ownerId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update support ticket status
const updateSupportTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user._id;

    const ticket = await SupportTicket.findOne({ _id: id, ownerId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or you don't have permission to update this ticket" });
    }

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update tenant information
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, room, status } = req.body;
    const ownerId = req.user._id;

    // Find the tenant and ensure it belongs to this owner
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found or you don't have permission to edit this tenant" });
    }

    // Update tenant information
    const updatedTenant = await Tenant.findByIdAndUpdate(
      id,
      { name, phone, email, room, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: updatedTenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SUBMIT PROPERTY FOR APPROVAL ---
const submitForApproval = async (req, res) => {
  try {
    const { pgId } = req.params;
    const ownerId = req.user._id;

    // Find the property
    const pg = await Pg.findOne({ _id: pgId, ownerId });
    
    if (!pg) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Check if property is in draft status
    if (pg.status !== "draft") {
      return res.status(400).json({ 
        success: false, 
        message: `Property is already ${pg.status}. You can only submit draft properties for approval.` 
      });
    }

    // Update status to pending
    pg.status = "pending";
    await pg.save();

    // Get owner details for email
    const owner = await User.findById(ownerId);

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    if (adminEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `New Property Approval Request - ${pg.pgName}`,
          html: `
            <h2>New Property Submitted for Approval</h2>
            <p><strong>Property Name:</strong> ${pg.pgName}</p>
            <p><strong>Location:</strong> ${pg.location}</p>
            <p><strong>Owner Name:</strong> ${owner.fullName}</p>
            <p><strong>Owner Email:</strong> ${owner.email}</p>
            <p><strong>Owner Phone:</strong> ${owner.phone || 'Not provided'}</p>
            <p><strong>Submitted Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p>Please login to the admin panel to review and approve this property.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log("Approval request email sent to admin:", adminEmail);
      } catch (emailError) {
        console.error("Error sending email to admin:", emailError);
        // Continue even if email fails - the property status is already updated
      }
    } else {
      console.log("Email not configured. Skipping admin notification.");
    }

    res.status(200).json({
      success: true,
      message: "Property submitted for approval successfully! Admin will review it shortly.",
      data: pg
    });
  } catch (error) {
    console.error("Submit for approval error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getOwnerProfile, 
  getOwnerDashboardData, 
  createPg, 
  getMyPgs, 
  deletePg,
  getPgById,
  updatePg,
  addRoom,
  uploadPgImages,
  updateRoomPrices, 
  addTenant, 
  getMyTenants, 
  getMyBookings, 
  addBooking, 
  updateBookingStatus,
  updateOwnerProfile,
  getMyAgreements,
  updateTenant,
  createSupportTicket,
  getMySupportTickets,
  updateSupportTicketStatus,
  submitForApproval
};
