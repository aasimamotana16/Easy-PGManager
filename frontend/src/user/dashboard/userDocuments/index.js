import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2"; // Ensure you have run: npm install sweetalert2
import { 
  FaCloudUploadAlt, 
  FaEye, 
  FaDownload, 
  FaFileAlt, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaInfoCircle,
  FaTrash
} from "react-icons/fa";
import { uploadUserDocument, getMyDocuments, deleteUserDocument } from "../../../api/api";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentDocId, setCurrentDocId] = useState(null);

  // Fetch documents from backend on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getMyDocuments();
      if (response.data.success) {
        const docsData = response.data.data;
        const formattedDocs = [
          {
            id: 1,
            name: "ID Document",
            status: docsData.idDocument?.status || "Pending",
            date: docsData.idDocument?.uploadedAt ? new Date(docsData.idDocument.uploadedAt).toLocaleDateString("en-GB") : null,
            fileUrl: docsData.idDocument?.fileUrl || null,
            required: true,
            guidance: "Upload ID proof, College ID, or any supporting document",
            fieldName: "idDocument"
          },
          {
            id: 2,
            name: "Aadhar Card",
            status: docsData.aadharCard?.status || "Pending",
            date: docsData.aadharCard?.uploadedAt ? new Date(docsData.aadharCard.uploadedAt).toLocaleDateString("en-GB") : null,
            fileUrl: docsData.aadharCard?.fileUrl || null,
            required: true,
            fieldName: "aadharCard"
          },
          {
            id: 3,
            name: "Rental Agreement Copy",
            status: docsData.rentalAgreementCopy?.status || "Pending",
            date: docsData.rentalAgreementCopy?.uploadedAt ? new Date(docsData.rentalAgreementCopy.uploadedAt).toLocaleDateString("en-GB") : null,
            fileUrl: docsData.rentalAgreementCopy?.fileUrl || null,
            fieldName: "rentalAgreementCopy"
          },
        ];
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire({
        title: 'ERROR',
        text: 'Failed to load documents',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCTIONAL LOGIC ---

  // Trigger file selection
  const handleUploadClick = (docId) => {
    setCurrentDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected file and upload to backend
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'FILE TOO LARGE',
        text: 'Maximum file size allowed is 5MB.',
        icon: 'error',
        confirmButtonColor: '#000',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Find the current document to get the field name
      const currentDoc = documents.find(doc => doc.id === currentDocId);
      if (!currentDoc) {
        throw new Error("Document not found");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", currentDoc.fieldName);

      // Upload to backend
      const response = await uploadUserDocument(formData);
      
      if (response.data.success) {
        // Show success message
        Swal.fire({
          title: 'UPLOADED',
          text: 'Document uploaded successfully!',
          icon: 'success',
          confirmButtonColor: '#f97316',
          timer: 2000
        });
        
        // Refresh documents list
        await fetchDocuments();
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        title: 'UPLOAD FAILED',
        text: error.response?.data?.message || 'Failed to upload document',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    } finally {
      setLoading(false);
      // Reset input so the same file can be re-uploaded if needed
      e.target.value = null;
    }
  };

  // View File in new tab
  const handleView = (doc) => {
    if (!doc.fileUrl) {
      Swal.fire({
        title: 'NOT FOUND',
        text: 'No file available to view.',
        icon: 'warning',
        confirmButtonColor: '#000',
      });
      return;
    }
    window.open(`http://localhost:5000${doc.fileUrl}`, "_blank");
  };

  // Download File
  const handleDownload = (doc) => {
    if (!doc.fileUrl) {
      Swal.fire({
        title: 'NOT FOUND',
        text: 'No file available to download.',
        icon: 'warning',
        confirmButtonColor: '#000',
      });
      return;
    }
    const link = document.createElement("a");
    link.href = `http://localhost:5000${doc.fileUrl}`;
    link.download = `${doc.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Document
  const handleDelete = (doc) => {
    Swal.fire({
      title: 'Delete Document',
      text: 'Are you sure you want to delete this document?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await deleteUserDocument(doc.fieldName);
          
          Swal.fire({
            title: 'Deleted!',
            text: 'Your document has been deleted.',
            icon: 'success',
            confirmButtonColor: '#f97316'
          });
          
          fetchDocuments();
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to delete document',
            icon: 'error',
            confirmButtonColor: '#000'
          });
        } finally {
          setLoading(false);
        }
      }
    });
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

              {/* DELETE ICON */}
              {(doc.status === "Uploaded" || doc.status === "Verification Pending") && (
                <button
                  onClick={() => handleDelete(doc)}
                  aria-label="Delete Document"
                  className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform"
                >
                  <FaTrash size={22} />
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
}

export default Documents;