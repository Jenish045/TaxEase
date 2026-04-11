import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { invoiceService } from '../../services/invoiceService';
import { formatDate, formatCurrency, formatInvoiceStatus } from '../../utils/formatters';
import { INVOICE_STATUS_COLORS } from '../../utils/constants';
import './Dashboard.css';

const RecentInvoices = () => {
  const { data: invoicesData, isLoading } = useApi(
    () => invoiceService.getInvoices({ page: 1, limit: 5 }),
    []
  );

  const invoices = invoicesData?.data?.invoices || [];

  if (isLoading) return <div>Loading invoices...</div>;

  return (
    <div className="recent-invoices">
      <div className="section-header">
        <h2>Recent Invoices</h2>
        <Link to="/invoices" className="view-all-link">View All →</Link>
      </div>

      <div className="invoices-table-wrapper">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Seller</th>
              <th>Amount</th>
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
                <td colSpan="6" className="text-center">No invoices yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvoices;