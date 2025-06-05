/**
 * Routes API untuk Supplier (Pemasok)
 * 
 * Mengelola endpoint API untuk pemasok bahan baku
 */
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Semua routes dilindungi dengan middleware verifikasi token
router.use(verifyToken);

// Routes untuk supplier
router.get('/suppliers', supplierController.getAllSuppliers);
router.get('/suppliers/performance', supplierController.getSupplierPerformance);
router.get('/suppliers/:id', supplierController.getSupplierById);
router.get('/suppliers/:id/materials', supplierController.getSupplierMaterials);
router.post('/suppliers', supplierController.createSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

module.exports = router;
