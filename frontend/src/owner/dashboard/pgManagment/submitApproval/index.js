import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { submitForApproval } from "../../../../api/api";
import Swal from "sweetalert2";

const SubmitApproval = () => {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Get the property ID from localStorage
    const propertyId = localStorage.getItem("currentPropertyId");
    
    if (!propertyId) {
      Swal.fire({
        title: "Error!",
        text: "No property found. Please add a property first.",
        icon: "error",
        confirmButtonColor: "#D97706"
      });
      return;
    }

    Swal.fire({
      title: "Submit for Approval?",
      text: "Once submitted, you won't be able to edit the details until the admin review is complete.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Submit it!",
      cancelButtonText: "Review Again"
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Show loading state while processing
        Swal.fire({
          title: "Submitting...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          // Call the actual API
          const response = await submitForApproval(propertyId);
          
          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: "Submitted Successfully!",
              text: response.data.message || "Your property is now under review. This usually takes 24–48 hours.",
              confirmButtonColor: "#d97706",
            }).then(() => {
              // Clear the property ID from localStorage
              localStorage.removeItem("currentPropertyId");
              localStorage.removeItem("currentPropertyName");
              navigate("/owner/dashboard/pgManagment");
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Submission Failed",
              text: response.data.message || "Something went wrong. Please try again.",
              confirmButtonColor: "#d97706",
            });
          }
        } catch (error) {
          console.error("Error submitting for approval:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.response?.data?.message || "Failed to submit property for approval. Please try again.",
            confirmButtonColor: "#d97706",
          });
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto my-10 px-3">
      <h2 className="text-h2-sm lg:text-h2 font-bold text-center text-amber-600 mb-8">
        Submit Property for Approval
      </h2>

      <CFormCard className="border border-gray-400 p-8">
        <div className="space-y-6 text-lg text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-xl">✅</span>
            <p>You have successfully completed all required property details.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl">🔍</span>
            <p>Your property will be reviewed by our admin team before going live on the platform.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-orange-500 text-xl">⏳</span>
            <p>Approval usually takes <strong>24–48 hours</strong>. You will be notified via email.</p>
          </div>

          <div className="flex items-start gap-3 bg-red-50 p-4 rounded-md border border-red-100">
            <span className="text-red-600 text-xl">⚠</span>
            <p className="text-red-600 font-medium">
              Important: Once submitted, you cannot edit property details until the review is complete.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <CButton size="lg" onClick={handleSubmit}>
            Submit for Approval
          </CButton>
        </div>
      </CFormCard>
    </div>
  );
};

export default SubmitApproval;
