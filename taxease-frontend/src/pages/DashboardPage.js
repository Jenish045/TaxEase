import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    taxFiled: 0,
    status: 'Active'
  });
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async (userId) => {
    try {
      if (!userId || userId === 'undefined') {
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/invoices/list/${userId}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data)) {
        const recentInvoices = data.data.slice(0, 5);
        setInvoices(recentInvoices);

        let totalAmount = 0;
        data.data.forEach((invoice) => {
          totalAmount += parseFloat(invoice.grandTotal) || 0;
        });

        setStats({
          totalInvoices: data.data.length,
          totalAmount: totalAmount.toFixed(2),
          taxFiled: 0,
          status: 'Active'
        });
      } else {
        setStats({ totalInvoices: 0, totalAmount: '0', taxFiled: 0, status: 'Active' });
      }
    } catch (error) {
      setStats({ totalInvoices: 0, totalAmount: '0', taxFiled: 0, status: 'Active' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        const userId = parsedUser._id || parsedUser.id;
        if (userId) {
          fetchInvoices(userId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">💼</span>
            <span className="logo-text">TaxEase</span>
          </div>

          <nav className="nav-menu">
            <button className="nav-item active" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-item" onClick={() => navigate('/invoices')}>Invoices</button>
            <button className="nav-item" onClick={() => navigate('/reports')}>Reports</button>
            <button className="nav-item" onClick={() => navigate('/settings')}>Settings</button>
          </nav>

          <div className="user-section">
            <span className="user-name">👤 {user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h1>Welcome Back, {user?.firstName}! 👋</h1>
          <p>Manage your invoices and taxes efficiently</p>
        </section>

        {/* Stats */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-info">
              <h3>TOTAL INVOICES</h3>
              <p className="stat-value">{stats.totalInvoices}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>TOTAL AMOUNT</h3>
              <p className="stat-value">₹{stats.totalAmount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>TAX FILED</h3>
              <p className="stat-value">{stats.taxFiled}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>STATUS</h3>
              <p className="stat-value">{stats.status}</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => navigate('/create-invoice')}>
              ➕ Create Invoice
            </button>
            <button className="action-btn" onClick={() => navigate('/invoices')}>
              📁 View Invoices
            </button>
            <button className="action-btn" onClick={() => navigate('/reports')}>
              📊 Generate Report
            </button>
            <button className="action-btn" onClick={() => navigate('/settings')}>
              ⚙️ Settings
            </button>
          </div>
        </section>

        {/* Recent Invoices */}
        <section className="recent-invoices">
          <h2>Recent Invoices</h2>
          {invoices.length > 0 ? (
            <div className="invoice-list">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td>{invoice.invoiceNumber || 'N/A'}</td>
                      <td>{invoice.clientName || 'N/A'}</td>
                      <td>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</td>
                      <td>₹{(invoice.grandTotal || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${(invoice.status || 'Draft').toLowerCase()}`}>
                          {invoice.status || 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="invoice-list">
              <div className="empty-state">
                <p>No invoices yet. Create your first invoice to get started!</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2026 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}