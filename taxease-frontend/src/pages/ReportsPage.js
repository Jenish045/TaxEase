import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReportsPage.css';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('monthly');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchInvoices(JSON.parse(userData)._id);
    }
  }, []);

  const fetchInvoices = async (userId) => {
    try {
      console.log('🔍 Fetching invoices for reports...');
      const response = await fetch(`${API_URL}/invoices/list/${userId}`);
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const calculateStats = () => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingAmount = totalAmount - paidAmount;
    const totalTax = invoices.reduce((sum, inv) => sum + inv.totalTax, 0);

    return { totalInvoices, totalAmount, paidAmount, pendingAmount, totalTax };
  };

  const getMonthlySummary = () => {
    const summary = {};
    invoices.forEach(invoice => {
      const date = new Date(invoice.invoiceDate);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      if (!summary[monthYear]) {
        summary[monthYear] = { count: 0, amount: 0, tax: 0 };
      }
      summary[monthYear].count++;
      summary[monthYear].amount += invoice.totalAmount;
      summary[monthYear].tax += invoice.totalTax;
    });
    return Object.entries(summary);
  };

  const stats = calculateStats();
  const monthlySummary = getMonthlySummary();

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">💼</span>
            <span className="logo-text">TaxEase</span>
          </div>

          <nav className="nav-menu">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-item" onClick={() => navigate('/invoices')}>Invoices</button>
            <button className="nav-item active">Reports</button>
            <button className="nav-item" onClick={() => navigate('/settings')}>Settings</button>
          </nav>

          <div className="user-section">
            <span className="user-name">👤 {user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="reports-content">
        <div className="page-header">
          <h1>Reports & Analytics</h1>
          <p>View detailed reports and analytics of your invoices</p>
        </div>

        {/* Stats Overview */}
        <section className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Total Invoices</h3>
              <p className="stat-value">{stats.totalInvoices}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-value">₹{stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Paid Amount</h3>
              <p className="stat-value">₹{stats.paidAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending Amount</h3>
              <p className="stat-value">₹{stats.pendingAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Total Tax</h3>
              <p className="stat-value">₹{stats.totalTax.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <div className="stat-info">
              <h3>Tax %</h3>
              <p className="stat-value">
                {stats.totalAmount > 0 ? ((stats.totalTax / stats.totalAmount) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </section>

        {/* Monthly Summary */}
        <section className="reports-section">
          <h2>Monthly Summary</h2>
          
          {monthlySummary.length === 0 ? (
            <div className="empty-state">
              <p>No data available yet. Create some invoices to see reports.</p>
            </div>
          ) : (
            <div className="monthly-table">
              <div className="table-header">
                <div className="col-month">Month</div>
                <div className="col-count">Invoices</div>
                <div className="col-amount">Amount</div>
                <div className="col-tax">Tax</div>
              </div>

              {monthlySummary.map(([month, data]) => (
                <div key={month} className="table-row">
                  <div className="col-month">{month}</div>
                  <div className="col-count">{data.count}</div>
                  <div className="col-amount">₹{data.amount.toFixed(2)}</div>
                  <div className="col-tax">₹{data.tax.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Status Distribution */}
        <section className="reports-section">
          <h2>Invoice Status Distribution</h2>
          
          <div className="status-grid">
            <div className="status-card">
              <div className="status-badge draft">Draft</div>
              <p className="status-count">{invoices.filter(i => i.status === 'draft').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge sent">Sent</div>
              <p className="status-count">{invoices.filter(i => i.status === 'sent').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge paid">Paid</div>
              <p className="status-count">{invoices.filter(i => i.status === 'paid').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge overdue">Overdue</div>
              <p className="status-count">{invoices.filter(i => i.status === 'overdue').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge cancelled">Cancelled</div>
              <p className="status-count">{invoices.filter(i => i.status === 'cancelled').length}</p>
              <p className="status-label">Invoices</p>
            </div>
          </div>
        </section>

        {/* Export Options */}
        <section className="reports-section export-section">
          <h2>Export Reports</h2>
          
          <div className="export-buttons">
            <button className="export-btn">
              📄 Export as PDF
            </button>
            <button className="export-btn">
              📊 Export as Excel
            </button>
            <button className="export-btn">
              📋 Export as CSV
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2026 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}