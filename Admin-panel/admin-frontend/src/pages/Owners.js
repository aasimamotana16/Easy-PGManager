import React, { useState, useEffect } from 'react';
import CRUDTable from '../components/CRUDTable';
import { ownersAPI } from '../services/api';

const OwnerModal = ({ owner, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    idProof: '',
    idProofNumber: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (owner) {
      setFormData({
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        address: owner.address,
        idProof: owner.idProof,
        idProofNumber: owner.idProofNumber,
        status: owner.status
      });
    }
  }, [owner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (owner) {
        await ownersAPI.updateOwner(owner._id, formData);
      } else {
        await ownersAPI.createOwner(formData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving owner:', error);
      alert(error.response?.data?.message || 'Error saving owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">
          {owner ? 'Edit Owner' : 'Add New Owner'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Proof Type</label>
            <select
              value={formData.idProof}
              onChange={(e) => setFormData({ ...formData, idProof: e.target.value })}
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
              value={formData.idProofNumber}
              onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
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
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
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

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const fetchOwners = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await ownersAPI.getOwners({ page, limit: 10, search });
      setOwners(response.data.owners);
      setPagination(response.data.pagination);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch owners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAdd = () => {
    setSelectedOwner(null);
    setShowModal(true);
  };

  const handleEdit = (owner) => {
    setSelectedOwner(owner);
    setShowModal(true);
  };

  const handleDelete = async (owner) => {
    if (window.confirm(`Are you sure you want to delete ${owner.name}?`)) {
      try {
        await ownersAPI.deleteOwner(owner._id);
        fetchOwners(currentPage, searchTerm);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete owner');
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchOwners(currentPage, searchTerm);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-800' : 
          status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      )
    },
    { key: 'totalPGs', label: 'Total PGs' }
  ];

  return (
    <div className="p-4 sm:p-6">
      <CRUDTable
        data={owners}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onSearch={setSearchTerm}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search owners..."
        addButtonText="Add Owner"
        title="Owners Management"
      />

      {showModal && (
        <OwnerModal
          owner={selectedOwner}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Owners;

