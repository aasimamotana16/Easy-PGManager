import React, { useEffect, useState } from 'react';
import CRUDTable from '../components/CRUDTable';
import { easyPGFAQsAPI } from '../services/api';

const FAQModal = ({ faq, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    displayOrder: 0,
    isActive: true,
    tags: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!faq) return;
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      displayOrder: Number.isFinite(Number(faq.displayOrder)) ? Number(faq.displayOrder) : 0,
      isActive: faq.isActive !== false,
      tags: Array.isArray(faq.tags) ? faq.tags.join(', ') : ''
    });
  }, [faq]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category.trim() || 'General',
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: Boolean(formData.isActive),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      };

      if (faq?._id) {
        await easyPGFAQsAPI.updateFAQ(faq._id, payload);
      } else {
        await easyPGFAQsAPI.createFAQ(payload);
      }
      onSave();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">{faq ? 'Edit FAQ' : 'Add FAQ'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Question</label>
            <input
              required
              value={formData.question}
              onChange={(event) => setFormData({ ...formData, question: event.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Answer</label>
            <textarea
              required
              rows={5}
              value={formData.answer}
              onChange={(event) => setFormData({ ...formData, answer: event.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(event) => setFormData({ ...formData, displayOrder: event.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              value={formData.tags}
              onChange={(event) => setFormData({ ...formData, tags: event.target.value })}
              placeholder="tenant, payment, booking"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id="faq-active"
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="faq-active" className="ml-2 text-sm text-gray-700">
              Active FAQ
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await easyPGFAQsAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (fetchError) {
      console.error('Failed to fetch FAQ categories', fetchError);
    }
  };

  const fetchFAQs = async (page = 1, search = '', category = '', status = '') => {
    try {
      setLoading(true);
      const response = await easyPGFAQsAPI.getFAQs({
        page,
        limit: 10,
        search,
        category,
        status
      });
      setFaqs(response.data.faqs || []);
      setPagination(response.data.pagination || null);
      setError(null);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFAQs(currentPage, searchTerm, categoryFilter, statusFilter);
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const handleAdd = () => {
    setSelectedFAQ(null);
    setShowModal(true);
  };

  const handleEdit = (faq) => {
    setSelectedFAQ(faq);
    setShowModal(true);
  };

  const handleDelete = async (faq) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await easyPGFAQsAPI.deleteFAQ(faq._id);
      fetchFAQs(currentPage, searchTerm, categoryFilter, statusFilter);
      fetchCategories();
    } catch (deleteError) {
      alert(deleteError.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  const columns = [
    {
      key: 'question',
      label: 'Question',
      render: (value) => <span className="max-w-[280px] truncate block">{value || 'N/A'}</span>
    },
    {
      key: 'answer',
      label: 'Answer',
      render: (value) => <span className="max-w-[360px] truncate block">{value || 'N/A'}</span>
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => value || 'General'
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            isActive === false ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {isActive === false ? 'Inactive' : 'Active'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setCategoryFilter(event.target.value);
            }}
            className="ml-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setStatusFilter(event.target.value);
            }}
            className="ml-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <CRUDTable
        data={faqs}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onSearch={(value) => {
          setCurrentPage(1);
          setSearchTerm(value);
        }}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search question, answer, category..."
        addButtonText="Add FAQ"
        title="FAQ Management"
      />

      {showModal ? (
        <FAQModal
          faq={selectedFAQ}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchFAQs(currentPage, searchTerm, categoryFilter, statusFilter);
            fetchCategories();
          }}
        />
      ) : null}
    </div>
  );
};

export default FAQs;
