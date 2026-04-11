export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

export const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const validateInvoiceNumber = (invoiceNumber) => {
  return invoiceNumber && invoiceNumber.trim().length > 0;
};

export const validateAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) >= 0;
};

export const validateFile = (file, allowedTypes = ['application/pdf'], maxSize = 10 * 1024 * 1024) => {
  if (!file) return { valid: false, error: 'File is required' };

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
  }

  return { valid: true };
};

export const validateForm = (formData, schema) => {
  const errors = {};

  Object.keys(schema).forEach((field) => {
    const value = formData[field];
    const rules = schema[field];

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${rules.label || field} is required`;
      return;
    }

    if (rules.type === 'email' && value && !validateEmail(value)) {
      errors[field] = 'Invalid email format';
    }

    if (rules.type === 'password' && value && !validatePassword(value)) {
      errors[field] = 'Password must contain uppercase, lowercase, numbers (min 8 chars)';
    }

    if (rules.minLength && value && value.toString().length < rules.minLength) {
      errors[field] = `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value && value.toString().length > rules.maxLength) {
      errors[field] = `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || 'Invalid format';
    }
  });

  return errors;
};