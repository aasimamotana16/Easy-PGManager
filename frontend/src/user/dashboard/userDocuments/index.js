import React, { useState, useRef } from "react";
import Swal from "sweetalert2"; // Ensure you have run: npm install sweetalert2
import { 
  FaCloudUploadAlt, 
  FaEye, 
  FaDownload, 
  FaFileAlt, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaInfoCircle
} from "react-icons/fa";

const Documents = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "ID Document",
      status: "Pending",
      date: null,
      file: null,
      required: true,
      guidance: "Upload ID proof, College ID, or any supporting document",
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
    },
  ]);

  const fileInputRef = useRef(null);
  const [currentDocId, setCurrentDocId] = useState(null);

  // --- FUNCTIONAL LOGIC ---

  // Trigger file selection
  const handleUploadClick = (docId) => {
    setCurrentDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (Example: 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'FILE TOO LARGE',
        text: 'Maximum file size allowed is 5MB.',
        icon: 'error',
        confirmButtonColor: '#000',
      });
      return;
    }

    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === currentDocId
          ? {
              ...doc,
              file: file,
              date: new Date().toLocaleDateString("en-GB"),
              status: "Verification Pending",
            }
          : doc
      )
    );

    // Success Notification
    Swal.fire({
      title: 'UPLOADED',
      text: 'Document sent for verification.',
      icon: 'success',
      confirmButtonColor: '#f97316', // Orange-500
      timer: 2000
    });
    
    // Reset input so the same file can be re-uploaded if needed
    e.target.value = null;
  };

  // View File in new tab
  const handleView = (doc) => {
    if (!doc.file) {
      Swal.fire({
        title: 'NOT FOUND',
        text: 'No local file data available to view.',
        icon: 'warning',
        confirmButtonColor: '#000',
      });
      return;
    }
    const fileURL = URL.createObjectURL(doc.file);
    window.open(fileURL, "_blank");
  };

  // Download File
  const handleDownload = (doc) => {
    if (!doc.file) {
      Swal.fire({
        title: 'NOT FOUND',
        text: 'No local file data available to download.',
        icon: 'warning',
        confirmButtonColor: '#000',
      });
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(doc.file);
    link.download = doc.file.name || `${doc.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Uploaded":
        return "bg-green-50 text-green-700 border-green-200 ";
      case "Verification Pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Hidden File Input */}
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* HEADER */}
      <div className="px-1 text-center md:text-left">
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800"> My Documents
        </h1>
        <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-gray-500">
          Verified Legal Records & Attachments
        </p>
      </div>

      {/* DOCUMENT LIST */}
      <div className="grid grid-cols-1 gap-5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-md border border-gray-100 shadow-sm hover:border-orange-200 transition-all duration-300 p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-4xl lg:text-2xl font-black uppercase tracking-tight text-gray-800">
                  {doc.name}
                </h3>
                {doc.required && <span className="text-red-500 font-bold">*</span>}
              </div>

              {doc.guidance && (
                <div className="flex items-start gap-1 text-gray-600">
                  <FaInfoCircle className="mt-1 flex-shrink-0" size={12} />
                  <p className="text-[10px] md:text-xl lg:text-sm font-medium italic">
                    {doc.guidance}
                  </p>
                </div>
              )}

              {doc.date && (
                <p className="text-[9px] md:text-xs font-bold text-gray-300 uppercase tracking-widest">
                  Logged: {doc.date}
                </p>
              )}
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
              {/* STATUS BADGE */}
              <div
                className={`flex items-center gap-2 px-5 py-2 rounded-full border text-[10px] md:text-2xl lg:text-xs font-black uppercase tracking-widest ${getStatusClasses(
                  doc.status
                )}`}
              >
                {doc.status === "Uploaded" ? (
                  <FaCheckCircle size={14} />
                ) : (
                  <FaExclamationCircle size={14} />
                )}
                {doc.status}
              </div>

              <div className="flex items-center gap-4">
                {/* UPLOAD ICON */}
                {doc.status === "Pending" && (
                  <button
                    onClick={() => handleUploadClick(doc.id)}
                    aria-label="Upload Document"
                    className="text-orange-500 hover:scale-110 transition-transform"
                  >
                    <FaCloudUploadAlt className="text-[14px] md:text-[45px] lg:text-[30px]" />
                  </button>
                )}

                {/* VIEW ICON */}
                {(doc.status === "Uploaded" || doc.status === "Verification Pending") && (
                  <button
                    onClick={() => handleView(doc)}
                    aria-label="View Document"
                    className="text-blue-500 hover:scale-110 transition-transform"
                  >
                    <FaEye className="text-[14px] md:text-[45px] lg:text-[30px]" />
                  </button>
                )}

                {/* DOWNLOAD ICON */}
                {(doc.status === "Uploaded" || doc.status === "Verification Pending") && (
                  <button
                    onClick={() => handleDownload(doc)}
                    aria-label="Download Document"
                    className="text-gray-700 hover:text-black hover:scale-110 transition-transform"
                  >
                    <FaDownload size={22} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ENCRYPTION FOOTER */}
      <div className="pt-8 flex flex-col items-center">
        <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] md:text-xs font-black uppercase text-gray-400 tracking-widest">
            AES-256 Bit Encrypted Storage Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default Documents;