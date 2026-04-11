import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    businessType: 'individual'
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        businessName: parsedUser.businessName || '',
        gstNumber: parsedUser.gstNumber || '',
        panNumber: parsedUser.panNumber || '',
        businessType: parsedUser.businessType || 'individual'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('📝 Updating profile...');
      // For now, just update localStorage (backend integration needed)
      localStorage.setItem('user', JSON.stringify({ ...user, ...formData }));
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error updating profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Changing password...');
      // For now, just show success message (backend integration needed)
      setMessage('✅ Password changed successfully!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error changing password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
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
            <button className="nav-item" onClick={() => navigate('/reports')}>Reports</button>
            <button className="nav-item active">Settings</button>
          </nav>

          <div className="user-section">
            <span className="user-name">👤 {user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="settings-content">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="settings-container">
          {/* Tabs */}
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              🏢 Business
            </button>
            <button 
              className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              🔐 Password
            </button>
            <button 
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              ⚙️ Preferences
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-content-area">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <section className="settings-section">
                <h2>Personal Information</h2>
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10 digit phone number"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Business Tab */}
            {activeTab === 'business' && (
              <section className="settings-section">
                <h2>Business Information</h2>
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Business Type</label>
                      <select 
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                      >
                        <option value="individual">Individual</option>
                        <option value="partnership">Partnership</option>
                        <option value="llp">LLP</option>
                        <option value="private_company">Private Company</option>
                        <option value="public_company">Public Company</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="GSTIN format"
                      />
                    </div>

                    <div className="form-group">
                      <label>PAN Number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        placeholder="PAN format"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <section className="settings-section">
                <h2>Change Password</h2>
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Current Password *</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : '🔐 Change Password'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <section className="settings-section">
                <h2>Preferences</h2>
                <div className="preferences-list">
                  <div className="preference-item">
                    <div className="preference-info">
                      <h3>Email Notifications</h3>
                      <p>Receive email notifications for invoice reminders</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h3>Invoice Reminders</h3>
                      <p>Get reminded about due invoices</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h3>Dark Mode</h3>
                      <p>Use dark theme for the application</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </section>
            )}
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