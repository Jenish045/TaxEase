import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date, dateFormat = 'dd/MM/yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(dateObj, dateFormat);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm:ss');
};

export const formatGST = (gst) => {
  if (!gst) return '';
  const cleanGst = gst.replace(/[^A-Z0-9]/g, '').toUpperCase();
  return cleanGst;
};

export const formatPAN = (pan) => {
  if (!pan) return '';
  return pan.replace(/[^A-Z0-9]/g, '').toUpperCase();
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `+91 ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
};

export const formatInvoiceStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    flagged: 'Flagged for Review'
  };
  return statusMap[status] || status;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getInitials = (firstName = '', lastName = '') => {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
};