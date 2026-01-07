import React from "react";
import CButton from "../../../components/cButton";

const CancelConfirmModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          Are you sure?
        </h3>

        <ul className="text-sm text-text-secondary mb-6 space-y-2">
          <li>• Advance payment will be kept</li>
          <li>• Profile archived for 10 days</li>
          <li>• Read-only access</li>
          <li>• Auto delete after 10 days</li>
        </ul>

        <div className="flex gap-4">
          <CButton variant="outline" onClick={onClose}>
            No, Go Back
          </CButton>

          <CButton
            className="bg-red-500 hover:bg-red-600"
            onClick={onConfirm}
          >
            Yes, Cancel
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmModal;
