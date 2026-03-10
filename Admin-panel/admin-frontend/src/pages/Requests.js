import React, { useCallback, useEffect, useState } from 'react';
import { requestsAPI } from '../services/api';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import PageLoader from '../components/PageLoader';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const params = {
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter
      };
      const response = await requestsAPI.getRequests(params);
      const list = Array.isArray(response.data.requests) ? response.data.requests : [];
      setRequests(list.filter((item) => item.requestType !== 'contact'));
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchStats = async () => {
    try {
      const response = await requestsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests]);

  const handleView = (request) => {
    setSelectedRequest(request);
    setReplyMessage(request.adminReply || '');
    setShowViewModal(true);
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await requestsAPI.deleteRequest(requestId);
        fetchRequests();
        fetchStats();
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  const handleSendReply = async () => {
    if (!selectedRequest?._id) return;
    if (!replyMessage.trim()) {
      alert('Reply message is required');
      return;
    }

    try {
      setSendingReply(true);
      const response = await requestsAPI.replyRequest(selectedRequest._id, {
        replyMessage: replyMessage.trim()
      });

      if (response?.data?.request) {
        setSelectedRequest(response.data.request);
      }
      if (response?.data?.mailtoUrl) {
        window.location.href = response.data.mailtoUrl;
      }
      alert(response?.data?.message || 'Reply sent successfully');
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'demo_request': return 'D';
      case 'support_ticket': return 'S';
      case 'pg_booking': return 'B';
      case 'complaint': return '!';
      case 'maintenance': return 'M';
      default: return 'R';
    }
  };

  if (loading) {
    return <PageLoader message="Loading requests..." className="min-h-[60vh]" />;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Inbound Requests</h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown.resolved}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
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
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              onClick={fetchRequests}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-base font-semibold mr-2">{getRequestTypeIcon(request.requestType)}</span>
                    <span className="text-sm text-gray-900">{request.requestType.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{request.requesterName}</div>
                      <div className="text-gray-500">{request.requesterEmail}</div>
                      <div className="text-gray-500">{request.requesterPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{request.subject}</div>
                      <div className="text-gray-500 truncate max-w-xs">{request.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.requestStatus)}`}>
                      {request.requestStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleView(request)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(request._id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 p-4">
          <div className="w-full max-w-md rounded-md border bg-white p-5 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Request Details</h3>
            </div>

            <div className="mt-4">
              <div className="space-y-3">
                <div><span className="font-medium">Type:</span> {selectedRequest.requestType.replace(/_/g, ' ')}</div>
                <div><span className="font-medium">Requester:</span> {selectedRequest.requesterName} ({selectedRequest.requesterEmail})</div>
                <div><span className="font-medium">Phone:</span> {selectedRequest.requesterPhone}</div>
                <div><span className="font-medium">Subject:</span> {selectedRequest.subject}</div>
                <div><span className="font-medium">Description:</span> {selectedRequest.description}</div>
                <div>
                  <span className="font-medium">Priority:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.requestStatus)}`}>
                    {selectedRequest.requestStatus.replace('_', ' ')}
                  </span>
                </div>
                {selectedRequest.adminReplySentAt && (
                  <div>
                    <span className="font-medium">Reply sent:</span> {new Date(selectedRequest.adminReplySentAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700">Reply to requester email</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type reply that will be sent to requester email..."
              />
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleSendReply}
                disabled={sendingReply}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {sendingReply ? 'Sending...' : 'Send Reply Email'}
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

export default Requests;


