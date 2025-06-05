/**
 * Routes API untuk Transaksi Material
 * 
 * Mengelola endpoint API untuk transaksi material (penerimaan, pengeluaran, penyesuaian)
 */
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Semua routes dilindungi dengan middleware verifikasi token
router.use(verifyToken);

// Routes untuk transaksi material
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/report', transactionController.getTransactionReport);
router.get('/transactions/materials/:materialId', transactionController.getMaterialTransactionHistory);
router.get('/transactions/:id', transactionController.getTransactionById);
router.post('/transactions/adjustment', transactionController.createStockAdjustment);

module.exports = router;
