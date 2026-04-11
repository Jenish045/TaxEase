import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/dashboard')}>
            <span className="logo-icon">🔥</span>
            <span className="logo-text">TaxEase</span>
          </div>
          <div className="header-user">
            <span className="user-name">{user?.firstName}</span>
            <button onClick={() => navigate('/dashboard')} className="btn-dash">Dashboard</button>
            <button onClick={() => navigate('/invoices')} className="btn-dash">Invoices</button>
            <button onClick={handleLogout} className="btn-logout-header">Logout</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Profile Settings</h1>
        <p>Manage your account</p>
      </section>

      {/* Content */}
      <section className="content">
        <div className="profile-card">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <label>First Name</label>
              <p>{user?.firstName}</p>
            </div>
            <div className="info-row">
              <label>Last Name</label>
              <p>{user?.lastName}</p>
            </div>
            <div className="info-row">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}