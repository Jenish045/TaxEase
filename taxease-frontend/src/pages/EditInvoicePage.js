import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/EditInvoicePage.css';

export default function EditInvoicePage() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    sgstRate: 9,
    cgstRate: 9,
    igstRate: 0,
    notes: '',
    status: 'Draft'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      console.log('🔍 Fetching invoice for edit:', invoiceId);

      const response = await fetch(`${API_URL}/invoices/${invoiceId}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Invoice fetched:', data.data);
        setFormData(prev => ({
          ...prev,
          invoiceNumber: data.data.invoiceNumber,
          invoiceDate: data.data.invoiceDate ? data.data.invoiceDate.split('T')[0] : '',
          dueDate: data.data.dueDate ? data.data.dueDate.split('T')[0] : '',
          clientName: data.data.clientName,
          clientEmail: data.data.clientEmail,
          clientPhone: data.data.clientPhone || '',
          clientAddress: data.data.clientAddress || '',
          items: data.data.items || [{ description: '', quantity: 1, unitPrice: 0 }],
          sgstRate: data.data.sgstRate || 9,
          cgstRate: data.data.cgstRate || 9,
          igstRate: data.data.igstRate || 0,
          notes: data.data.notes || '',
          status: data.data.status || 'Draft'
        }));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const sgstAmount = (subtotal * formData.sgstRate) / 100;
    const cgstAmount = (subtotal * formData.cgstRate) / 100;
    const igstAmount = (subtotal * formData.igstRate) / 100;
    const totalTax = sgstAmount + cgstAmount + igstAmount;
    const totalAmount = subtotal + totalTax;

    return { subtotal, sgstAmount, cgstAmount, igstAmount, totalTax, totalAmount };
  };

  const totals = calculateTotals();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const invoiceData = {
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
        items: formData.items,
        sgstRate: formData.sgstRate,
        cgstRate: formData.cgstRate,
        igstRate: formData.igstRate,
        notes: formData.notes,
        status: formData.status
      };

      console.log('📤 UPDATING INVOICE:', invoiceData);

      const response = await fetch(`${API_URL}/invoices/update/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Invoice updated successfully!');
        alert('✅ Invoice updated successfully!');
        navigate('/invoices');
      } else {
        console.error('❌ Error:', data.message);
        setError('Error updating invoice: ' + data.message);
      }

    } catch (error) {
      console.error('❌ Error submitting invoice:', error);
      setError('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-invoice-page">
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

  if (error && !formData.invoiceNumber) {
    return (
      <div className="edit-invoice-page">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo" onClick={() => navigate('/')}>
              <span className="logo-icon">💼</span>
              <span className="logo-text">TaxEase</span>
            </div>
          </div>
        </header>
        <main className="edit-invoice-content">
          <div className="error-container">
            <p>❌ {error}</p>
            <button className="btn-back" onClick={() => navigate('/invoices')}>← Back to Invoices</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="edit-invoice-page">
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
      <main className="edit-invoice-content">
        <div className="page-header">
          <h1>Edit Invoice</h1>
          <p>Update the invoice details below</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="invoice-form">
          {/* Invoice Details Section */}
          <section className="form-section">
            <h2>Invoice Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Invoice Number *</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Invoice Date *</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </section>

          {/* Client Details Section */}
          <section className="form-section">
            <h2>Client Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label>Address</label>
                <textarea
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter full address..."
                />
              </div>
            </div>
          </section>

          {/* Items Section */}
          <section className="form-section">
            <div className="section-header">
              <h2>Invoice Items</h2>
              <button 
                type="button"
                className="btn-add-item"
                onClick={handleAddItem}
              >
                ➕ Add Item
              </button>
            </div>

            <div className="items-table">
              <div className="items-header">
                <div className="col-desc">Description</div>
                <div className="col-qty">Qty</div>
                <div className="col-price">Unit Price</div>
                <div className="col-amount">Amount</div>
                <div className="col-action">Action</div>
              </div>

              {formData.items.map((item, index) => {
                const amount = item.quantity * item.unitPrice;
                return (
                  <div key={index} className="items-row">
                    <div className="col-desc">
                      <input
                        type="text"
                        placeholder="Enter item description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-qty">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                        required
                      />
                    </div>

                    <div className="col-price">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                        required
                      />
                    </div>

                    <div className="col-amount">
                      ₹{amount.toFixed(2)}
                    </div>

                    <div className="col-action">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => handleRemoveItem(index)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tax Section */}
          <section className="form-section">
            <h2>Tax Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>SGST Rate (%)</label>
                <input
                  type="number"
                  name="sgstRate"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.sgstRate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>CGST Rate (%)</label>
                <input
                  type="number"
                  name="cgstRate"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.cgstRate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>IGST Rate (%)</label>
                <input
                  type="number"
                  name="igstRate"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.igstRate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          {/* Totals Section */}
          <section className="form-section totals-section">
            <div className="totals-grid">
              <div className="total-item">
                <span>Subtotal:</span>
                <span className="amount">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-item">
                <span>SGST ({formData.sgstRate}%):</span>
                <span className="amount">₹{totals.sgstAmount.toFixed(2)}</span>
              </div>
              <div className="total-item">
                <span>CGST ({formData.cgstRate}%):</span>
                <span className="amount">₹{totals.cgstAmount.toFixed(2)}</span>
              </div>
              <div className="total-item">
                <span>IGST ({formData.igstRate}%):</span>
                <span className="amount">₹{totals.igstAmount.toFixed(2)}</span>
              </div>
              <div className="total-item">
                <span>Total Tax:</span>
                <span className="amount">₹{totals.totalTax.toFixed(2)}</span>
              </div>
              <div className="total-item grand-total">
                <span>Grand Total:</span>
                <span className="amount">₹{totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Notes Section */}
          <section className="form-section">
            <h2>Notes</h2>
            
            <div className="form-group full">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Add any additional notes or payment terms..."
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : '✅ Save Changes'}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2026 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}