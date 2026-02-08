import React from "react";
import CButton from "../../../components/cButton";

const CancelConfirmModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Are you sure?
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          This action is permanent and cannot be reversed.
        </p>

        <ul className="text-sm text-gray-600 mb-8 space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Advance payments are <strong>non-refundable</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Your booking data will be <strong>permanently deleted</strong>.</span>
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <CButton 
            variant="outline" 
            onClick={onClose}
            className="flex-1 "
          >
            No, Go Back
          </CButton>

          <CButton
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
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