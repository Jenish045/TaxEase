import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 LOGIN ATTEMPT');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);
      console.log('🔑 Password:', password); // ✅ DEBUG

      // ✅ MAKE SURE WE'RE SENDING THE FULL PASSWORD
      const loginData = {
        email: email.trim(),
        password: password // ✅ SEND RAW PASSWORD
      };

      console.log('📤 Sending:', loginData);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (data.success) {
        console.log('✅ Login successful!');
        
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
        console.log('❌ Login failed:', data.message);
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">💼</span>
            <span className="logo-text">TaxEase</span>
          </div>
          <div className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={handleSignup} className="btn-signup">Sign Up</button>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <section className="login-container">
        <div className="login-box">
          <h1>Welcome Back</h1>
          <p>Login to your TaxEase account</p>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log('✏️ Email changed:', val);
                  setEmail(val);
                }}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log('✏️ Password changed, length:', val.length);
                  setPassword(val);
                }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account? <button onClick={handleSignup} className="link-button">Sign up here</button>
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