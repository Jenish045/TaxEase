import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import './Auth.css';

const signupSchema = {
  firstName: {
    required: true,
    label: 'First Name',
    minLength: 2
  },
  lastName: {
    required: true,
    label: 'Last Name',
    minLength: 2
  },
  email: {
    required: true,
    type: 'email',
    label: 'Email'
  },
  password: {
    required: true,
    type: 'password',
    label: 'Password'
  },
  confirmPassword: {
    required: true,
    label: 'Confirm Password'
  }
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useContext(ToastContext);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm(
      { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
      signupSchema,
      async (formData) => {
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }

        try {
          const result = await signup({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password
          });

          if (result.success) {
            showToast('Account created successfully!', 'success');
            navigate('/dashboard');
          } else {
            showToast(result.error, 'error');
          }
        } catch (error) {
          showToast('Signup failed', 'error');
        }
      }
    );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join Financial Automation System</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John"
                className={`form-input ${errors.firstName && touched.firstName ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.firstName && touched.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Doe"
                className={`form-input ${errors.lastName && touched.lastName ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.lastName && touched.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.email && touched.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Min 8 chars, uppercase, lowercase, numbers"
              className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.password && touched.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;