import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InvoicesPage.css';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    console.log('🔄 USEEFFECT RUNNING');
    
    const userData = localStorage.getItem('user');
    console.log('📦 RAW USER DATA FROM STORAGE:', userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('👤 PARSED USER OBJECT:', parsedUser);
        console.log('🔑 AVAILABLE KEYS:', Object.keys(parsedUser));
        console.log('🆔 user._id:', parsedUser._id);
        console.log('���� user.id:', parsedUser.id);
        
        setUser(parsedUser);
        
        const userIdToUse = parsedUser._id || parsedUser.id;
        console.log('✅ USERID TO USE:', userIdToUse);
        
        if (userIdToUse) {
          fetchInvoices(userIdToUse);
        } else {
          console.error('❌ NO VALID USER ID FOUND!');
        }
      } catch (error) {
        console.error('❌ ERROR PARSING USER:', error);
      }
    } else {
      console.error('❌ NO USER DATA IN STORAGE!');
    }
  }, []);
  const fetchInvoices = async (userId) => {
    try {
      console.log('🔍 FETCH INVOICES CALLED WITH userId:', userId);
      console.log('🔍 TYPE OF userId:', typeof userId);
      
      if (!userId || userId === 'undefined') {
        console.error('❌ USERID IS INVALID:', userId);
        return;
      }

      const url = `${API_URL}/invoices/list/${userId}`;
      console.log('🔗 FETCHING FROM URL:', url);

      const response = await fetch(url);
      console.log('📊 RESPONSE STATUS:', response.status);
      console.log('📊 RESPONSE OK:', response.ok);

      const text = await response.text();
      console.log('📝 RAW RESPONSE:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON PARSE ERROR:', parseError);
        console.error('❌ TRIED TO PARSE:', text);
        return;
      }

      console.log('✅ PARSED DATA:', data);

      if (data.success) {
        console.log('✅ Invoices fetched:', data.count);
        setInvoices(data.data);
      } else {
        console.error('❌ API ERROR:', data.message);
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

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting invoice:', invoiceId);
      const response = await fetch(`${API_URL}/invoices/delete/${invoiceId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        console.log('✅ Invoice deleted');
        setInvoices(invoices.filter(inv => inv._id !== invoiceId));
      }
    } catch (error) {
      console.error('❌ Error deleting invoice:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: 'badge-draft',
      sent: 'badge-sent',
      paid: 'badge-paid',
      overdue: 'badge-overdue',
      cancelled: 'badge-cancelled'
    };
    return statusMap[status] || 'badge-draft';
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  if (loading) {
    return <div className="loading">Loading invoices...</div>;
  }

  return (
    <div className="invoices-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">💼</span>
            <span className="logo-text">TaxEase</span>
          </div>

          <nav className="nav-menu">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-item active" onClick={() => navigate('/invoices')}>Invoices</button>
            <button className="nav-item" onClick={() => navigate('/reports')}>Reports</button>
            <button className="nav-item" onClick={() => navigate('/settings')}>Settings</button>
          </nav>

          <div className="user-section">
            <span className="user-name">👤 {user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="invoices-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Invoices</h1>
            <p>Manage all your invoices in one place</p>
          </div>
          <button 
            className="btn-create-invoice"
            onClick={() => navigate('/create-invoice')}
          >
            ➕ Create Invoice
          </button>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({invoices.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Draft ({invoices.filter(i => i.status === 'draft').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'sent' ? 'active' : ''}`}
            onClick={() => setFilter('sent')}
          >
            Sent ({invoices.filter(i => i.status === 'sent').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
            onClick={() => setFilter('paid')}
          >
            Paid ({invoices.filter(i => i.status === 'paid').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue ({invoices.filter(i => i.status === 'overdue').length})
          </button>
        </div>

        {/* Invoices Table/List */}
        <div className="invoices-container">
          {filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <p>📄 No invoices found</p>
              <button 
                className="btn-create-invoice"
                onClick={() => navigate('/create-invoice')}
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <div className="invoices-table">
              <div className="table-header">
                <div className="col-invoice">Invoice</div>
                <div className="col-client">Client</div>
                <div className="col-date">Date</div>
                <div className="col-amount">Amount</div>
                <div className="col-status">Status</div>
                <div className="col-actions">Actions</div>
              </div>

              {filteredInvoices.map(invoice => (
                <div key={invoice._id} className="table-row">
                  <div className="col-invoice">
                    <strong>{invoice.invoiceNumber}</strong>
                  </div>
                  <div className="col-client">{invoice.clientName}</div>
                  <div className="col-date">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </div>
                  <div className="col-amount">
                    ₹{invoice.totalAmount.toFixed(2)}
                  </div>
                  <div className="col-status">
                    <span className={`badge ${getStatusBadge(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button 
                      className="btn-action btn-view"
                      onClick={() => navigate(`/invoice/${invoice._id}`)}
                      title="View Invoice"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => navigate(`/edit-invoice/${invoice._id}`)}
                      title="Edit Invoice"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(invoice._id)}
                      title="Delete Invoice"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        {invoices.length > 0 && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Total Invoices</h3>
                <p className="stat-value">{invoices.length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Amount</h3>
                <p className="stat-value">₹{invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Paid Invoices</h3>
                <p className="stat-value">{invoices.filter(i => i.status === 'paid').length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p className="stat-value">{invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2026 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}