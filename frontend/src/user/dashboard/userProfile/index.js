import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  FaUserEdit, FaCamera, FaTrash, FaCheckCircle, 
  FaUserShield, FaUserAlt, FaBriefcase, FaWallet, FaCreditCard 
} from "react-icons/fa";

// Components & API (Assuming these paths are correct as per your snippet)
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import {
  getUserProfile,
  getPersonalProfile,
  getAcademicProfile,
  getEmergencyProfile,
  getPaymentProfile,
  updateProfilePicture,
  removeProfilePicture,
  updateUserProfile,
  deleteMyAccount,
} from "../../../api/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  const sanitizePhone10 = (value) => (value || "").toString().replace(/\D/g, "").slice(0, 10);
  const isValidPhone10 = (value) => /^\d{10}$/.test((value || "").toString());

  // --- Animation Variants ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const modalOverlay = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalContent = {
    hidden: { scale: 0.9, opacity: 0, y: 50 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", duration: 0.5 } },
    exit: { scale: 0.9, opacity: 0, y: 50 }
  };

  // --- Logic ---
  const fetchProfile = async () => {
    try {
      const [userRes, personalRes, academicRes, emergencyRes, paymentRes] = await Promise.all([
        getUserProfile(),
        getPersonalProfile().catch(() => null),
        getAcademicProfile().catch(() => null),
        getEmergencyProfile().catch(() => null),
        getPaymentProfile().catch(() => null),
      ]);
      const base = userRes?.data?.data || {};
      const personal = personalRes?.data?.data || {};
      const academic = academicRes?.data?.data || {};
      const emergency = emergencyRes?.data?.data || {};
      const payment = paymentRes?.data?.data || {};

      setUser({
        ...base,
        fullName: personal.fullName ?? base.fullName,
        phone: personal.phone ?? base.phone,
        age: personal.age,
        bloodGroup: personal.bloodGroup,
        city: personal.city ?? base.city,
        state: personal.state ?? base.state,
        email: base.email,
        occupationType: academic.status?.toLowerCase() || "professional",
        education: academic.qualification,
        collegeName: academic.company,
        collegeYear: academic.collegeYear ?? "",
        collegeAddress: academic.workAddress,
        companyName: academic.company,
        companyAddress: academic.workAddress,
        emergencyContact: {
          contactName: emergency.guardianName || base.emergencyContact?.contactName,
          relationship: emergency.relationship || base.emergencyContact?.relationship,
          phoneNumber: emergency.guardianPhone || base.emergencyContact?.phoneNumber,
        },
        bankDetails: {
          holderName: payment.holder,
          bankName: payment.bank,
          ifsc: payment.ifsc,
          accountNumber: payment.account,
        },
        profileCompletion: base.profileCompletion
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    try {
      setLoading(true);
      const res = await updateProfilePicture(formDataObj);
      if (res.data.success) {
        await fetchProfile();
        Swal.fire({ title: "Uploaded!", text: "Profile picture updated.", icon: "success", confirmButtonColor: "#D97706" });
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Upload failed", icon: "error", confirmButtonColor: "#D97706" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    const result = await Swal.fire({
      title: "Remove photo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#1F1F1F",
    });
    if (result.isConfirmed) {
      try {
        await removeProfilePicture();
        await fetchProfile();
        Swal.fire({ title: "Removed!", icon: "success", confirmButtonColor: "#D97706" });
      } catch (err) {
        Swal.fire({ title: "Error", icon: "error" });
      }
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete account?",
      text: "This will permanently delete your account. This is only allowed if you have no booking history.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#1F1F1F",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await deleteMyAccount();

      try {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("role");
        localStorage.removeItem("isLoggedIn");
      } catch (_) {
        // ignore storage issues
      }

      await Swal.fire({
        title: "Account Deleted",
        text: "Your account has been deleted successfully.",
        icon: "success",
        confirmButtonColor: "#D97706",
      });

      navigate("/");
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 409) {
        Swal.fire({
          title: "Cannot Delete Account",
          text: message || "You have booking history, so account deletion is not allowed.",
          icon: "info",
          confirmButtonColor: "#D97706",
        });
        return;
      }

      Swal.fire({
        title: "Delete Failed",
        text: message || "Could not delete your account right now.",
        icon: "error",
        confirmButtonColor: "#D97706",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setFormData({
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      age: user?.age ?? "",
      bloodGroup: user?.bloodGroup ?? "",
      city: user?.city ?? "",
      state: user?.state ?? "",
      occupationType: user?.occupationType ?? "professional",
      education: user?.education ?? "",
      collegeName: user?.collegeName ?? "",
      collegeYear: user?.collegeYear ?? "",
      collegeAddress: user?.collegeAddress ?? "",
      companyName: user?.companyName ?? "",
      companyAddress: user?.companyAddress ?? "",
      guardianName: user?.emergencyContact?.contactName ?? "",
      relationship: user?.emergencyContact?.relationship ?? "",
      guardianPhone: user?.emergencyContact?.phoneNumber ?? "",
      holder: user?.bankDetails?.holderName ?? "",
      bank: user?.bankDetails?.bankName ?? "",
      ifsc: user?.bankDetails?.ifsc ?? "",
      account: user?.bankDetails?.accountNumber ?? "",
    });
    setIsModalOpen(true);
  };

  const handleSaveInfo = async () => {
    const cleanedPhone = sanitizePhone10(formData.phone);
    const cleanedGuardianPhone = sanitizePhone10(formData.guardianPhone);

    if (cleanedPhone && !isValidPhone10(cleanedPhone)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 10 digits (numbers only).",
        confirmButtonColor: "#D97706",
      });
      return;
    }

    if (cleanedGuardianPhone && !isValidPhone10(cleanedGuardianPhone)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Guardian Phone",
        text: "Guardian phone must be exactly 10 digits (numbers only).",
        confirmButtonColor: "#D97706",
      });
      return;
    }

    try {
      setLoading(true);
      const payloads = [
        { section: "personalInfo", data: { fullName: formData.fullName, phone: cleanedPhone, age: formData.age, bloodGroup: formData.bloodGroup, city: formData.city, state: formData.state } },
        { section: "academicInfo", data: { status: formData.occupationType, qualification: formData.education, company: formData.occupationType === "student" ? formData.collegeName : formData.companyName, workAddress: formData.occupationType === "student" ? formData.collegeAddress : formData.companyAddress, collegeYear: formData.occupationType === "student" ? formData.collegeYear : "" } },
        { section: "emergencyContact", data: { guardianName: formData.guardianName, relationship: formData.relationship, guardianPhone: cleanedGuardianPhone } },
        { section: "paymentDetails", data: { holder: formData.holder, bank: formData.bank, ifsc: formData.ifsc, account: formData.account } },
      ];
      await Promise.all(payloads.map((p) => updateUserProfile(p)));
      await fetchProfile();

      // Update localStorage so Navbar picks up the new name immediately
      try {
        const updatedLocal = {
          fullName: formData.fullName || user?.fullName,
          name: formData.fullName || user?.fullName,
          email: user?.email,
          phone: cleanedPhone || user?.phone
        };
        localStorage.setItem('user', JSON.stringify(updatedLocal));
        localStorage.setItem('userName', updatedLocal.fullName || updatedLocal.name || 'User');
        // Trigger storage listeners in the same tab (Navbar listens for 'storage')
        try { window.dispatchEvent(new Event('storage')); } catch (e) { /* ignore */ }
      } catch (e) {
        console.error('Failed updating localStorage after profile save', e);
      }

      setIsModalOpen(false);
      Swal.fire({ title: "Profile Updated", icon: "success", confirmButtonColor: "#D97706" });
    } catch (err) {
      Swal.fire({ title: "Update Failed", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-[#D97706] font-black uppercase tracking-tighter text-xl"
      >
        Syncing Profile...
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] font-poppins">
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        {/* --- LEFT SIDEBAR --- */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-80 bg-white border-b lg:border-r-2  border-primary  p-6 lg:p-8 lg:h-screen lg:sticky lg:top-0"
        >
          <div className="flex flex-row lg:flex-col items-center gap-6 lg:gap-0">
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-28 h-28 lg:w-40 lg:h-40 rounded-md overflow-hidden border-4 border-[#D97706] shadow-xl"
              >
                {user?.profilePicture ? (
                  <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#D97706] flex items-center justify-center text-3xl lg:text-5xl font-black text-white">
                    {user?.fullName?.charAt(0)}
                  </div>
                )}
              </motion.div>
              <button onClick={handleUploadClick} className="absolute bottom-0 right-0 bg-[#1C1C1C] text-white p-2 lg:p-3 rounded-md hover:bg-[#D97706] transition-colors shadow-lg">
                <FaCamera size={12} />
              </button>
            </div>
            
            <div className="flex-1 lg:mt-6 text-left lg:text-center">
              <h2 className="text-xl lg:text-2xl font-bold  text-[#1C1C1C]">{user?.fullName || "User"}</h2>
              <p className="text-sm font-medium text-[#4B4B4B] mt-1">{user?.email}</p>
              <button onClick={handleRemove} className="mt-2 text-red-500 text-xs font-bold uppercase hover:underline lg:hidden">Remove Photo</button>
            </div>
          </div>

          <div className="hidden lg:block mt-8">
            <CButton onClick={handleRemove} className="w-full bg-white !text-[#4B4B4B] border border-[#E5E0D9] hover:bg-red-50 hover:!text-red-500 hover:border-red-200 transition-all text-[10px] ">
                <FaTrash className="inline mr-2" /> Remove Photo
            </CButton>
            
            <div className="mt-10 bg-[#1F1F1F] rounded-md p-6 text-white shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Profile Strength</span>
                <span className="text-[#D97706] font-bold">{user?.profileCompletion || 0}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${user?.profileCompletion || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-[#D97706] h-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <CButton
                onClick={handleDeleteAccount}
                className="w-full bg-white !text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all text-[10px]"
              >
                <FaTrash className="inline mr-2" /> Delete Account
              </CButton>
            </div>
          </div>
        </motion.div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 p-4 lg:p-10 max-w-6xl w-full mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-4xl font-black text-[#1C1C1C] tracking-tight">Profile Settings</h1>
              <p className="text-[10px] lg:text-xs font-bold text-[#4B4B4B] uppercase tracking-[0.2em] mt-1">Verified Identity Management</p>
            </div>
            <div className="flex items-center gap-2 bg-[#FEF3C7] px-4 py-2 rounded-md border border-[#D97706]/30">
              <FaCheckCircle className="text-[#D97706]" />
              <span className="text-[10px] font-bold uppercase text-[#B45309]">Verified User</span>
            </div>
          </motion.div>

          {/* TAB NAVIGATION */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto">
              {[
                {id: 'personal', label: 'Personal', icon: <FaUserAlt />},
                {id: 'professional', label: 'Academic', icon: <FaBriefcase />},
                {id: 'emergency', label: 'Emergency', icon: <FaUserShield />},
                {id: 'payment', label: 'Payments', icon: <FaWallet />}
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-md text-sm  uppercase transition-all whitespace-nowrap border ${
                    activeTab === tab.id 
                    ? "bg-[#D97706] text-white border-[#D97706] shadow-lg translate-y-[-2px]" 
                    : "bg-white text-[#4B4B4B] border-[#E5E0D9] hover:bg-primarySoft hover:border-[#D97706] hover:text-[#D97706]"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <CButton onClick={openEditModal} className="w-full lg:w-auto !rounded-md text-[11px] uppercase px-8 py-3.5 flex items-center justify-center gap-2 shadow-xl hover:bg-[#B45309]">
              <FaUserEdit size={16} /> Edit Profile
            </CButton>
          </div>

          {/* MAIN CARD WITH STAGGERED ANIMATION */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-md border border-[#E5E0D9] shadow-sm p-6 lg:p-12 relative overflow-hidden"
            >
              <h3 className="text-xl lg:text-2xl font-bold text-[#1C1C1C] mb-10 border-b border-gray-50 pb-6 capitalize flex items-center gap-4">
                <motion.span initial={{ height: 0 }} animate={{ height: 30 }} className="w-1.5 bg-[#D97706] rounded-full" />
                {activeTab} Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                {activeTab === 'personal' && (
                  <>
                    <motion.div variants={fadeInUp}><Info label="Full Name" value={user?.fullName} /></motion.div>
                    <motion.div variants={fadeInUp}><Info label="Phone Number" value={user?.phone} /></motion.div>
                    <motion.div variants={fadeInUp}><Info label="Age" value={user?.age} /></motion.div>
                    <motion.div variants={fadeInUp}><Info label="Blood Group" value={user?.bloodGroup} /></motion.div>
                    <motion.div variants={fadeInUp}><Info label="City" value={user?.city} /></motion.div>
                    <motion.div variants={fadeInUp}><Info label="State" value={user?.state} /></motion.div>
                    <motion.div variants={fadeInUp} className="md:col-span-2 border-t border-gray-50 pt-8"><Info label="Email Address" value={user?.email} /></motion.div>
                  </>
                )}
                
                {activeTab === 'professional' && (
                  <>
                    <motion.div variants={fadeInUp}><Info label="Current Status" value={user?.occupationType} className="capitalize" /></motion.div>
                    <motion.div variants={fadeInUp}><Info label="Qualification" value={user?.education} /></motion.div>
                    {user?.occupationType === 'student' ? (
                      <>
                        <motion.div variants={fadeInUp}><Info label="College / University" value={user?.collegeName} /></motion.div>
                        <motion.div variants={fadeInUp}><Info label="Academic Year" value={user?.collegeYear} /></motion.div>
                        <motion.div variants={fadeInUp} className="md:col-span-2"><Info label="College Address" value={user?.collegeAddress} /></motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div variants={fadeInUp}><Info label="Company Name" value={user?.companyName} /></motion.div>
                        <motion.div variants={fadeInUp} className="md:col-span-2"><Info label="Office Address" value={user?.companyAddress} /></motion.div>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'emergency' && (
                  <>
                    <motion.div variants={fadeInUp}><Info label="Guardian Name" value={user?.emergencyContact?.contactName} /></motion.div>
                    <motion.div variants={fadeInUp}><Info label="Relationship" value={user?.emergencyContact?.relationship} /></motion.div>
                    <motion.div variants={fadeInUp} className="md:col-span-2"><Info label="Guardian Phone" value={user?.emergencyContact?.phoneNumber} /></motion.div>
                  </>
                )}

                {activeTab === 'payment' && (
                  <motion.div variants={fadeInUp} className="md:col-span-2 bg-[#FEF3C7]/50 rounded-md p-8 border border-[#D97706]/10">
                    <p className="text-[10px] font-bold uppercase text-[#B45309] mb-8 flex items-center gap-2">
                       <FaCreditCard /> Linked Settlement Account
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Info label="Account Holder" value={user?.bankDetails?.holderName} />
                      <Info label="Bank Name" value={user?.bankDetails?.bankName} />
                      <Info label="IFSC Code" value={user?.bankDetails?.ifsc} />
                      <Info label="Account Number" value={user?.bankDetails?.accountNumber ? `●●●● ●●●● ${user.bankDetails.accountNumber.slice(-4)}` : null} />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>r

      <Footer />

      {/* --- ANIMATED MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[3000] flex items-start sm:items-center justify-center p-0 sm:p-6 lg:p-8"
          >
            <motion.div 
              variants={modalContent}
              className="bg-white rounded-none sm:rounded-3xl w-full max-w-none sm:max-w-3xl lg:max-w-4xl h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden min-h-0"
            >
              <div className="sticky sm:static top-0 z-10 p-4 sm:p-8 border-b border-white/20 bg-primary flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-textLight">Update Profile</h3>
                  <p className="text-[10px] font-bold text-primarySoft uppercase tracking-widest mt-1">Global Data Synchronization</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-textLight/70 hover:text-textLight transition-colors text-2xl">×</button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 md:p-12 space-y-10 sm:space-y-12 custom-scrollbar">
                {/* Section 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SectionTitle icon={<FaUserAlt />} title="1. Personal Info" />
                  <CInput label="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                  <CInput
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: sanitizePhone10(e.target.value) })}
                    inputMode="numeric"
                  />
                  <CInput label="Age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                  <CInput label="Blood Group" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} />
                  <CInput label="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                  <CInput label="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                </div>

                {/* Section 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SectionTitle icon={<FaBriefcase />} title="2. Academic / Work" />
                  <div className="md:col-span-2 flex gap-4">
                    {['student', 'professional'].map(type => (
                      <button 
                        key={type} 
                        onClick={() => setFormData({...formData, occupationType: type})} 
                        className={`flex-1 py-4 rounded-md font-bold uppercase text-[10px] border transition-all ${
                          formData.occupationType === type 
                          ? "border-[#D97706] bg-[#FEF3C7] text-[#B45309]" 
                          : "border-[#E5E0D9] text-[#4B4B4B]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <CInput label="Qualification" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} />
                  {formData.occupationType === 'student' ? (
                    <>
                      <CInput label="College Name" value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} />
                      <CInput label="Year" value={formData.collegeYear} onChange={(e) => setFormData({ ...formData, collegeYear: e.target.value })} />
                      <CInput label="College Address" className="md:col-span-2" value={formData.collegeAddress} onChange={(e) => setFormData({ ...formData, collegeAddress: e.target.value })} />
                    </>
                  ) : (
                    <>
                      <CInput label="Company Name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                      <CInput label="Work Address" className="md:col-span-2" value={formData.companyAddress} onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })} />
                    </>
                  )}
                </div>

                {/* Section 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SectionTitle icon={<FaUserShield />} title="3. Emergency Contact" />
                  <CInput label="Guardian Name" value={formData.guardianName} onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })} />
                  <CInput label="Relationship" value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} />
                  <CInput
                    label="Guardian Phone"
                    className="md:col-span-2"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: sanitizePhone10(e.target.value) })}
                    inputMode="numeric"
                  />
                </div>

                {/* Section 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SectionTitle icon={<FaWallet />} title="4. Payment Details" />
                  <CInput label="Account Holder" value={formData.holder} onChange={(e) => setFormData({ ...formData, holder: e.target.value })} />
                  <CInput label="Bank Name" value={formData.bank} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} />
                  <CInput label="IFSC Code" value={formData.ifsc} onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })} />
                  <CInput label="Account Number" value={formData.account} onChange={(e) => setFormData({ ...formData, account: e.target.value })} />
                </div>
              </div>

              <div className="p-4 sm:p-8 bg-gray-50 border-t flex flex-col sm:flex-row gap-3 sm:gap-4">
                <CButton onClick={handleSaveInfo} className="w-full sm:flex-[2] py-4 shadow-lg">Save All Changes</CButton>
                <CButton variant= "outlined" onClick={() => setIsModalOpen(false)} className="w-full sm:flex-1 bg-white !text-[#4B4B4B] border border-primary hover:bg-primarySoft">Cancel</CButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-Components for Cleanliness ---
const Info = ({ label, value, className = "" }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B] opacity-70">{label}</p>
    <p className="text-base font-bold text-[#1C1C1C] break-words">
      {value || <span className="text-gray-300 font-normal italic">Not Provided</span>}
    </p>
  </div>
);

const SectionTitle = ({ icon, title }) => (
  <div className="md:col-span-2 text-xs font-black text-[#1C1C1C] uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-3">
    <span className="text-[#D97706]">{icon}</span> {title}
  </div>
);

export default Profile;