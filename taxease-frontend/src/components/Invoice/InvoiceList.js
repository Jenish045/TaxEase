import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { invoiceService } from '../../services/invoiceService';
import { formatDate, formatCurrency, formatInvoiceStatus } from '../../utils/formatters';
import { INVOICE_STATUS, INVOICE_STATUS_COLORS } from '../../utils/constants';
import Loading from '../Common/Loading';
import InvoiceUpload from './InvoiceUpload';
import './Invoice.css';

const InvoiceList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const { data: invoicesData, isLoading, refetch } = useApi(
    () => invoiceService.getInvoices({
      page: currentPage,
      limit: 10,
      status: statusFilter || undefined
    }),
    [currentPage, statusFilter]
  );

  const invoices = invoicesData?.data?.invoices || [];
  const pagination = invoicesData?.data?.pagination || {};

  const handleUploadSuccess = () => {
    setShowUpload(false);
    refetch();
  };

  if (isLoading) return <Loading />;

  return (
    <div className="invoice-list">
      <div className="list-header">
        <h1>My Invoices</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn btn-primary"
        >
          {showUpload ? '✕ Cancel' : '+ Upload Invoice'}
        </button>
      </div>

      {showUpload && (
        <InvoiceUpload onUploadSuccess={handleUploadSuccess} />
      )}

      <div className="list-filters">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Status</option>
          {Object.entries(INVOICE_STATUS).map(([key, value]) => (
            <option key={key} value={value}>
              {formatInvoiceStatus(value)}
            </option>
          ))}
        </select>
      </div>

      <div className="invoices-table-wrapper">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Seller</th>
              <th>Amount</th>
              <th>Tax</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="invoice-number">{invoice.invoiceNumber}</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                  <td>{invoice.sellerName || 'N/A'}</td>
                  <td className="amount">{formatCurrency(invoice.totalAmount)}</td>
                  <td>{formatCurrency(invoice.totalTax)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: INVOICE_STATUS_COLORS[invoice.status] }}
                    >
                      {formatInvoiceStatus(invoice.status)}
                    </span>
                  </td>
                  <td>
                    <Link to={`/invoices/${invoice._id}`} className="action-link">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No invoices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>

          <span className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
            disabled={currentPage === pagination.pages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;