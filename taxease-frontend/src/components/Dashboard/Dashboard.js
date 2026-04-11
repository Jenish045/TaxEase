import React from 'react';
import { useApi } from '../../hooks/useApi';
import { userService } from '../../services/userService';
import StatisticsCard from './StatisticsCard';
import RecentInvoices from './RecentInvoices';
import Loading from '../Common/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const { data: statsData, isLoading, error } = useApi(
    () => userService.getStatistics(),
    []
  );

  if (isLoading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  const statistics = statsData?.data?.statistics || {};

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your financial overview.</p>
      </div>

      <div className="statistics-grid">
        <StatisticsCard
          title="Total Invoices"
          value={statistics.totalInvoices || 0}
          icon="📄"
          color="blue"
        />
        <StatisticsCard
          title="Pending Invoices"
          value={statistics.pendingInvoices || 0}
          icon="⏳"
          color="yellow"
        />
        <StatisticsCard
          title="Flagged for Review"
          value={statistics.flaggedInvoices || 0}
          icon="⚠️"
          color="red"
        />
        <StatisticsCard
          title="Total Amount"
          value={`₹${(statistics.totalAmount || 0).toLocaleString('en-IN')}`}
          icon="💸"
          color="green"
        />
      </div>

      <RecentInvoices />
    </div>
  );
};

export default Dashboard;