import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/InvoiceDetailPage.css';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ✅ Use useCallback to prevent infinite loop
  const fetchInvoiceDetail = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/invoices/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInvoice(data.data);
      } else {
        setError('Invoice not found');
      }
    } catch (err) {
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [id, API_URL]);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [fetchInvoiceDetail]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDownload = () => {
    if (invoice?.filePath) {
      window.open(invoice.filePath, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="invoice-detail-page">
        <header className="header">
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
        <header className="header">
          <div className="header-content">
            <div className="logo" onClick={() => navigate('/')}>
              <span className="logo-icon">💼</span>
              <span className="logo-text">TaxEase</span>
            </div>
          </div>
        </header>
        <div className="content">
          <div className="error-message">{error || 'Invoice not found'}</div>
          <button onClick={() => navigate('/invoices')} className="btn-back">
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-detail-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">💼</span>
            <span className="logo-text">TaxEase</span>
          </div>
          <div className="header-nav">
            <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
            <button onClick={() => navigate('/invoices')} className="nav-link">Invoices</button>
          </div>
          <div className="header-user">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Invoice Details</h1>
        <p>View complete invoice information</p>
      </section>

      {/* Content */}
      <section className="content">
        <div className="detail-header">
          <h2>Invoice #{invoice.invoiceNumber}</h2>
          <div className="detail-actions">
            <button onClick={handleDownload} className="btn-download">
              📥 Download PDF
            </button>
            <button onClick={() => navigate('/invoices')} className="btn-back">
              ← Back to Invoices
            </button>
          </div>
        </div>

        <div className="detail-grid">
          {/* Vendor Information */}
          <div className="detail-card">
            <h3>Vendor Information</h3>
            <div className="detail-item">
              <span className="label">Vendor Name:</span>
              <span className="value">{invoice.vendorName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email:</span>
              <span className="value">{invoice.vendorEmail || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Phone:</span>
              <span className="value">{invoice.vendorPhone || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Address:</span>
              <span className="value">{invoice.vendorAddress || 'N/A'}</span>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="detail-card">
            <h3>Invoice Information</h3>
            <div className="detail-item">
              <span className="label">Invoice Date:</span>
              <span className="value">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Due Date:</span>
              <span className="value">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`status-badge status-${invoice.status}`}>
                {invoice.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Description:</span>
              <span className="value">{invoice.description || 'N/A'}</span>
            </div>
          </div>

          {/* Amount Details */}
          <div className="detail-card amount-card">
            <h3>Amount Details</h3>
            <div className="detail-item">
              <span className="label">Subtotal:</span>
              <span className="value">₹{invoice.subtotal?.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">SGST (9%):</span>
              <span className="value">₹{invoice.sgst?.toLocaleString() || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">CGST (9%):</span>
              <span className="value">₹{invoice.cgst?.toLocaleString() || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">IGST (18%):</span>
              <span className="value">₹{invoice.igst?.toLocaleString() || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">Other Tax:</span>
              <span className="value">₹{invoice.otherTax?.toLocaleString() || 0}</span>
            </div>
            <div className="detail-item total">
              <span className="label">Total Tax:</span>
              <span className="value">₹{invoice.taxAmount?.toLocaleString()}</span>
            </div>
            <div className="detail-item total-amount">
              <span className="label">Grand Total:</span>
              <span className="value">₹{invoice.totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          {/* Line Items */}
          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <div className="detail-card full-width">
              <h3>Line Items</h3>
              <div className="table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.unitPrice?.toLocaleString()}</td>
                        <td>₹{(item.quantity * item.unitPrice)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OCR Data */}
          {invoice.ocrData && (
            <div className="detail-card full-width">
              <h3>Extracted OCR Data</h3>
              <p className="ocr-text">{invoice.ocrData}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}