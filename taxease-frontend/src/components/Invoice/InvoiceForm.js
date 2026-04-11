import React from 'react';
import { useForm } from '../../hooks/useForm';
import { invoiceService } from '../../services/invoiceService';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import { GST_SLABS } from '../../utils/constants';
import './Invoice.css';

const invoiceSchema = {
  invoiceNumber: {
    required: true,
    label: 'Invoice Number',
    minLength: 1
  },
  invoiceDate: {
    required: true,
    label: 'Invoice Date'
  },
  sellerName: {
    required: true,
    label: 'Seller Name'
  },
  sellerGSTIN: {
    required: false,
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    patternMessage: 'Invalid GST format'
  },
  subtotal: {
    required: true,
    label: 'Subtotal'
  },
  gstRate: {
    required: false,
    label: 'GST Rate (%)'
  }
};

const InvoiceForm = ({ onSuccess }) => {
  const { showToast } = useContext(ToastContext);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm(
      {
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        sellerName: '',
        sellerGSTIN: '',
        buyerName: '',
        buyerGSTIN: '',
        subtotal: '',
        sgst: 0,
        cgst: 0,
        igst: 0,
        gstRate: ''
      },
      invoiceSchema,
      async (formData) => {
        try {
          const totalTax = (parseFloat(formData.sgst) || 0) +
                          (parseFloat(formData.cgst) || 0) +
                          (parseFloat(formData.igst) || 0);
          const totalAmount = parseFloat(formData.subtotal) + totalTax;

          const invoice = {
            ...formData,
            subtotal: parseFloat(formData.subtotal),
            sgst: parseFloat(formData.sgst) || 0,
            cgst: parseFloat(formData.cgst) || 0,
            igst: parseFloat(formData.igst) || 0,
            totalAmount
          };

          const result = await invoiceService.createInvoice(invoice);
          showToast('Invoice created successfully!', 'success');
          onSuccess?.(result);
        } catch (error) {
          showToast(error.response?.data?.message || 'Failed to create invoice', 'error');
        }
      }
    );

  const subtotal = parseFloat(values.subtotal) || 0;
  const sgst = parseFloat(values.sgst) || 0;
  const cgst = parseFloat(values.cgst) || 0;
  const igst = parseFloat(values.igst) || 0;
  const totalTax = sgst + cgst + igst;
  const totalAmount = subtotal + totalTax;

  return (
    <div className="invoice-form-container">
      <form onSubmit={handleSubmit} className="invoice-form">
        <h2>Add Invoice Manually</h2>

        {/* Basic Information */}
        <fieldset className="form-fieldset">
          <legend>Invoice Information</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="invoiceNumber">Invoice Number *</label>
              <input
                id="invoiceNumber"
                type="text"
                name="invoiceNumber"
                value={values.invoiceNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="INV-001"
                className={`form-input ${errors.invoiceNumber && touched.invoiceNumber ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.invoiceNumber && touched.invoiceNumber && (
                <span className="error-message">{errors.invoiceNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="invoiceDate">Invoice Date *</label>
              <input
                id="invoiceDate"
                type="date"
                name="invoiceDate"
                value={values.invoiceDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.invoiceDate && touched.invoiceDate ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.invoiceDate && touched.invoiceDate && (
                <span className="error-message">{errors.invoiceDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={values.dueDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </fieldset>

        {/* Seller Information */}
        <fieldset className="form-fieldset">
          <legend>Seller Information</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sellerName">Seller Name *</label>
              <input
                id="sellerName"
                type="text"
                name="sellerName"
                value={values.sellerName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="ABC Company Pvt Ltd"
                className={`form-input ${errors.sellerName && touched.sellerName ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.sellerName && touched.sellerName && (
                <span className="error-message">{errors.sellerName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sellerGSTIN">Seller GSTIN</label>
              <input
                id="sellerGSTIN"
                type="text"
                name="sellerGSTIN"
                value={values.sellerGSTIN}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="27AAAPD5055K1Z5"
                className={`form-input ${errors.sellerGSTIN && touched.sellerGSTIN ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.sellerGSTIN && touched.sellerGSTIN && (
                <span className="error-message">{errors.sellerGSTIN}</span>
              )}
            </div>
          </div>
        </fieldset>

        {/* Buyer Information */}
        <fieldset className="form-fieldset">
          <legend>Buyer Information</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="buyerName">Buyer Name</label>
              <input
                id="buyerName"
                type="text"
                name="buyerName"
                value={values.buyerName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="XYZ Enterprise"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="buyerGSTIN">Buyer GSTIN</label>
              <input
                id="buyerGSTIN"
                type="text"
                name="buyerGSTIN"
                value={values.buyerGSTIN}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="27AAAPD5055K1Z5"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </fieldset>

        {/* Amount and Tax */}
        <fieldset className="form-fieldset">
          <legend>Amount & Tax Details</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subtotal">Subtotal (₹) *</label>
              <input
                id="subtotal"
                type="number"
                name="subtotal"
                value={values.subtotal}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`form-input ${errors.subtotal && touched.subtotal ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.subtotal && touched.subtotal && (
                <span className="error-message">{errors.subtotal}</span>
              )}
            </div>
          </div>

          <div className="tax-grid">
            <div className="form-group">
              <label htmlFor="sgst">SGST (₹)</label>
              <input
                id="sgst"
                type="number"
                name="sgst"
                value={values.sgst}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cgst">CGST (₹)</label>
              <input
                id="cgst"
                type="number"
                name="cgst"
                value={values.cgst}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="igst">IGST (₹)</label>
              <input
                id="igst"
                type="number"
                name="igst"
                value={values.igst}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </fieldset>

        {/* Summary */}
        <div className="form-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>Total Tax (SGST+CGST+IGST):</span>
            <span>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row grand-total">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '2rem' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
};

export default InvoiceForm;