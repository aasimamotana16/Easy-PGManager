import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { easyPGBookingsAPI } from '../services/api';
import PageLoader from '../components/PageLoader';

const statusClass = (status) => {
  if (status === 'Confirmed') return 'bg-green-100 text-green-700';
  if (status === 'Cancelled') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

const formatCurrency = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return 'N/A';
  return `Rs ${numericValue.toLocaleString('en-IN')}`;
};

const resolveLockedPricing = (booking) => {
  const snapshot = booking?.pricingSnapshot || {};

  const rentAmount =
    snapshot.rentAmount ??
    booking?.rentAmount ??
    booking?.monthlyRent ??
    booking?.rent;

  const securityDeposit =
    snapshot.securityDeposit ??
    booking?.securityDeposit ??
    booking?.deposit;

  const variantLabel =
    snapshot.variantLabel ??
    booking?.variantLabel ??
    booking?.roomVariantLabel ??
    booking?.roomType;

  return {
    rentAmount,
    securityDeposit,
    variantLabel
  };
};

const AgreementPreviewModal = ({ booking, onClose }) => {
  const lockedPricing = useMemo(() => resolveLockedPricing(booking), [booking]);

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agreement Preview</h2>
            <p className="text-sm text-gray-600">Locked pricing snapshot from booking record</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-gray-500">Booking ID</p>
            <p className="text-sm font-medium text-gray-900">{booking.bookingId || booking._id}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Tenant</p>
            <p className="text-sm font-medium text-gray-900">{booking.tenantName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">PG</p>
            <p className="text-sm font-medium text-gray-900">{booking.pgName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Variant Label</p>
            <p className="text-sm font-medium text-gray-900">{lockedPricing.variantLabel || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Rent Amount (Locked)</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(lockedPricing.rentAmount)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Security Deposit (Locked)</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(lockedPricing.securityDeposit)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Check-In</p>
            <p className="text-sm font-medium text-gray-900">{booking.checkInDate || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Check-Out</p>
            <p className="text-sm font-medium text-gray-900">{booking.checkOutDate || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, statusBreakdown: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async (searchValue = search, statusValue = status) => {
    try {
      setLoading(true);
      const response = await easyPGBookingsAPI.getBookings({
        page: 1,
        limit: 100,
        search: searchValue,
        status: statusValue
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  const fetchStats = async () => {
    try {
      const response = await easyPGBookingsAPI.getBookingStats();
      setStats(response.data || { totalBookings: 0, statusBreakdown: {} });
    } catch (error) {
      console.error('Failed to fetch booking stats', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [fetchBookings]);

  const handleStatusUpdate = async (booking, nextStatus) => {
    if (booking.status === nextStatus) return;
    try {
      setUpdatingId(booking._id);
      await easyPGBookingsAPI.updateBooking(booking._id, { status: nextStatus });
      await Promise.all([fetchBookings(), fetchStats()]);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update booking');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600">Confirm or cancel bookings from EasyPG Manager</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-semibold">{stats.totalBookings || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-semibold text-yellow-700">{stats.statusBreakdown?.pending || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-semibold text-green-700">{stats.statusBreakdown?.confirmed || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-semibold text-red-700">{stats.statusBreakdown?.cancelled || 0}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search bookingId, PG, tenant..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 md:w-auto"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => fetchBookings(search, status)}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 md:w-auto"
          >
            Apply
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <PageLoader message="Loading bookings..." className="py-2" />
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No bookings found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Booking ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">PG</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Variant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Seats</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Check-In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Check-Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {bookings.map((booking) => {
                  const lockedPricing = resolveLockedPricing(booking);

                  return (
                    <tr key={booking._id}>
                      <td className="px-4 py-3 text-sm">{booking.bookingId}</td>
                      <td className="px-4 py-3 text-sm">{booking.pgName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{booking.tenantName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{lockedPricing.variantLabel || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{booking.seatsBooked ?? '-'}</td>
                      <td className="px-4 py-3 text-sm">{booking.checkInDate || '-'}</td>
                      <td className="px-4 py-3 text-sm">{booking.checkOutDate || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(booking.status)}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Preview
                          </button>
                          <select
                            value={booking.status || 'Pending'}
                            disabled={updatingId === booking._id}
                            onChange={(event) => handleStatusUpdate(booking, event.target.value)}
                            className="rounded-md border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedBooking ? (
        <AgreementPreviewModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      ) : null}
    </div>
  );
};

export default Bookings;
