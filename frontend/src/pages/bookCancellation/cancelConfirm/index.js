import React from "react";
import CButton from "../../../components/cButton";

const CancelConfirmModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
      {/* Background set to your theme's default white [cite: 2026-02-09] */}
      <div className="bg-background rounded-md p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
        
        {/* Responsive Heading [cite: 2026-02-06] */}
        <h3 className="text-h3-sm lg:text-h3 font-bold text-textPrimary mb-2">
          Are you sure?
        </h3>
        
        {/* Body text using secondary token [cite: 2026-02-09] */}
        <p className="text-textSecondary text-body-sm mb-6">
          This action is permanent and cannot be reversed.
        </p>

        <ul className="text-body-sm text-textSecondary mb-8 space-y-3">
          
          <li className="flex items-start gap-2">
            <span className="text-primaryDark font-bold">•</span>
            <span>Your booking data will be <strong className="text-textPrimary">permanently deleted</strong>. [cite: 2026-02-09]</span>
          </li>
        </ul>

        {/* Responsive button stack [cite: 2026-02-06] */}
        <div className="flex flex-col sm:flex-row gap-3">
          <CButton 
            variant="outline" 
            onClick={onClose}
            className="flex-1 border-border text-textSecondary hover:bg-primarySoft transition-all"
          >
            No, Go Back
          </CButton>

          <CButton
            /* Updated to use primaryDark brand color for destructive actions [cite: 2026-02-09] */
            className="flex-1 bg-primaryDark hover:opacity-90 text-textLight font-bold transition-all"
            onClick={onConfirm}
          >
            Yes, Delete Now
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmModal;