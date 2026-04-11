import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ ${name} changed:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📝 SIGNUP ATTEMPT');
      console.log('📤 Sending:', formData);

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (data.success) {
        console.log('✅ Signup successful!');
        
        // Store tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Store user with both id and _id for compatibility
        const userData = {
          ...data.data.user,
          _id: data.data.user.id  // Add _id from id
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 User stored:', userData);

        navigate('/dashboard');
      } else {
        console.log('❌ Signup failed:', data.message);
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('❌ Signup error:', err);
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">💼</span>
            <span className="logo-text">TaxEase</span>
          </div>
          <div className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/login')} className="btn-login-link">Login</button>
          </div>
        </div>
      </header>

      {/* Signup Form */}
      <section className="signup-container">
        <div className="signup-box">
          <h1>Create Account</h1>
          <p>Join TaxEase and manage your invoices</p>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password (min 6 characters)"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-signup"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <button onClick={() => navigate('/login')} className="link-button">Login here</button>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 TaxEase. All rights reserved.</p>
      </footer>
    </div>
  );
}