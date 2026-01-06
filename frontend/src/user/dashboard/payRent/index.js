import React, { useState } from "react";
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import CButton from "../../../components/cButton";

const PayRent = ({ amount, month, dueDate, onPay, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    {
      id: "card",
      title: "Visa • HDFC Bank",
      subtitle: "Card ending •••• 4589",
      icon: CreditCardIcon,
    },
    {
      id: "upi",
      title: "UPI / Wallet",
      subtitle: "Google Pay, PhonePe, Paytm",
      icon: DevicePhoneMobileIcon,
    },
    {
      id: "netbanking",
      title: "Net Banking",
      subtitle: "All major banks supported",
      icon: BuildingLibraryIcon,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-1">Pay Rent</h2>
        <p className="text-sm text-gray-500 mb-4">
          Complete your rent payment securely
        </p>

        {/* Rent Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Month:</span> {month}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Amount:</span> {amount}
          </p>
          <p className="text-xs text-gray-400">
            Due by {dueDate}
          </p>
        </div>

        {/* Payment Methods */}
        <h3 className="text-sm font-semibold mb-3">
          Choose payment method
        </h3>

        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {method.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {method.subtitle}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircleIcon className="w-5 h-5 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <CButton
          disabled={!selectedMethod}
          onClick={() => onPay(selectedMethod)}
          className={`w-full py-3 rounded-xl text-white font-medium transition ${
            selectedMethod
              ? "bg-primary hover:opacity-90"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Confirm & Pay {amount}
        </CButton>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500 mt-3 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PayRent;
