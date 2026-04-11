import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <span className="nav-logo">💼</span>
        <h2 onClick={() => navigate('/dashboard')}>TaxEase</h2>
      </div>

      <div className="nav-menu">
        <a onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</a>
        <a onClick={() => navigate('/invoices')} className="nav-link">Invoices</a>
        <a onClick={() => navigate('/profile')} className="nav-link">Profile</a>
      </div>

      <div className="nav-user">
        <span className="user-email">{user?.email}</span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}