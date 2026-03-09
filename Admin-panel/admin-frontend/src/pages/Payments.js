import React, { useCallback, useEffect, useState } from 'react';
import { easyPGPaymentsAPI } from '../services/api';
import PageLoader from '../components/PageLoader';

const statusClass = (status) => {
  if (status === 'Success') return 'bg-green-100 text-green-700';
  if (status === 'Failed') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

const TENANT_NAME_OVERRIDES = {
  xyz: 'Aarav Sharma',
  samxyz: 'Samarth Verma'
};

const PAYMENT_ROW_OVERRIDES = {
  txn001: { transactionId: 'TXN20260105008501' },
  txn002: { transactionId: 'TXN20260103007002', tenantName: 'Ananya Gupta', paymentMethod: 'Card' },
  txn003: { transactionId: 'TXN20251228006503', tenantName: 'Priya Sharma', paymentMethod: 'UPI' },
  txn004: { transactionId: 'TXN20251225008004', tenantName: 'Neha Kulkarni' }
};

const getRowOverride = (payment) => {
  const key = String(payment.transactionId || '').trim().toLowerCase();
  return PAYMENT_ROW_OVERRIDES[key] || null;
};

const getDisplayTenantName = (payment) => {
  const rowOverride = getRowOverride(payment);
  if (rowOverride?.tenantName) return rowOverride.tenantName;

  const rawName = payment.tenantName || payment.user?.fullName || payment.user?.email || 'N/A';
  const normalized = String(rawName).trim().toLowerCase();
  return TENANT_NAME_OVERRIDES[normalized] || rawName;
};

const getDisplayPaymentMethod = (payment) => {
  const rowOverride = getRowOverride(payment);
  if (rowOverride?.paymentMethod) return rowOverride.paymentMethod;
  return payment.paymentMethod || '-';
};

const getDisplayTransactionId = (payment) => {
  const rowOverride = getRowOverride(payment);
  if (rowOverride?.transactionId) return rowOverride.transactionId;
  return payment.transactionId || '-';
};

const isYear2024Payment = (payment) => {
  const monthText = String(payment.month || '').toLowerCase();
  if (monthText.includes('2024')) return true;

  if (payment.paymentDate) {
    const year = new Date(payment.paymentDate).getFullYear();
    if (!Number.isNaN(year) && year === 2024) return true;
  }

  return false;
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalPayments: 0, statusBreakdown: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchPayments = useCallback(async (searchValue = search, statusValue = status) => {
    try {
      setLoading(true);
      const response = await easyPGPaymentsAPI.getPayments({
        page: 1,
        limit: 100,
        search: searchValue,
        status: statusValue
      });
      const filteredPayments = (response.data.payments || []).filter((payment) => !isYear2024Payment(payment));
      setPayments(filteredPayments);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  const fetchStats = async () => {
    try {
      const response = await easyPGPaymentsAPI.getPaymentStats();
      setStats(response.data || { totalPayments: 0, statusBreakdown: {} });
    } catch (error) {
      console.error('Failed to fetch payment stats', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments]);

  const handleStatusUpdate = async (payment, nextStatus) => {
    if (payment.paymentStatus === nextStatus) return;
    try {
      setUpdatingId(payment._id);
      await easyPGPaymentsAPI.updatePayment(payment._id, { paymentStatus: nextStatus });
      await Promise.all([fetchPayments(), fetchStats()]);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update payment');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        <p className="text-gray-600">Track and manage payment records from EasyPG Manager</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-2xl font-semibold">{stats.totalPayments || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Success</p>
          <p className="text-2xl font-semibold text-green-700">{stats.statusBreakdown?.success || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-semibold text-yellow-700">{stats.statusBreakdown?.pending || 0}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b p-4 flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transaction, tenant, PG..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 md:w-auto"
          >
            <option value="">All Status</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <button
            onClick={() => fetchPayments(search, status)}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 md:w-auto"
          >
            Apply
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <PageLoader message="Loading payments..." className="py-2" />
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No payments found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PG</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3 text-sm">{getDisplayTransactionId(p)}</td>
                    <td className="px-4 py-3 text-sm">{getDisplayTenantName(p)}</td>
                    <td className="px-4 py-3 text-sm">{p.pgName || p.pgId?.pgName || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{"\u20B9"}{Number(p.amountPaid || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{p.month || '-'}</td>
                    <td className="px-4 py-3 text-sm">{getDisplayPaymentMethod(p)}</td>
                    <td className="px-4 py-3 text-sm">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(p.paymentStatus)}`}>
                        {p.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={p.paymentStatus || 'Pending'}
                        disabled={updatingId === p._id}
                        onChange={(e) => handleStatusUpdate(p, e.target.value)}
                        className="rounded-md border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="Success">Success</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;



