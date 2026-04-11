import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const invoiceService = {
  getInvoices: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.INVOICES_LIST, { params });
    return response.data;
  },

  getInvoiceById: async (id) => {
    const response = await api.get(API_ENDPOINTS.INVOICES_DETAIL(id));
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post(API_ENDPOINTS.INVOICES_CREATE, invoiceData);
    return response.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await api.put(API_ENDPOINTS.INVOICES_UPDATE(id), invoiceData);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await api.delete(API_ENDPOINTS.INVOICES_DELETE(id));
    return response.data;
  },

  uploadInvoice: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(API_ENDPOINTS.INVOICES_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};