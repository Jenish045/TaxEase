import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReportsPage.css';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ⭐ SAFE NUMBER CONVERSION
  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchInvoices(parsedUser._id);
    }
  }, []);

  const fetchInvoices = async (userId) => {
    try {
      console.log('🔍 Fetching invoices for reports...');
      const response = await fetch(`${API_URL}/invoices/list/${userId}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        console.log('📊 INVOICES FETCHED:', data.data.length);
        console.log('📊 RAW INVOICES:', data.data);
        
        // ⭐ CALCULATE STATS IMMEDIATELY AFTER FETCHING
        calculateAndSetStats(data.data);
        calculateAndSetMonthlySummary(data.data);
        setInvoices(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAndSetStats = (invoiceList) => {
    console.log('📊 CALCULATING STATS FROM:', invoiceList.length, 'invoices');

    const totalInvoices = invoiceList.length;

    const totalAmount = invoiceList.reduce((sum, inv) => {
      const amount = safeNumber(inv.grandTotal);
      console.log('💰 Invoice:', inv.invoiceNumber, 'grandTotal:', inv.grandTotal, 'Safe:', amount);
      return sum + amount;
    }, 0);

    const paidAmount = invoiceList
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + safeNumber(inv.grandTotal), 0);

    const pendingAmount = totalAmount - paidAmount;

    const totalTax = invoiceList.reduce((sum, inv) => {
      const sgst = safeNumber(inv.sgstAmount);
      const cgst = safeNumber(inv.cgstAmount);
      const igst = safeNumber(inv.igstAmount);
      const tax = sgst + cgst + igst;
      console.log('🔢 Invoice:', inv.invoiceNumber, 'Tax Breakdown - SGST:', sgst, 'CGST:', cgst, 'IGST:', igst, 'Total:', tax);
      return sum + tax;
    }, 0);

    const calculatedStats = {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      totalTax
    };

    console.log('✅ FINAL CALCULATED STATS:', calculatedStats);
    setStats(calculatedStats);
  };

  const calculateAndSetMonthlySummary = (invoiceList) => {
    const summary = {};
    
    invoiceList.forEach(invoice => {
      if (!invoice.invoiceDate) return;

      const date = new Date(invoice.invoiceDate);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!summary[monthYear]) {
        summary[monthYear] = { count: 0, amount: 0, tax: 0 };
      }

      summary[monthYear].count++;
      summary[monthYear].amount += safeNumber(invoice.grandTotal);

      const tax = safeNumber(invoice.sgstAmount) + safeNumber(invoice.cgstAmount) + safeNumber(invoice.igstAmount);
      summary[monthYear].tax += tax;
    });

    const sorted = Object.entries(summary).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    console.log('📅 MONTHLY SUMMARY:', sorted);
    setMonthlySummary(sorted);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (!stats) {
    return <div className="loading">Calculating reports...</div>;
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
              <p className="stat-value">₹{safeNumber(stats.totalAmount).toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Paid Amount</h3>
              <p className="stat-value">₹{safeNumber(stats.paidAmount).toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending Amount</h3>
              <p className="stat-value">₹{safeNumber(stats.pendingAmount).toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Total Tax</h3>
              <p className="stat-value">₹{safeNumber(stats.totalTax).toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <div className="stat-info">
              <h3>Tax %</h3>
              <p className="stat-value">
                {safeNumber(stats.totalAmount) > 0 ? ((safeNumber(stats.totalTax) / safeNumber(stats.totalAmount)) * 100).toFixed(1) : 0}%
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
                  <div className="col-amount">₹{safeNumber(data.amount).toFixed(2)}</div>
                  <div className="col-tax">₹{safeNumber(data.tax).toFixed(2)}</div>
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
              <p className="status-count">{invoices.filter(i => (i.status || 'draft').toLowerCase() === 'draft').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge sent">Sent</div>
              <p className="status-count">{invoices.filter(i => (i.status || '').toLowerCase() === 'sent').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge paid">Paid</div>
              <p className="status-count">{invoices.filter(i => (i.status || '').toLowerCase() === 'paid').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge overdue">Overdue</div>
              <p className="status-count">{invoices.filter(i => (i.status || '').toLowerCase() === 'overdue').length}</p>
              <p className="status-label">Invoices</p>
            </div>

            <div className="status-card">
              <div className="status-badge cancelled">Cancelled</div>
              <p className="status-count">{invoices.filter(i => (i.status || '').toLowerCase() === 'cancelled').length}</p>
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