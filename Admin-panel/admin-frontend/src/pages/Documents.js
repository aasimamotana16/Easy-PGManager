import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import CRUDTable from '../components/CRUDTable';
import { documentsAPI } from '../services/api';

const getBackendBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

const getDocumentBaseUrl = () => {
  const configured = (process.env.REACT_APP_DOCUMENT_BASE_URL || '').trim();
  if (configured) return configured.replace(/\/$/, '');
  return getBackendBaseUrl();
};

const resolveDocumentUrl = (docCell) => {
  const apiProvidedUrl = (docCell?.fileUrl || '').trim();
  if (apiProvidedUrl) {
    if (/^https?:\/\//i.test(apiProvidedUrl)) return apiProvidedUrl;
    const documentBaseUrl = getDocumentBaseUrl();
    const normalizedApiPath = apiProvidedUrl.replace(/^\.?\//, '');
    if (normalizedApiPath.startsWith('uploads/')) return `${documentBaseUrl}/${normalizedApiPath}`;
    return `${documentBaseUrl}/uploads/documents/${normalizedApiPath}`;
  }

  const rawPath = (docCell?.filePath || '').trim();
  const fileName = (docCell?.fileName || '').trim();
  if (rawPath && /^https?:\/\//i.test(rawPath)) return rawPath;

  const documentBaseUrl = getDocumentBaseUrl();
  if (rawPath) {
    const normalizedPath = rawPath.replace(/^\.?\//, '');
    if (normalizedPath.startsWith('uploads/')) return `${documentBaseUrl}/${normalizedPath}`;
    return `${documentBaseUrl}/uploads/documents/${normalizedPath}`;
  }

  if (fileName) return `${documentBaseUrl}/uploads/documents/${fileName}`;
  return '';
};

const renderDocumentCell = (docCell) => {
  const docUrl = resolveDocumentUrl(docCell);
  const isUploaded = Boolean(docCell?.uploaded);

  if (!isUploaded) {
    return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Not uploaded</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Uploaded</span>
      {docUrl ? (
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
          title="View document"
          aria-label="View document"
        >
          <Eye className="w-4 h-4" />
        </a>
      ) : null}
    </div>
  );
};

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingVerificationFor, setUpdatingVerificationFor] = useState(null);

  const fetchDocuments = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search };

      const response = await documentsAPI.getDocuments(params);
      setDocuments(response.data.documents || []);
      setPagination(response.data.pagination || null);
      setError(null);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleVerificationChange = async (row, nextStatus) => {
    if (!row?.pgId || !nextStatus) return;
    if (nextStatus === row.verificationStatus) return;

    try {
      setUpdatingVerificationFor(row.pgId);
      await documentsAPI.updateVerification(row.pgId, { status: nextStatus });
      await fetchDocuments(currentPage, searchTerm);
    } catch (updateError) {
      alert(updateError.response?.data?.message || 'Failed to update verification status');
    } finally {
      setUpdatingVerificationFor(null);
    }
  };

  const uploadedByColumn = {
    key: 'ownerName',
    label: 'Uploaded By',
    render: (ownerName, row) => (
      <div className="leading-tight">
        <div className="font-medium">{ownerName || 'N/A'}</div>
        <div className="text-xs text-gray-500">{row.ownerEmail || ''}</div>
      </div>
    )
  };

  const verificationColumn = {
    key: 'verification',
    label: 'Verification',
    render: (_, row) => {
      const requiredUploaded = Boolean(row.requiredDocumentsUploaded);
      const status = row.verificationStatus || 'pending';
      const isUpdating = updatingVerificationFor === row.pgId;

      return (
        <div className="flex flex-col gap-2">
          <select
            value={status}
            disabled={isUpdating || !requiredUploaded}
            onChange={(e) => handleVerificationChange(row, e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {!requiredUploaded && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 w-fit">
              Missing required docs
            </span>
          )}
          {requiredUploaded && status === 'approved' && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 w-fit">
              Verified and live
            </span>
          )}
          {requiredUploaded && status === 'rejected' && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 w-fit">
              Rejected
            </span>
          )}
        </div>
      );
    }
  };

  const ownerColumns = [
    { key: 'pgName', label: 'PG Name' },
    uploadedByColumn,
    {
      key: 'aadhaarCard',
      label: 'Aadhaar Card',
      render: (docCell) => renderDocumentCell(docCell)
    },
    {
      key: 'electricityBill',
      label: 'Electricity Bill',
      render: (docCell) => renderDocumentCell(docCell)
    },
    {
      key: 'propertyTaxReceipt',
      label: 'Property Tax Receipt',
      render: (docCell) => renderDocumentCell(docCell)
    },
    verificationColumn
  ];

  const columns = ownerColumns;

  return (
    <div className="p-4 sm:p-6">
      <CRUDTable
        data={documents}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onSearch={setSearchTerm}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        showAddButton={false}
        showActions={false}
        searchPlaceholder="Search by PG, owner, or file name..."
        title="Property Verification Documents"
        headerRightContent={null}
      />
    </div>
  );
};

export default Documents;
