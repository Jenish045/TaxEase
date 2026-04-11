import React from 'react';
import './Layout.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p>&copy; {currentYear} TaxEase. All rights reserved.</p>
          <div className="footer-links">
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Service</a>
            <a href="/">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;