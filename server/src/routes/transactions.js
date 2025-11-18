const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { verifyPermission } = require('../middleware/verifyPermission');
const { 
  getTransactions, 
  getTransactionDetails,
  getTransactionStats,
  refundTransaction
} = require('../controllers/transactionsController');

// Get transaction statistics
router.get('/:restaurantId/stats', verifyToken, getTransactionStats);

// Get all transactions for a restaurant
router.get('/:restaurantId', verifyToken, getTransactions);

// Refund a transaction
router.post('/:restaurantId/:paymentIntentId/refund', verifyPermission('transactions','update'), refundTransaction);

// Get single transaction details
router.get('/:restaurantId/:paymentIntentId', verifyToken, getTransactionDetails);

module.exports = router;
