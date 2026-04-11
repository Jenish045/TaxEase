import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateInvoicePage.css';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    items: [
      { description: '', quantity: 1, unitPrice: 0 }
    ],
    sgstRate: 9,
    cgstRate: 9,
    igstRate: 0,
    notes: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // Generate invoice number
      setFormData(prev => ({
        ...prev,
        invoiceNumber: `INV-${Date.now()}`
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      clientAddress: {
        ...prev.clientAddress,
        [name]: value
      }
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
    setError('');
    setLoading(true);

    try {
      console.log('📝 Creating invoice...');

      const invoiceData = {
        ...formData,
        userId: user._id,
        items: formData.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          amount: parseFloat(item.quantity) * parseFloat(item.unitPrice)
        }))
      };

      const response = await fetch(`${API_URL}/invoices/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        console.log('✅ Invoice created:', data.data._id);
        navigate('/invoices');
      } else {
        setError(data.message || 'Error creating invoice');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-invoice-page">
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
      <main className="create-invoice-content">
        <div className="page-header">
          <h1>Create Invoice</h1>
          <p>Fill in the details below to create a new invoice</p>
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
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.clientAddress.street}
                  onChange={handleAddressChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.clientAddress.city}
                  onChange={handleAddressChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.clientAddress.state}
                  onChange={handleAddressChange}
                />
              </div>

              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.clientAddress.postalCode}
                  onChange={handleAddressChange}
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
              disabled={loading}
            >
              {loading ? 'Creating...' : '✅ Create Invoice'}
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