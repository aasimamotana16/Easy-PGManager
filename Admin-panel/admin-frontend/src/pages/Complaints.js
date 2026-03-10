import React, { useState, useEffect } from 'react';
import CRUDTable from '../components/CRUDTable';
import { complaintsAPI } from '../services/api';

const ComplaintModal = ({ complaint, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complainantName: '',
    complainantEmail: '',
    complainantPhone: '',
    pgId: '',
    type: 'maintenance',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    resolution: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (complaint) {
      const pgIdValue =
        typeof complaint.pgId === 'string'
          ? complaint.pgId
          : complaint.pgId?._id || '';
      setFormData({
        title: complaint.title || '',
        description: complaint.description || '',
        complainantName: complaint.complainantName || '',
        complainantEmail: complaint.complainantEmail || '',
        complainantPhone: complaint.complainantPhone || '',
        pgId: pgIdValue,
        type: complaint.type || 'maintenance',
        priority: complaint.priority || 'medium',
        status: complaint.status || 'pending',
        assignedTo: complaint.assignedTo?._id || '',
        resolution: complaint.resolution || ''
      });
    }
  }, [complaint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData };
      if (!data.assignedTo) delete data.assignedTo;
      if (!data.resolution) delete data.resolution;
      
      if (complaint) {
        await complaintsAPI.updateComplaint(complaint._id, data);
      } else {
        await complaintsAPI.createComplaint(data);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving complaint:', error);
      alert(error.response?.data?.message || 'Error saving complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">
          {complaint ? 'Edit Complaint' : 'Add New Complaint'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Complainant Name</label>
              <input
                type="text"
                required
                value={formData.complainantName}
                onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.complainantEmail}
                onChange={(e) => setFormData({ ...formData, complainantEmail: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                required
                value={formData.complainantPhone}
                onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">PG ID</label>
              <input
                type="text"
                required
                value={formData.pgId}
                onChange={(e) => setFormData({ ...formData, pgId: e.target.value })}
                placeholder="Enter PG ID"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="maintenance">Maintenance</option>
                <option value="staff">Staff</option>
                <option value="facility">Facility</option>
                <option value="payment">Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned To (User ID)</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Enter user ID"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Resolution</label>
            <textarea
              value={formData.resolution}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              rows={3}
              placeholder="Enter resolution details (if resolved)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
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

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getComplaints({ page, limit: 10, search });
      setComplaints(response.data.complaints);
      setPagination(response.data.pagination);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAdd = () => {
    setSelectedComplaint(null);
    setShowModal(true);
  };

  const handleEdit = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const handleDelete = async (complaint) => {
    if (window.confirm(`Are you sure you want to delete ${complaint.title}?`)) {
      try {
        await complaintsAPI.deleteComplaint(complaint._id);
        fetchComplaints(currentPage, searchTerm);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete complaint');
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchComplaints(currentPage, searchTerm);
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'complainantName', label: 'Complainant' },
    {
      key: 'pgId',
      label: 'PG',
      render: (pg) => pg?.name || 'N/A'
    },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span className="capitalize">{type}</span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (priority) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          priority === 'urgent' ? 'bg-red-100 text-red-800' :
          priority === 'high' ? 'bg-orange-100 text-orange-800' :
          priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {priority}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          status === 'resolved' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div className="p-4 sm:p-6">
      <CRUDTable
        data={complaints}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onSearch={setSearchTerm}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search complaints..."
        addButtonText="Add Complaint"
        title="Complaints Management"
      />

      {showModal && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Complaints;

