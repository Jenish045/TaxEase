import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import './Auth.css';

const loginSchema = {
  email: {
    required: true,
    type: 'email',
    label: 'Email'
  },
  password: {
    required: true,
    type: 'password',
    label: 'Password'
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useContext(ToastContext);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm(
      { email: '', password: '' },
      loginSchema,
      async (formData) => {
        try {
          const result = await login(formData.email, formData.password);
          if (result.success) {
            showToast('Login successful!', 'success');
            navigate('/dashboard');
          } else {
            showToast(result.error, 'error');
          }
        } catch (error) {
          showToast('Login failed', 'error');
        }
      }
    );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back to Financial Automation System</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
              className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.password && touched.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;