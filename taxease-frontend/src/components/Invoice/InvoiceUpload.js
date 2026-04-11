import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { invoiceService } from '../../services/invoiceService';
import { validateFile } from '../../utils/validators';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import { FiUploadCloud } from 'react-icons/fi';
import './Invoice.css';

const InvoiceUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showToast } = useContext(ToastContext);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await invoiceService.uploadInvoice(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      showToast('Invoice uploaded successfully!', 'success');
      onUploadSuccess?.(result);

      // Reset
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      showToast(error.response?.data?.message || 'Upload failed', 'error');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    disabled: isUploading,
    multiple: false
  });

  return (
    <div className="invoice-upload">
      <div
        {...getRootProps()}
        className={`upload-dropzone ${isDragActive ? 'active' : ''} ${isUploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} />
        <FiUploadCloud size={48} className="upload-icon" />
        <h3>Drop your invoice PDF here</h3>
        <p>or click to select file</p>
        <small>Maximum file size: 10MB</small>
      </div>

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p>{uploadProgress}% uploaded</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceUpload;