import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { invoiceService } from '../../services/invoiceService';
import { formatDate, formatCurrency, formatInvoiceStatus } from '../../utils/formatters';
import { INVOICE_STATUS_COLORS } from '../../utils/constants';
import Loading from '../Common/Loading';
import './Invoice.css';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoiceData, isLoading, error } = useApi(
    () => invoiceService.getInvoiceById(id),
    [id]
  );

  if (isLoading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  const invoice = invoiceData?.data?.invoice;

  if (!invoice) return <div className="error-message">Invoice not found</div>;

  return (
    <div className="invoice-detail">
      <button onClick={() => navigate('/invoices')} className="back-btn">
        ← Back to Invoices
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1>Invoice #{invoice.invoiceNumber}</h1>
            <span
              className="status-badge"
              style={{ backgroundColor: INVOICE_STATUS_COLORS[invoice.status] }}
            >
              {formatInvoiceStatus(invoice.status)}
            </span>
          </div>
          {invoice.flaggedForReview && (
            <div className="flagged-warning">⚠️ Flagged for Review</div>
          )}
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="info-row">
              <span className="label">Invoice Date:</span>
              <span className="value">{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div className="info-row">
              <span className="label">Due Date:</span>
              <span className="value">{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Seller Information</h3>
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{invoice.sellerName || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">GSTIN:</span>
              <span className="value">{invoice.sellerGSTIN || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Tax Breakdown</h3>
            <div className="info-row">
              <span className="label">Subtotal:</span>
              <span className="value">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="info-row">
              <span className="label">SGST:</span>
              <span className="value">{formatCurrency(invoice.sgst)}</span>
            </div>
            <div className="info-row">
              <span className="label">CGST:</span>
              <span className="value">{formatCurrency(invoice.cgst)}</span>
            </div>
            <div className="info-row">
              <span className="label">IGST:</span>
              <span className="value">{formatCurrency(invoice.igst)}</span>
            </div>
          </div>

          <div className="detail-section highlight">
            <h3>Total Amount</h3>
            <div className="info-row">
              <span className="label">Total Tax:</span>
              <span className="value">{formatCurrency(invoice.totalTax)}</span>
            </div>
            <div className="info-row grand-total">
              <span className="label">Grand Total:</span>
              <span className="value">{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {invoice.anomalies && invoice.anomalies.length > 0 && (
          <div className="anomalies-section">
            <h3>Anomalies Detected</h3>
            <div className="anomalies-list">
              {invoice.anomalies.map((anomaly, idx) => (
                <div key={idx} className={`anomaly-item anomaly-${anomaly.severity}`}>
                  <strong>{anomaly.type}</strong>: {anomaly.message}
                  <span className="severity">{anomaly.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;