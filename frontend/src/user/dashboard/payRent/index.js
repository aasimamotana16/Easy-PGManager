import React, { useState } from "react";
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";

const PayRent = ({ amount, month, dueDate, onPay, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "card",
      title: "Debit / Credit Card",
      subtitle: "Visa, Mastercard, RuPay",
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

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        await onPay(selectedMethod);
        setIsProcessing(false);
        Swal.fire({
          title: "Payment Successful!",
          text: `Rent for ${month} has been received.`,
          icon: "success",
          confirmButtonColor: "#f97316",
          background: "#ffffff",
        });
        onClose();
      } catch (error) {
        setIsProcessing(false);
        Swal.fire({
          title: "Payment Failed",
          text: "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonColor: "#000000",
        });
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      {/* Reduced max-width from md-2xl to md-lg for a slimmer look */}
      <div className="bg-white w-full max-w-md md:max-w-lg rounded-md shadow-2xl relative overflow-hidden">
        
        <div className="h-1.5 bg-orange-500 w-full" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors"
        >
          <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Reduced padding from p-10 to p-6/p-8 */}
        <div className="p-5 md:p-8">
          {/* Header - Scaled down font sizes */}
          <div className="mb-5">
            <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
              Secure Checkout
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
              ID: #EZY-{Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>

          {/* Rent Summary Card - More compact padding */}
          <div className="bg-black text-white rounded-md p-4 md:p-5 mb-5 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-[9px] md:text-[10px] text-orange-500 font-bold uppercase tracking-widest">Amount to Pay</p>
              <p className="text-2xl md:text-3xl font-black">₹{amount}</p>
              <p className="text-[11px] md:text-xs text-gray-400">Rent for {month}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[9px] md:text-[10px] text-gray-400 uppercase">Due Date</p>
              <p className="text-xs md:text-sm font-bold">{dueDate}</p>
            </div>
          </div>

          <h3 className="text-[10px] md:text-xs font-bold text-gray-700 uppercase mb-3 tracking-wider">
            Select Payment Method
          </h3>

          {/* Payment Methods - Reduced gap and padding */}
          <div className="space-y-2 mb-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center justify-between p-3 md:p-4 rounded-md border transition-all ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/50"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isSelected ? "text-orange-500" : "text-gray-400"}`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="text-left">
                      <p className={`text-xs md:text-sm font-bold ${isSelected ? "text-black" : "text-gray-700"}`}>
                        {method.title}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-gray-400">
                        {method.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                    {isSelected && <CheckCircleIcon className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Actions - Compacted buttons */}
          <div className="space-y-3">
            <CButton
              disabled={!selectedMethod || isProcessing}
              onClick={handlePayment}
              className={`w-full py-3 md:py-4 rounded-md text-white font-bold text-sm md:text-base shadow-lg transition-all flex justify-center items-center gap-2 ${
                selectedMethod && !isProcessing
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5" />
                  PAY ₹{amount}
                </>
              )}
            </CButton>

            <button
              onClick={onClose}
              className="w-full text-[10px] md:text-xs text-gray-400 font-bold hover:text-black transition-colors uppercase tracking-widest"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-2.5 flex justify-center items-center gap-2 border-t border-gray-100">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[8px] md:text-[9px] text-gray-400 font-semibold uppercase tracking-tight">
                Secure 256-bit SSL Encrypted Payment
            </span>
        </div>
      </div>
    </div>
  );
};

export default PayRent;