import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { userService } from '../../services/userService';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import { formatDate, getInitials } from '../../utils/formatters';
import './Profile.css';

const profileSchema = {
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
  phone: {
    required: false,
    pattern: /^[0-9]{10}$/,
    patternMessage: 'Phone must be 10 digits'
  },
  businessName: {
    required: false
  },
  gstNumber: {
    required: false,
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    patternMessage: 'Invalid GST format'
  },
  panNumber: {
    required: false,
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    patternMessage: 'Invalid PAN format'
  }
};

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [isEditing, setIsEditing] = useState(false);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm(
      {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        businessName: user?.businessName || '',
        gstNumber: user?.gstNumber || '',
        panNumber: user?.panNumber || ''
      },
      profileSchema,
      async (formData) => {
        try {
          const result = await userService.updateProfile(formData);
          updateUser(result.data.user);
          showToast('Profile updated successfully!', 'success');
          setIsEditing(false);
        } catch (error) {
          showToast(error.response?.data?.message || 'Update failed', 'error');
        }
      }
    );

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{user.firstName} {user.lastName}</h1>
            <p>{user.email}</p>
            <p className="member-since">Member since {formatDate(user.createdAt)}</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="profile-details">
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone</span>
                <span className="value">{user.phone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Business Name</span>
                <span className="value">{user.businessName || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">GST Number</span>
                <span className="value">{user.gstNumber || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">PAN Number</span>
                <span className="value">{user.panNumber || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Subscription Plan</span>
                <span className="value">{user.subscriptionPlan || 'Free'}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
              style={{ marginTop: '2rem' }}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
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
                  className={`form-input ${errors.lastName && touched.lastName ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.lastName && touched.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10 digit phone number"
                  className={`form-input ${errors.phone && touched.phone ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.phone && touched.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  id="businessName"
                  type="text"
                  name="businessName"
                  value={values.businessName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.businessName && touched.businessName ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.businessName && touched.businessName && (
                  <span className="error-message">{errors.businessName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gstNumber">GST Number</label>
                <input
                  id="gstNumber"
                  type="text"
                  name="gstNumber"
                  value={values.gstNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 27AAAPD5055K1Z5"
                  className={`form-input ${errors.gstNumber && touched.gstNumber ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.gstNumber && touched.gstNumber && (
                  <span className="error-message">{errors.gstNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="panNumber">PAN Number</label>
                <input
                  id="panNumber"
                  type="text"
                  name="panNumber"
                  value={values.panNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., ABCDE1234F"
                  className={`form-input ${errors.panNumber && touched.panNumber ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.panNumber && touched.panNumber && (
                  <span className="error-message">{errors.panNumber}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;