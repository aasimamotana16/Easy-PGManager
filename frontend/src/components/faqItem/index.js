import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import CButton from "../../components/cButton"; // adjust path if needed

export default function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div>
      <CButton
        size="md"
        variant="text"         // text variant to keep it minimal
        fullWidth
        onClick={onToggle}
        className="w-full text-left flex justify-between items-center py-4 px-3 focus:outline-none"
      >
        <span className="font-semibold text-primary">{question}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-primary" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-primary" />
        )}
      </CButton>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
        } px-3 pb-4 text-text-secondary`}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
}
