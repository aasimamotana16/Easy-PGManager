import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2"; 
import { 
  FaCloudUploadAlt, 
  FaEye, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaFileImport,
  FaTrash
} from "react-icons/fa";
import { uploadUserDocument, getMyDocuments, deleteUserDocument } from "../../../api/api";
import { Heading3 } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Documents = () => {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentDocId, setCurrentDocId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getMyDocuments();
      if (response.data.success) {
        const docsData = response.data.data;
        const allDocs = [
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
            guidance: "Official Government issued Aadhar Card",
            fieldName: "aadharCard"
          },
          {
            id: 3,
            name: "Rental Agreement Copy",
            status: docsData.rentalAgreementCopy?.status || "Pending",
            date: docsData.rentalAgreementCopy?.uploadedAt ? new Date(docsData.rentalAgreementCopy.uploadedAt).toLocaleDateString("en-GB") : null,
            fileUrl: docsData.rentalAgreementCopy?.fileUrl || null,
            guidance: "Upload signed agreement copy (with signature)",
            fieldName: "rentalAgreementCopy"
          },
        ];

        setPendingDocs(allDocs.filter(doc => doc.status === "Pending"));
        setUploadedDocs(allDocs.filter(doc => doc.status !== "Pending"));
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire({ title: 'ERROR', text: 'Failed to load documents', icon: 'error', confirmButtonColor: '#000' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (docId) => {
    setCurrentDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const allDocs = [...pendingDocs, ...uploadedDocs];
      const currentDoc = allDocs.find(doc => doc.id === currentDocId);
      
      if (!currentDoc) return;

      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", currentDoc.fieldName);

      const response = await uploadUserDocument(formData);
      
      if (response.data.success) {
        Swal.fire({ title: 'SUCCESS', text: 'Document updated!', icon: 'success', confirmButtonColor: '#f97316', timer: 1500 });
        await fetchDocuments();
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({ title: 'FAILED', text: 'Upload failed', icon: 'error', confirmButtonColor: '#000' });
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleView = (doc) => {
    if (!doc.fileUrl) return;
    window.open(`${API_BASE_URL}${doc.fileUrl}`, "_blank");
  };

  const handleDelete = (doc) => {
    Swal.fire({
      title: 'Delete Document?',
      text: `This will remove the current ${doc.name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await deleteUserDocument(doc.fieldName);
          if (response.data.success) {
            Swal.fire({ title: 'DELETED', text: 'File removed successfully', icon: 'success', timer: 1000 });
            await fetchDocuments();
          }
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire({ title: 'ERROR', text: 'Failed to delete file', icon: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getStatusClasses = (status) => {
    if (status === "Uploaded") return "bg-green-50 text-green-700 border-green-200";
    if (status === "Verification Pending") return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-gray-50 text-gray-400 border-gray-200";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-12 bg-gray-200 min-h-screen">
      {/* 🟢 Loader overlay removed from here as it is handled by the Layout/Sidebar */}
      <div className="px-1">
          <div>
        <h2 className="  text-[#1C1C1C]"> Documents </h2>
        </div>
</div>
      
      <input type="file" accept=".pdf,.jpg,.png,.jpeg" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      {/* SECTION 1: PENDING DOCUMENTS */}
      <div className="space-y-6">
          <h3 className=" text-gray-800 flex items-center gap-3">
            <FaExclamationCircle className="text-orange-500" /> Pending Action
          </h3>
          <p className="text-gray-500 text-sm">Documents required to complete your profile</p>


        <div className="grid grid-cols-1 gap-4">
          {pendingDocs.length > 0 ? pendingDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-md border border-dashed border-gray-300 p-5 flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-gray-700 uppercase tracking-tight">{doc.name}</h3>
                <p className="text-xs text-gray-400 italic">{doc.guidance}</p>
              </div>
              <button onClick={() => handleUploadClick(doc.id)} className="text-orange-500 hover:scale-110 transition-transform">
                <FaCloudUploadAlt size={35} />
              </button>
            </div>
          )) : (
            <div className="bg-green-50 border border-green-100 p-4 rounded text-center text-green-700 font-bold text-sm uppercase">
              <FaCheckCircle className="inline mr-2" /> ✨ All required documents have been submitted!
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* SECTION 2: UPLOADED / RECENT DOCUMENTS */}
      <div className="space-y-6">
        <div className="px-1">
          <h3 className=" text-gray-800 flex items-center gap-3">
            <FaFileImport className="text-blue-500" /> Uploaded Documents
          </h3>
          <p className="text-gray-500 text-sm">View or update your existing legal records</p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {uploadedDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-md border border-gray-100 shadow-sm p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-lg md:text-2xl font-black uppercase text-gray-800">{doc.name}</h3>
                {doc.date && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Updated: {doc.date}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className={`px-4 py-1.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${getStatusClasses(doc.status)}`}>
                    {doc.status}
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => handleView(doc)} title="View" className="text-blue-500 hover:scale-110 transition-all"><FaEye size={24} /></button>
                  <button onClick={() => handleUploadClick(doc.id)} title="Update/Replace" className="text-orange-500 hover:scale-110 transition-all"><FaCloudUploadAlt size={24} /></button>
                  <button onClick={() => handleDelete(doc)} title="Delete" className="text-red-400 hover:text-red-600 transition-all"><FaTrash size={20} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documents;
