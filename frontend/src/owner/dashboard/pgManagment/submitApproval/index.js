import React from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";

const SubmitApproval = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    console.log("PROPERTY SUBMITTED FOR ADMIN APPROVAL");

    // frontend simulation
    alert("Property submitted for admin approval");

    navigate("/owner/dashboard/pgManagment");
  };

  return (
    <div className="max-w-4xl mx-auto my-10 px-3">
      <h2 className="text-3xl font-bold text-center text-amber-600 mb-8">
        Submit Property for Approval
      </h2>

      <CFormCard className="border border-gray-400">
        <div className="space-y-4 text-gray-700">
          <p>
            ✅ You have successfully completed all required property details.
          </p>

          <p>
            🔍 Your property will be reviewed by the admin team before going live.
          </p>

          <p>
            ⏳ Approval usually takes <strong>24–48 hours</strong>.
          </p>

          <p className="text-red-600 font-medium">
            ⚠ Once submitted, you cannot edit property details until review is complete.
          </p>
        </div>

        <div className="text-center mt-8">
          <CButton onClick={handleSubmit}>
            Submit for Approval
          </CButton>
        </div>
      </CFormCard>
    </div>
  );
};

export default SubmitApproval;
