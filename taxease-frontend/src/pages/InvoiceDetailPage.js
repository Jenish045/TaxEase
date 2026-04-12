import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/InvoiceDetailPage.css';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const [user, setUser] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ⭐ SAFE NUMBER CONVERSION
  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // ⭐ SAFE FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchInvoice();
    } else {
      navigate('/login');
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching invoice:', invoiceId);

      const response = await fetch(`${API_URL}/invoices/${invoiceId}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Invoice fetched:', data.data);
        setInvoice(data.data);
        setError('');
      } else {
        setError('Invoice not found');
      }
    } catch (error) {
      console.error('❌ Error fetching invoice:', error);
      setError('Error fetching invoice: ' + error.message);
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('PDF download feature coming soon!');
  };

  const handleSendEmail = () => {
    alert('Email feature coming soon!');
  };

  if (loading) {
    return (
      <div className="invoice-detail-page">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo" onClick={() => navigate('/')}>
              <span className="logo-icon">💼</span>
              <span className="logo-text">TaxEase</span>
            </div>
          </div>
        </header>
        <div className="loading">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-page">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo" onClick={() => navigate('/')}>
              <span className="logo-icon">💼</span>
              <span className="logo-text">TaxEase</span>
            </div>
            <nav className="nav-menu">
              <button className="nav-item" onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button className="nav-item" onClick={() => navigate('/invoices')}>Invoices</button>
            </nav>
            <div className="user-section">
              <span className="user-name">👤 {user?.firstName} {user?.lastName}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          </div>
        </header>
        <main className="invoice-detail-content">
          <div className="error-container">
            <p>❌ {error}</p>
            <button className="btn-back" onClick={() => navigate('/invoices')}>← Back to Invoices</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="invoice-detail-page">
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
            <button className="nav-item">Reports</button>
            <button className="nav-item">Settings</button>
          </nav>

          <div className="user-section">
            <span className="user-name">👤 {user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="invoice-detail-content">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/invoices')}>← Back to Invoices</button>
          <div className="header-actions">
            <button className="btn-print" onClick={handlePrint}>🖨️ Print</button>
            <button className="btn-email" onClick={handleSendEmail}>📧 Send Email</button>
            <button className="btn-download" onClick={handleDownloadPDF}>📥 Download PDF</button>
            <button 
              className="btn-edit"
              onClick={() => navigate(`/edit-invoice/${invoice._id}`)}
            >
              ✏️ Edit
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="invoice-document">
          {/* Header */}
          <div className="invoice-header">
            <div className="company-info">
              <h1 className="company-name">TaxEase</h1>
              <p>Your Business Address</p>
            </div>
            <div className="invoice-title">
              <h2>INVOICE</h2>
              <p className="invoice-number">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="invoice-details">
            <div className="detail-section">
              <h3>Invoice Details</h3>
              <div className="detail-row">
                <span className="label">Invoice Date:</span>
                <span className="value">{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Due Date:</span>
                <span className="value">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`value status-badge status-${(invoice.status || 'draft').toLowerCase()}`}>
                  {invoice.status || 'Draft'}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Bill To</h3>
              <p className="client-name">{invoice.clientName}</p>
              <p className="client-detail">{invoice.clientEmail}</p>
              <p className="client-detail">{invoice.clientPhone || 'N/A'}</p>
              <p className="client-detail">{invoice.clientAddress || 'N/A'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="items-section">
            <h3>Invoice Items</h3>
            {invoice.items && invoice.items.length > 0 ? (
              <div className="items-table">
                <div className="table-header">
                  <div className="col-desc">Description</div>
                  <div className="col-qty">Qty</div>
                  <div className="col-price">Unit Price</div>
                  <div className="col-amount">Amount</div>
                </div>
                {invoice.items.map((item, index) => (
                  <div key={index} className="table-row">
                    <div className="col-desc">{item.description || 'N/A'}</div>
                    <div className="col-qty">{safeNumber(item.quantity)}</div>
                    <div className="col-price">₹{safeNumber(item.unitPrice).toFixed(2)}</div>
                    <div className="col-amount">₹{safeNumber(item.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">No items in this invoice</p>
            )}
          </div>

          {/* Summary */}
          <div className="summary-section">
            <div className="summary-left"></div>
            <div className="summary-right">
              <div className="summary-row">
                <span className="label">Subtotal:</span>
                <span className="value">₹{safeNumber(invoice.subtotal).toFixed(2)}</span>
              </div>
              {safeNumber(invoice.sgstAmount) > 0 && (
                <div className="summary-row">
                  <span className="label">SGST ({invoice.sgstRate || 0}%):</span>
                  <span className="value">₹{safeNumber(invoice.sgstAmount).toFixed(2)}</span>
                </div>
              )}
              {safeNumber(invoice.cgstAmount) > 0 && (
                <div className="summary-row">
                  <span className="label">CGST ({invoice.cgstRate || 0}%):</span>
                  <span className="value">₹{safeNumber(invoice.cgstAmount).toFixed(2)}</span>
                </div>
              )}
              {safeNumber(invoice.igstAmount) > 0 && (
                <div className="summary-row">
                  <span className="label">IGST ({invoice.igstRate || 0}%):</span>
                  <span className="value">₹{safeNumber(invoice.igstAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span className="label">Grand Total:</span>
                <span className="value">₹{safeNumber(invoice.grandTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="notes-section">
              <h3>Notes</h3>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="invoice-footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2026 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}