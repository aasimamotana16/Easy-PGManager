import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { easyPGUsersAPI, easyPGPGsAPI, easyPGBookingsAPI, easyPGPaymentsAPI, easyPGAgreementsAPI, easyPGSupportTicketsAPI, easyPGTenantsAPI } from '../services/api';
import {
  Users,
  Building,
  Calendar,
  CreditCard,
  FileCheck,
  MessageSquare,
  Printer
} from 'lucide-react';
import PageLoader from '../components/PageLoader';

const toMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getMonthLabel = (monthKey) => {
  const [year, month] = String(monthKey || '').split('-');
  if (!year || !month) return 'Selected Month';
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric'
  });
};

const parseTenantMonthKey = (tenant) => {
  const tryDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return toMonthKey(parsed);
  };

  const joinKey = tryDate(tenant?.joiningDate);
  if (joinKey) return joinKey;

  const rawJoining = String(tenant?.joiningDate || '').trim();
  const dmyMatch = rawJoining.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]) - 1;
    const year = Number(dmyMatch[3]);
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) return toMonthKey(parsed);
  }

  return tryDate(tenant?.createdAt);
};

const parseMonthFromFields = (record, fields = []) => {
  for (const field of fields) {
    const value = record?.[field];
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return toMonthKey(parsed);
  }
  return null;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const hasValue = (value) => String(value ?? '').trim().length > 0;

const normalizeTenantStatusForReport = (status) => {
  const raw = String(status || '').trim();
  if (!raw) return '';

  const normalized = raw.toLowerCase();
  if (normalized === 'pending arrival') return 'Arrival Confirmed';
  if (normalized === 'pending') return 'Confirmed';

  return raw;
};

const getFilledTenantReportRow = (tenant) => {
  const row = {
    name: tenant.name || tenant.userId?.fullName || '',
    email: tenant.email || tenant.userId?.email || '',
    phone: tenant.phone || tenant.userId?.phone || '',
    pgName: tenant.pgName || tenant.pgRefId?.pgName || '',
    room: tenant.room || '',
    joiningDate: tenant.joiningDate || '',
    status: normalizeTenantStatusForReport(tenant.status)
  };

  const isComplete =
    hasValue(row.name) &&
    hasValue(row.email) &&
    hasValue(row.phone) &&
    hasValue(row.pgName) &&
    hasValue(row.room) &&
    hasValue(row.joiningDate) &&
    hasValue(row.status);

  return isComplete ? row : null;
};

const getFilledPGReportRow = (pg) => {
  const row = {
    pgName: pg.pgName || '',
    ownerName: pg.ownerId?.fullName || '',
    city: pg.city || '',
    location: pg.location || '',
    status: pg.status || '',
    createdAt: pg.createdAt || ''
  };

  const isComplete =
    hasValue(row.pgName) &&
    hasValue(row.ownerName) &&
    hasValue(row.city) &&
    hasValue(row.location) &&
    hasValue(row.status) &&
    hasValue(row.createdAt);

  return isComplete ? row : null;
};

const getFilledBookingReportRow = (booking) => {
  const row = {
    bookingId: booking.bookingId || '',
    tenantName: booking.tenantName || booking.tenantUserId?.fullName || '',
    pgName: booking.pgName || booking.pgId?.pgName || '',
    roomType: booking.roomType || '',
    checkInDate: booking.checkInDate || '',
    status: booking.status || '',
    paymentStatus: booking.paymentStatus || ''
  };

  const isComplete =
    hasValue(row.bookingId) &&
    hasValue(row.tenantName) &&
    hasValue(row.pgName) &&
    hasValue(row.roomType) &&
    hasValue(row.checkInDate) &&
    hasValue(row.status) &&
    hasValue(row.paymentStatus);

  return isComplete ? row : null;
};

const getFilledPaymentReportRow = (payment) => {
  const amount = Number(payment.amountPaid);
  const row = {
    transactionId: payment.transactionId || '',
    tenantName: payment.tenantName || payment.user?.fullName || '',
    pgName: payment.pgName || payment.pgId?.pgName || '',
    amount,
    paymentDate: payment.paymentDate || '',
    method: payment.paymentMethod || '',
    status: payment.paymentStatus || ''
  };

  const isComplete =
    hasValue(row.transactionId) &&
    hasValue(row.tenantName) &&
    hasValue(row.pgName) &&
    Number.isFinite(row.amount) &&
    hasValue(row.paymentDate) &&
    hasValue(row.method) &&
    hasValue(row.status);

  return isComplete ? row : null;
};

const EasyPGDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: { total: 0, roleBreakdown: {} },
    pgs: { total: 0, statusBreakdown: {} },
    bookings: { total: 0, statusBreakdown: {} },
    payments: { total: 0, totalRevenue: 0 },
    agreements: { total: 0, signedBreakdown: {} },
    supportTickets: { total: 0, statusBreakdown: {} }
  });
  const [loading, setLoading] = useState(true);
  const [reportMonth, setReportMonth] = useState(toMonthKey(new Date()));
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReportHtml, setGeneratedReportHtml] = useState('');
  const [generatedReportMonth, setGeneratedReportMonth] = useState('');

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [
        userStats,
        pgStats,
        bookingStats,
        paymentStats,
        agreementStats,
        ticketStats
      ] = await Promise.all([
        easyPGUsersAPI.getUserStats(),
        easyPGPGsAPI.getPGStats(),
        easyPGBookingsAPI.getBookingStats(),
        easyPGPaymentsAPI.getPaymentStats(),
        easyPGAgreementsAPI.getAgreementStats(),
        easyPGSupportTicketsAPI.getSupportTicketStats()
      ]);

      setStats({
        users: userStats.data,
        pgs: pgStats.data,
        bookings: bookingStats.data,
        payments: paymentStats.data,
        agreements: agreementStats.data,
        supportTickets: ticketStats.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPages = async (fetchPage, listKey) => {
    let allItems = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const response = await fetchPage(currentPage);
      const payload = response?.data || {};
      allItems = allItems.concat(payload[listKey] || []);
      totalPages = Number(payload.pagination?.total || 1);
      currentPage += 1;
    }

    return allItems;
  };

  const handleGenerateMonthlyReport = async () => {
    try {
      setIsGeneratingReport(true);
      const [tenants, pgs, bookings, payments] = await Promise.all([
        fetchAllPages((page) => easyPGTenantsAPI.getTenants({ page, limit: 200 }), 'tenants'),
        fetchAllPages((page) => easyPGPGsAPI.getPGs({ page, limit: 200 }), 'pgs'),
        fetchAllPages((page) => easyPGBookingsAPI.getBookings({ page, limit: 200 }), 'bookings'),
        fetchAllPages((page) => easyPGPaymentsAPI.getPayments({ page, limit: 200 }), 'payments')
      ]);
      const monthLabel = getMonthLabel(reportMonth);

      const monthTenants = tenants.filter((tenant) => parseTenantMonthKey(tenant) === reportMonth);
      const completeTenants = monthTenants
        .map((tenant) => ({ source: tenant, reportRow: getFilledTenantReportRow(tenant) }))
        .filter((tenant) => Boolean(tenant.reportRow));

      const monthPGs = pgs.filter((pg) => parseMonthFromFields(pg, ['createdAt']) === reportMonth);
      const completePGs = monthPGs
        .map((pg) => ({ source: pg, reportRow: getFilledPGReportRow(pg) }))
        .filter((pg) => Boolean(pg.reportRow));

      const monthBookings = bookings.filter(
        (booking) => parseMonthFromFields(booking, ['createdAt', 'checkInDate']) === reportMonth
      );
      const completeBookings = monthBookings
        .map((booking) => ({ source: booking, reportRow: getFilledBookingReportRow(booking) }))
        .filter((booking) => Boolean(booking.reportRow));

      const uniqueBookings = [];
      const bookingKeys = new Set();
      for (const booking of completeBookings) {
        const row = booking.reportRow;
        const dedupeKey = [
          String(row.tenantName || '').trim().toLowerCase(),
          String(row.pgName || '').trim().toLowerCase(),
          String(row.checkInDate || '').trim()
        ].join('|');

        if (bookingKeys.has(dedupeKey)) continue;
        bookingKeys.add(dedupeKey);
        uniqueBookings.push(booking);
      }

      const monthPayments = payments.filter(
        (payment) => parseMonthFromFields(payment, ['paymentDate', 'createdAt']) === reportMonth
      );
      const completePayments = monthPayments
        .map((payment) => ({ source: payment, reportRow: getFilledPaymentReportRow(payment) }))
        .filter((payment) => Boolean(payment.reportRow));

      const uniquePayments = [];
      const paymentKeys = new Set();
      for (const payment of completePayments) {
        const row = payment.reportRow;
        const dedupeKey = [
          String(row.tenantName || '').trim().toLowerCase(),
          String(row.pgName || '').trim().toLowerCase(),
          reportMonth
        ].join('|');

        if (paymentKeys.has(dedupeKey)) continue;
        paymentKeys.add(dedupeKey);
        uniquePayments.push(payment);
      }

      const rows = completeTenants
        .map((tenant, index) => {
          const row = tenant.reportRow;
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(row.name)}</td>
              <td>${escapeHtml(row.email)}</td>
              <td>${escapeHtml(row.phone)}</td>
              <td>${escapeHtml(row.pgName)}</td>
              <td>${escapeHtml(row.room)}</td>
              <td>${escapeHtml(row.joiningDate)}</td>
              <td>${escapeHtml(row.status)}</td>
            </tr>
          `;
        })
        .join('');

      const pgRows = completePGs
        .map((pg, index) => {
          const row = pg.reportRow;
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(row.pgName)}</td>
              <td>${escapeHtml(row.ownerName)}</td>
              <td>${escapeHtml(row.city)}</td>
              <td>${escapeHtml(row.location)}</td>
              <td>${escapeHtml(row.status)}</td>
            </tr>
          `;
        })
        .join('');

      const bookingRows = uniqueBookings
        .map((booking, index) => {
          const row = booking.reportRow;
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(row.bookingId)}</td>
              <td>${escapeHtml(row.tenantName)}</td>
              <td>${escapeHtml(row.pgName)}</td>
              <td>${escapeHtml(row.roomType)}</td>
              <td>${escapeHtml(row.checkInDate)}</td>
              <td>${escapeHtml(row.status)}</td>
              <td>${escapeHtml(row.paymentStatus)}</td>
            </tr>
          `;
        })
        .join('');

      const paymentRows = uniquePayments
        .map((payment, index) => {
          const row = payment.reportRow;
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(row.transactionId)}</td>
              <td>${escapeHtml(row.tenantName)}</td>
              <td>${escapeHtml(row.pgName)}</td>
              <td>${escapeHtml(`\u20B9${row.amount.toLocaleString()}`)}</td>
              <td>${escapeHtml(new Date(row.paymentDate).toLocaleDateString())}</td>
              <td>${escapeHtml(row.method)}</td>
              <td>${escapeHtml(row.status)}</td>
            </tr>
          `;
        })
        .join('');

      const reportHtml = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Tenant Monthly Report - ${escapeHtml(monthLabel)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #111827; }
              h1 { margin: 0 0 4px 0; font-size: 22px; }
              .sub { margin: 0 0 16px 0; color: #6b7280; font-size: 13px; }
              .meta { margin-bottom: 12px; font-size: 13px; }
              .summary { display: flex; gap: 12px; margin-bottom: 16px; }
              .card { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 10px; min-width: 130px; }
              .label { color: #6b7280; font-size: 12px; }
              .value { font-size: 18px; font-weight: 700; margin-top: 3px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #d1d5db; padding: 7px; text-align: left; }
              th { background: #f3f4f6; }
              .empty { margin-top: 12px; padding: 10px; border: 1px dashed #9ca3af; color: #6b7280; }
              .section-title { margin: 22px 0 8px 0; font-size: 16px; font-weight: 700; }
            </style>
          </head>
          <body>
            <h1>EasyPG Admin - Tenant Monthly Report</h1>
            <p class="sub">${escapeHtml(monthLabel)}</p>
            <div class="meta">Generated on: ${escapeHtml(new Date().toLocaleString())}</div>
            <div class="summary">
              <div class="card"><div class="label">Total Tenants</div><div class="value">${completeTenants.length}</div></div>
              <div class="card"><div class="label">Total PGs</div><div class="value">${completePGs.length}</div></div>
              <div class="card"><div class="label">Total Bookings</div><div class="value">${uniqueBookings.length}</div></div>
              <div class="card"><div class="label">Total Payments</div><div class="value">${uniquePayments.length}</div></div>
            </div>
            <p class="section-title">Tenants</p>
            ${
              completeTenants.length === 0
                ? `<div class="empty">No fully filled tenant records found for ${escapeHtml(monthLabel)}.</div>`
                : `<table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>PG</th>
                        <th>Room</th>
                        <th>Joining Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                  </table>`
            }
            <p class="section-title">PGs</p>
            ${
              completePGs.length === 0
                ? `<div class="empty">No fully filled PG records found for ${escapeHtml(monthLabel)}.</div>`
                : `<table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>PG Name</th>
                        <th>Owner</th>
                        <th>City</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>${pgRows}</tbody>
                  </table>`
            }
            <p class="section-title">Bookings</p>
            ${
              uniqueBookings.length === 0
                ? `<div class="empty">No fully filled booking records found for ${escapeHtml(monthLabel)}.</div>`
                : `<table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Booking ID</th>
                        <th>Tenant</th>
                        <th>PG</th>
                        <th>Room</th>
                        <th>Check-In</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>${bookingRows}</tbody>
                  </table>`
            }
            <p class="section-title">Payments</p>
            ${
              uniquePayments.length === 0
                ? `<div class="empty">No fully filled payment records found for ${escapeHtml(monthLabel)}.</div>`
                : `<table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Transaction ID</th>
                        <th>Tenant</th>
                        <th>PG</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>${paymentRows}</tbody>
                  </table>`
            }
          </body>
        </html>
      `;

      setGeneratedReportHtml(reportHtml);
      setGeneratedReportMonth(reportMonth);
    } catch (error) {
      console.error('Failed to generate monthly tenant report:', error);
      alert(error.response?.data?.message || 'Failed to generate monthly report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePrintGeneratedReport = () => {
    if (!generatedReportHtml || generatedReportMonth !== reportMonth) {
      alert('Please generate the report first for the selected month.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      alert('Please allow popups to print the report.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(generatedReportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return <PageLoader message="Loading EasyPG Dashboard..." className="min-h-[60vh]" />;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">EasyPG Manager Dashboard</h1>
            <p className="text-gray-600">Complete overview of your PG management system</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleGenerateMonthlyReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Printer className="h-4 w-4" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </button>
            <button
              type="button"
              onClick={handlePrintGeneratedReport}
              disabled={!generatedReportHtml || generatedReportMonth !== reportMonth || isGeneratingReport}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Users Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Users:</span>
              <span className="font-medium">{stats.users.roleBreakdown.users || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Owners:</span>
              <span className="font-medium">{stats.users.roleBreakdown.owners || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Admins:</span>
              <span className="font-medium">{stats.users.roleBreakdown.admins || 0}</span>
            </div>
          </div>
        </div>

        {/* PGs Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Building className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total PGs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pgs.totalPGs}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Live:</span>
              <span className="font-medium text-green-600">{stats.pgs.statusBreakdown.live || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats.pgs.statusBreakdown.pending || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Draft:</span>
              <span className="font-medium text-gray-600">{stats.pgs.statusBreakdown.draft || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Closed:</span>
              <span className="font-medium text-red-600">{stats.pgs.statusBreakdown.closed || 0}</span>
            </div>
          </div>
        </div>

        {/* Bookings Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bookings.totalBookings}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Confirmed:</span>
              <span className="font-medium text-green-600">{stats.bookings.statusBreakdown.confirmed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats.bookings.statusBreakdown.pending || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cancelled:</span>
              <span className="font-medium text-red-600">{stats.bookings.statusBreakdown.cancelled || 0}</span>
            </div>
          </div>
        </div>

        {/* Payments Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <CreditCard className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.payments.totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Payments:</span>
              <span className="font-medium">{stats.payments.totalPayments || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Success:</span>
              <span className="font-medium text-green-600">{stats.payments.statusBreakdown.success || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats.payments.statusBreakdown.pending || 0}</span>
            </div>
          </div>
        </div>

        {/* Agreements Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <FileCheck className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agreements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.agreements.totalAgreements}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Signed:</span>
              <span className="font-medium text-green-600">{stats.agreements.signedBreakdown.signed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unsigned:</span>
              <span className="font-medium text-yellow-600">{stats.agreements.signedBreakdown.unsigned || 0}</span>
            </div>
          </div>
        </div>

        {/* Support Tickets Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Support Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.supportTickets.totalTickets}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Open:</span>
              <span className="font-medium text-red-600">{stats.supportTickets.statusBreakdown.open || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-medium text-yellow-600">{stats.supportTickets.statusBreakdown.inProgress || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Closed:</span>
              <span className="font-medium text-green-600">{stats.supportTickets.statusBreakdown.closed || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => navigate('/users')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button
            onClick={() => navigate('/pgs')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Building className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Manage PGs</span>
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Calendar className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Bookings</span>
          </button>
          <button
            onClick={() => navigate('/payments')}
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <CreditCard className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Payments</span>
          </button>
          <button
            onClick={() => navigate('/agreements')}
            className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <FileCheck className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Manage Agreements</span>
          </button>
          <button
            onClick={() => navigate('/complaints')}
            className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Support Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EasyPGDashboard;
