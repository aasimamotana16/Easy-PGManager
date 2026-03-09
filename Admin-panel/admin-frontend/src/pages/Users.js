import React, { useEffect, useState } from 'react';
import CRUDTable from '../components/CRUDTable';
import { easyPGUsersAPI } from '../services/api';

const normalizeRole = (role) => (role || '').toLowerCase();

const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    isVerified: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        isVerified: Boolean(user.isVerified)
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        role: 'tenant',
        isVerified: formData.isVerified
      };

      if (!user) {
        payload.password = formData.password;
        await easyPGUsersAPI.createUser(payload);
      } else {
        await easyPGUsersAPI.updateUser(user._id, payload);
      }

      onSave();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save tenant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-medium">{user ? 'Edit Tenant' : 'Add Tenant'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                minLength={6}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          )}
          <div className="flex items-center">
            <input
              id="isVerified"
              type="checkbox"
              checked={formData.isVerified}
              onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700">
              Verified
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Users = () => {
  const TENANTS_PER_PAGE = 25;
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const fetchTenants = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await easyPGUsersAPI.getUsersByRole('tenant', { page, limit: TENANTS_PER_PAGE, search });
      setTenants(response.data.users || []);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAdd = () => {
    setSelectedTenant(null);
    setShowModal(true);
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const handleDelete = async (tenant) => {
    if (!window.confirm(`Delete ${tenant.fullName || tenant.email}?`)) return;
    try {
      await easyPGUsersAPI.deleteUser(tenant._id);
      fetchTenants(currentPage, searchTerm);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tenant');
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Name',
      render: (_, item) => item.fullName || item.name || 'N/A'
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role',
      label: 'Role',
      render: (role) => (
            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {normalizeRole(role) || 'tenant'}
            </span>
      )
    },
    {
      key: 'isVerified',
      label: 'Verified',
      render: (isVerified) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {isVerified ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4 p-6">
      <CRUDTable
        data={tenants}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onSearch={setSearchTerm}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search tenants by name/email/phone"
        addButtonText="Add Tenant"
        title="Tenants Management"
      />

      {showModal && (
        <UserModal
          user={selectedTenant}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchTenants(currentPage, searchTerm);
          }}
        />
      )}
    </div>
  );
};

export default Users;

