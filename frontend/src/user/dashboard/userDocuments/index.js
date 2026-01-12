import React, { useState, useRef } from "react";
import CButton from "../../../components/cButton";

const Documents = () => {
  // Mock data
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "ID Document",
      status: "Pending", // initially Pending
      date: null,
      file: null,
      required: true,
      guidance: "Upload ID proof, College ID, or any supporting document",
    },
    {
      id: 2,
      name: "Aadhar Card",
      status: "Pending", // initially Pending
      date: null,
      file: null,
      required: true,
    },
    {
      id: 3,
      name: "Rental Agreement Copy",
      status: "Uploaded", // Already uploaded
      date: "01 Jan 2026",
      file: null,
    },
  ]);

  const fileInputRef = useRef(null);
  const [currentDocId, setCurrentDocId] = useState(null);

  // Handle upload click
  const handleUploadClick = (docId) => {
    setCurrentDocId(docId);
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === currentDocId
          ? {
              ...doc,
              file,
              date: new Date().toLocaleDateString("en-GB"),
              status: " Verification Pending", // uploaded → pending verification
            }
          : doc
      )
    );
  };

  // Handle view
  const handleView = (doc) => {
    if (!doc.file) {
      alert("No file available to view.");
      return;
    }
    const fileURL = URL.createObjectURL(doc.file);
    window.open(fileURL, "_blank");
  };

  // Handle download
  const handleDownload = (doc) => {
    if (!doc.file) {
      alert("No file available to download.");
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(doc.file);
    link.download = doc.file.name;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Hidden file input */}
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Gradient wrapper */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div>
              {/* Document Name */}
              <h3 className="text-lg font-semibold text-primary flex items-center gap-1">
                {doc.name} {doc.required && <span className="text-red-500">*</span>}
              </h3>

              {/* Guidance */}
              {doc.guidance && (
                <p className="text-xs text-gray-500 mt-1">{doc.guidance}</p>
              )}

              {/* Upload date */}
              {doc.date && (
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded: {doc.date}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  doc.status === "Uploaded"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {doc.status}
              </span>

              {/* Upload/View button */}
              <CButton
                className="border px-4 py-2 text-sm"
                onClick={() =>
                  doc.status === "Uploaded"
                    ? handleView(doc)
                    : handleUploadClick(doc.id)
                }
              >
                {doc.status === "Uploaded" ? "View" : "Upload"}
              </CButton>

              {/* Download button */}
              {doc.status === "Uploaded" && (
                <CButton
                  className="border px-4 py-2 text-sm"
                  onClick={() => handleDownload(doc)}
                >
                  Download
                </CButton>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
