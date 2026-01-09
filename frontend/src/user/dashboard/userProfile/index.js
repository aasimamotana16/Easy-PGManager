import React from "react";
import CButton from "../../../components/cButton";

const Profile = () => {
  return (
    <div className="space-y-8">
      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-8">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* PROFILE CARD */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-20 h-20 rounded-full bg-primarySoft flex items-center justify-center text-2xl font-semibold text-primary">
                A
              </div>

              <div>
                <h2 className="text-xl font-semibold text-primary">
                  Asima Motana
                </h2>
                <p className="text-sm text-gray-500">Student / Tenant</p>
                <p className="text-sm text-gray-400">asima@gmail.com</p>
                <p className="text-sm text-gray-400">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <CButton className="bg-primary  px-4 py-2 text-sm">
                Upload Picture
              </CButton>
              <CButton className="border px-4 py-2  text-sm">
                Remove Picture
              </CButton>
            </div>
          </div>

          {/* PROFILE COMPLETION */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold mb-4">
              Profile Completion
            </h3>

            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-[8px] border-gray-200" />
              <div className="absolute inset-0 rounded-full border-[8px] border-primary border-t-transparent rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">
                  80%
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Complete your profile to unlock all features
            </p>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              Personal Information
            </h3>
            <CButton className="bg-primary  px-4 py-2  text-sm">
              Edit Info
            </CButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Info label="Full Name" value="Asima Motana" />
            <Info label="Email" value="asima@gmail.com" />
            <Info label="Phone" value="+91 98765 43210" />
            <Info label="City" value="Ahmedabad" />
            <Info label="State" value="Gujarat" />
            <Info label="Role" value="Tenant" />
          </div>
        </div>

        {/* EMERGENCY CONTACT (NEW - REQUIRED) */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              Emergency Contact
            </h3>
            <CButton className="bg-primary  px-4 py-2  text-sm">
              Edit Info
            </CButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Info label="Contact Name" value="Mother" />
            <Info label="Relationship" value="Mother" />
            <Info label="Phone Number" value="+91 9XXXXXXXXX" />
          </div>
        </div>

      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default Profile;
