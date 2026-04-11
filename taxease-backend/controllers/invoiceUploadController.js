const axios = require('axios');
const Invoice = require('../models/Invoice');
const logger = require('../utils/logger');
const CONSTANTS = require('../config/constants');

const invoiceUploadController = {
  // Upload invoice to Flask for processing
  uploadToFlask: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
          code: 'NO_FILE'
        });
      }

      const flaskUrl = process.env.FLASK_SERVICE_URL || 'http://localhost:5001/api';
      
      logger.info(`Sending file to Flask: ${req.file.filename}`);

      // Create FormData to send to Flask
      const FormData = require('form-data');
      const fs = require('fs');
      const form = new FormData();
      
      form.append('file', fs.createReadStream(req.file.path));
      form.append('userId', req.user.userId);

      // Send to Flask
      const flaskResponse = await axios.post(
        `${flaskUrl}/invoices/upload`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000
        }
      );

      if (!flaskResponse.data.success) {
        return res.status(400).json(flaskResponse.data);
      }

      // Extract invoice data from Flask response
      const invoiceData = flaskResponse.data.data.extractedData;

      // Save to MongoDB
      const invoice = new Invoice({
        userId: req.user.userId,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        sellerName: invoiceData.sellerName,
        sellerGSTIN: invoiceData.sellerGSTIN,
        buyerName: invoiceData.buyerName,
        buyerGSTIN: invoiceData.buyerGSTIN,
        subtotal: parseFloat(invoiceData.subtotal) || 0,
        sgst: parseFloat(invoiceData.sgst) || 0,
        cgst: parseFloat(invoiceData.cgst) || 0,
        igst: parseFloat(invoiceData.igst) || 0,
        totalAmount: parseFloat(invoiceData.totalAmount) || 0,
        filePath: req.file.path,
        fileName: req.file.filename,
        fileSize: req.file.size,
        documentType: CONSTANTS.DOCUMENT_TYPE.TEXT_BASED,
        extractedText: flaskResponse.data.data.extractedData,
        approved: true,
        status: CONSTANTS.INVOICE_STATUS.COMPLETED
      });

      invoice.calculateTotalTax();
      await invoice.save();

      logger.info(`Invoice saved: ${invoice._id}`);

      res.status(201).json({
        success: true,
        message: 'Invoice uploaded and processed successfully',
        data: {
          invoice,
          flaskConfidence: flaskResponse.data.data.confidence
        }
      });

    } catch (error) {
      logger.error(`Upload to Flask error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error processing invoice with Flask',
        code: 'FLASK_ERROR',
        error: error.message
      });
    }
  }
};

module.exports = invoiceUploadController;