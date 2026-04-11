import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import './Layout.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      showToast('Logout failed', 'error');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          💼 TaxEase
        </Link>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/invoices" className="nav-link">Invoices</Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="user-profile-link">
                <FiUser size={20} />
                <span className="user-name">{user.firstName}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Login
              </Link>
            </>
          )}
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;