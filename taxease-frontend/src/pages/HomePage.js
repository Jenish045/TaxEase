import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">TaxEase</span>
          </div>
          <div className="header-buttons">
            {!user ? (
              <>
                <button onClick={() => navigate('/login')} className="btn-login">
                  Login
                </button>
                <button onClick={() => navigate('/signup')} className="btn-signup-header">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <span className="user-welcome">Welcome, {user.firstName}!</span>
                <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
                  Dashboard
                </button>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Financial Automation System</h1>
          <p className="hero-subtitle">Simplify GST & ITR Filing with Intelligent Invoice Processing</p>
          <p className="get-started-label">Get Started Free</p>
          {!user && (
            <button onClick={() => navigate('/login')} className="btn-hero">
              Login
            </button>
          )}
          {user && (
            <button onClick={() => navigate('/dashboard')} className="btn-hero">
              Go to Dashboard
            </button>
          )}
        </div>
      </section>

      {/* Why Choose TaxEase */}
      <section className="why-choose">
        <h2>Why Choose TaxEase?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Smart OCR</h3>
            <p>Automatically extract invoice data using advanced AI-powered OCR technology</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Tax Calculation</h3>
            <p>Calculate SGST, CGST, IGST automatically with GST compliance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Reports</h3>
            <p>Generate comprehensive tax reports and invoices in seconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Your data is encrypted and stored securely in the cloud</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast</h3>
            <p>Process multiple invoices in minutes, not hours</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Accessible</h3>
            <p>Access your invoices and reports from anywhere, anytime</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Invoice</h3>
            <p>Upload your PDF invoice or enter details manually</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Extract Data</h3>
            <p>Our AI extracts all invoice details automatically</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Calculate Tax</h3>
            <p>Tax amounts are calculated based on GST rates</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Generate Reports</h3>
            <p>Create tax reports and summaries instantly</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <p className="price">₹0</p>
            <ul className="features-list">
              <li><span className="checkmark">✓</span> 5 invoices/month</li>
              <li><span className="checkmark">✓</span> Basic reports</li>
              <li><span className="checkmark">✓</span> Manual entry</li>
              <li><span className="cross">✕</span> OCR extraction</li>
              <li><span className="cross">✕</span> Priority support</li>
            </ul>
            <button className="btn-pricing" disabled>Current Plan</button>
          </div>

          <div className="pricing-card featured">
            <div className="featured-badge">Most Popular</div>
            <h3>Pro</h3>
            <p className="price">₹499/month</p>
            <ul className="features-list">
              <li><span className="checkmark">✓</span> Unlimited invoices</li>
              <li><span className="checkmark">✓</span> Advanced reports</li>
              <li><span className="checkmark">✓</span> OCR extraction</li>
              <li><span className="checkmark">✓</span> Email support</li>
              <li><span className="cross">✕</span> Priority support</li>
            </ul>
            <button onClick={() => navigate('/signup')} className="btn-pricing btn-primary">Upgrade Now</button>
          </div>

          <div className="pricing-card">
            <h3>Business</h3>
            <p className="price">₹1,499/month</p>
            <ul className="features-list">
              <li><span className="checkmark">✓</span> Unlimited invoices</li>
              <li><span className="checkmark">✓</span> Custom reports</li>
              <li><span className="checkmark">✓</span> OCR extraction</li>
              <li><span className="checkmark">✓</span> Priority support</li>
              <li><span className="checkmark">✓</span> API access</li>
            </ul>
            <button onClick={() => navigate('/signup')} className="btn-pricing btn-primary">Upgrade Now</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About TaxEase</h4>
            <p>Making invoice and tax management simple for everyone</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#/">Privacy Policy</a></li>
              <li><a href="#/">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 TaxEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}