import React, { useState, useRef } from "react";
import CButton from "../../../components/cButton";

const Documents = () => {
  // Mock data (replace with API later)
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "College ID",
      status: "Uploaded",
      date: "01 Jan 2026",
      file: null,
      required: false,
    },
    {
      id: 2,
      name: "Aadhar Card",
      status: "Pending",
      date: null,
      file: null,
      required: true,
    },
    {
      id: 3,
      name: "Rental Agreement Copy",
      status: "Uploaded",
      date: "01 Jan 2026",
      file: null,
      required: true,
    },
  ]);

  const fileInputRef = useRef(null);
  const [currentDocId, setCurrentDocId] = useState(null);

  // Handle upload
  const handleUploadClick = (docId) => {
    setCurrentDocId(docId);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === currentDocId
          ? {
              ...doc,
              status: "Uploaded",
              date: new Date().toLocaleDateString("en-GB"),
              file,
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
      {/* Hidden input for file upload */}
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {doc.name}
              </h3>

              {doc.date && (
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded: {doc.date}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Required / Optional badge */}
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  doc.required
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {doc.required ? "Required" : "Optional"}
              </span>

              {/* Status badge */}
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  doc.status === "Uploaded"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {doc.status}
              </span>

              <CButton
                className="border px-4 py-2 rounded-xl text-sm"
                onClick={() =>
                  doc.status === "Uploaded"
                    ? handleView(doc)
                    : handleUploadClick(doc.id)
                }
              >
                {doc.status === "Uploaded" ? "View" : "Upload"}
              </CButton>

              {doc.status === "Uploaded" && (
                <CButton
                  className="border px-4 py-2 rounded-xl text-sm"
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
