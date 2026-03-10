import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { Users, UserCheck, Building, MessageSquare, FileCheck, TrendingUp } from 'lucide-react';
import PageLoader from '../components/PageLoader';

const StatCard = ({ title, value, icon: Icon, tone }) => (
  <div className="epg-card p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className={`rounded-2xl p-3 ${tone}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

const statusBadgeClass = (status) => {
  if (status === 'pending') return 'bg-amber-50 text-amber-700';
  if (status === 'in-progress') return 'bg-blue-50 text-blue-700';
  if (status === 'resolved' || status === 'active') return 'bg-emerald-50 text-emerald-700';
  if (status === 'expired') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentAgreements, setRecentAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getStats();
        const { dashboardStats, recentComplaints: complaintData, recentAgreements: agreementData } = response.data;
        setStats(dashboardStats);
        setRecentComplaints(complaintData);
        setRecentAgreements(agreementData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <PageLoader message="Loading dashboard..." className="min-h-[70vh]" />;
  }

  return (
    <div className="space-y-6">
      <section className="epg-card overflow-hidden">
        <div className="relative px-6 py-6 sm:px-8 sm:py-8">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl" />
          <div className="absolute bottom-0 right-16 h-16 w-16 rounded-full bg-blue-300/20 blur-2xl" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Monitor platform growth, complaint flow, and agreements from one place.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} tone="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatCard title="Total Owners" value={stats?.totalOwners || 0} icon={UserCheck} tone="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard title="Total PGs" value={stats?.totalPGs || 0} icon={Building} tone="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard title="Total Complaints" value={stats?.totalComplaints || 0} icon={MessageSquare} tone="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatCard title="Pending Complaints" value={stats?.pendingComplaints || 0} icon={TrendingUp} tone="bg-gradient-to-br from-rose-500 to-rose-700" />
        <StatCard title="Active Agreements" value={stats?.activeAgreements || 0} icon={FileCheck} tone="bg-gradient-to-br from-cyan-500 to-cyan-700" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="epg-card">
          <div className="epg-card-header">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Recent Complaints</h2>
          </div>
          <div className="p-5">
            {recentComplaints.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-slate-500">No recent complaints</p>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <div key={complaint._id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-slate-50/60 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{complaint.title}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {(complaint.pgId?.name || 'Unknown PG')} | {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusBadgeClass(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="epg-card">
          <div className="epg-card-header">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Recent Agreements</h2>
          </div>
          <div className="p-5">
            {recentAgreements.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-slate-500">No recent agreements</p>
            ) : (
              <div className="space-y-3">
                {recentAgreements.map((agreement) => (
                  <div key={agreement._id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-slate-50/60 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{agreement.agreementNumber}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {(agreement.tenantName || 'Unknown Tenant')} | {(agreement.pg?.name || 'Unknown PG')}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusBadgeClass(agreement.status)}`}>
                      {agreement.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
