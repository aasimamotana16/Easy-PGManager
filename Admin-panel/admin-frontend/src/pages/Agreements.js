import React, { useState, useEffect } from 'react';
import CRUDTable from '../components/CRUDTable';
import { agreementsAPI, ownersAPI, pgsAPI } from '../services/api';

const AgreementModal = ({ agreement, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    agreementNumber: '',
    owner: '',
    pg: '',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    tenantIdProof: '',
    tenantIdProofNumber: '',
    roomNumber: '',
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    deposit: 0,
    terms: '',
    status: 'active',
    documentUrl: '',
    signedByOwner: false,
    signedByTenant: false
  });
  const [owners, setOwners] = useState([]);
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ownersRes, pgsRes] = await Promise.all([
          ownersAPI.getOwners({ limit: 100 }),
          pgsAPI.getPGs({ limit: 100 })
        ]);
        setOwners(ownersRes.data.owners);
        setPGs(pgsRes.data.pgs);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (agreement) {
      setFormData({
        agreementNumber: agreement.agreementNumber,
        owner: agreement.owner._id,
        pg: agreement.pg._id,
        tenantName: agreement.tenantName,
        tenantEmail: agreement.tenantEmail,
        tenantPhone: agreement.tenantPhone,
        tenantIdProof: agreement.tenantIdProof,
        tenantIdProofNumber: agreement.tenantIdProofNumber,
        roomNumber: agreement.roomNumber,
        startDate: agreement.startDate ? new Date(agreement.startDate).toISOString().split('T')[0] : '',
        endDate: agreement.endDate ? new Date(agreement.endDate).toISOString().split('T')[0] : '',
        monthlyRent: agreement.monthlyRent,
        deposit: agreement.deposit,
        terms: agreement.terms,
        status: agreement.status,
        documentUrl: agreement.documentUrl || '',
        signedByOwner: agreement.signedByOwner,
        signedByTenant: agreement.signedByTenant
      });
    }
  }, [agreement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData };
      if (!data.documentUrl) delete data.documentUrl;
      
      if (agreement) {
        await agreementsAPI.updateAgreement(agreement._id, data);
      } else {
        await agreementsAPI.createAgreement(data);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving agreement:', error);
      alert(error.response?.data?.message || 'Error saving agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">
          {agreement ? 'Edit Agreement' : 'Add New Agreement'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Agreement Number</label>
              <input
                type="text"
                required
                value={formData.agreementNumber}
                onChange={(e) => setFormData({ ...formData, agreementNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner</label>
              <select
                required
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Owner</option>
                {owners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">PG</label>
              <select
                required
                value={formData.pg}
                onChange={(e) => setFormData({ ...formData, pg: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select PG</option>
                {pgs.map((pg) => (
                  <option key={pg._id} value={pg._id}>
                    {pg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
              <input
                type="text"
                required
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant Email</label>
              <input
                type="email"
                required
                value={formData.tenantEmail}
                onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant Phone</label>
              <input
                type="tel"
                required
                value={formData.tenantPhone}
                onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant ID Proof</label>
              <select
                value={formData.tenantIdProof}
                onChange={(e) => setFormData({ ...formData, tenantIdProof: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select ID Proof</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
                <option value="driving">Driving License</option>
                <option value="voter">Voter ID</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Proof Number</label>
              <input
                type="text"
                required
                value={formData.tenantIdProofNumber}
                onChange={(e) => setFormData({ ...formData, tenantIdProofNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Room Number</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
              <input
                type="number"
                required
                min="0"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Deposit</label>
              <input
                type="number"
                required
                min="0"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Terms and Conditions</label>
            <textarea
              required
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Document URL (Optional)</label>
            <input
              type="url"
              value={formData.documentUrl}
              onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
              placeholder="https://example.com/agreement.pdf"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="signedByOwner"
                checked={formData.signedByOwner}
                onChange={(e) => setFormData({ ...formData, signedByOwner: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="signedByOwner" className="ml-2 block text-sm text-gray-900">
                Signed by Owner
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="signedByTenant"
                checked={formData.signedByTenant}
                onChange={(e) => setFormData({ ...formData, signedByTenant: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="signedByTenant" className="ml-2 block text-sm text-gray-900">
                Signed by Tenant
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  const fetchAgreements = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await agreementsAPI.getAgreements({ page, limit: 10, search });
      setAgreements(response.data.agreements);
      setPagination(response.data.pagination);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAdd = () => {
    setSelectedAgreement(null);
    setShowModal(true);
  };

  const handleEdit = (agreement) => {
    setSelectedAgreement(agreement);
    setShowModal(true);
  };

  const handleDelete = async (agreement) => {
    if (window.confirm(`Are you sure you want to delete ${agreement.agreementNumber}?`)) {
      try {
        await agreementsAPI.deleteAgreement(agreement._id);
        fetchAgreements(currentPage, searchTerm);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete agreement');
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchAgreements(currentPage, searchTerm);
  };

  const columns = [
    { key: 'agreementNumber', label: 'Agreement No.' },
    { key: 'tenantName', label: 'Tenant' },
    { key: 'tenantEmail', label: 'Email' },
    { key: 'roomNumber', label: 'Room' },
    {
      key: 'owner',
      label: 'Owner',
      render: (owner) => owner?.name || 'N/A'
    },
    {
      key: 'pg',
      label: 'PG',
      render: (pg) => pg?.name || 'N/A'
    },
    {
      key: 'monthlyRent',
      label: 'Rent/Month',
      render: (rent) => `â‚¹${rent}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'expired' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      )
    },
    {
      key: 'signedByOwner',
      label: 'Signed',
      render: (_, agreement) => (
        <div className="flex space-x-1">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            agreement.signedByOwner ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            Owner: {agreement.signedByOwner ? 'Yes' : 'No'}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            agreement.signedByTenant ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            Tenant: {agreement.signedByTenant ? 'Yes' : 'No'}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6">
      <CRUDTable
        data={agreements}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onSearch={setSearchTerm}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search agreements..."
        addButtonText="Add Agreement"
        title="Agreements Management"
      />

      {showModal && (
        <AgreementModal
          agreement={selectedAgreement}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Agreements;

