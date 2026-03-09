import React, { useCallback, useEffect, useState } from 'react';
import { contactsAPI } from '../services/api';
import { Search, Filter, Trash2, Send, Mail, CheckCircle } from 'lucide-react';
import PageLoader from '../components/PageLoader';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await contactsAPI.getContacts({
        search: searchTerm,
        status: statusFilter
      });
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const fetchStats = async () => {
    try {
      const response = await contactsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [fetchContacts]);

  const handleView = (contact) => {
    setSelectedContact(contact);
    setReplyMessage(contact.adminReply || '');
    setShowViewModal(true);
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    try {
      await contactsAPI.deleteContact(contactId);
      fetchContacts();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete contact message');
    }
  };

  const handleSendReply = async () => {
    if (!selectedContact?._id) return;
    if (!replyMessage.trim()) {
      alert('Reply message is required');
      return;
    }
    try {
      setSendingReply(true);
      const response = await contactsAPI.replyContact(selectedContact._id, { replyMessage: replyMessage.trim() });
      if (response?.data?.contact) setSelectedContact(response.data.contact);
      alert(response?.data?.message || 'Reply sent successfully');
      fetchContacts();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return <PageLoader message="Loading contacts..." className="min-h-[60vh]" />;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Messages</h1>
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown.resolved}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
            <button
              onClick={fetchContacts}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.requesterName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div>{contact.requesterEmail}</div>
                    <div className="text-gray-500">{contact.requesterPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="text-gray-600 whitespace-pre-wrap break-words">{contact.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {contact.status === 'resolved' ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleView(contact)} className="text-blue-600 hover:text-blue-900 mr-3" title="Reply">
                      <Send className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(contact._id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showViewModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 p-4">
          <div className="w-full max-w-md rounded-md border bg-white p-5 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Message</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div><span className="font-medium">Name:</span> {selectedContact.requesterName}</div>
              <div><span className="font-medium">Email:</span> {selectedContact.requesterEmail}</div>
              <div><span className="font-medium">Phone:</span> {selectedContact.requesterPhone}</div>
              <div><span className="font-medium">Subject:</span> {selectedContact.subject}</div>
              <div><span className="font-medium">Message:</span> {selectedContact.message}</div>
              {selectedContact.adminReplySentAt && (
                <div className="text-green-700">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Reply sent on {new Date(selectedContact.adminReplySentAt).toLocaleString()}
                </div>
              )}
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700">Reply to email</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type reply that will be sent on email..."
              />
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleSendReply}
                disabled={sendingReply}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Mail className="h-4 w-4 inline mr-2" />
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;


