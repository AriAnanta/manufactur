/**
 * Routes API untuk Material
 * 
 * Mengelola endpoint API untuk material bahan baku
 */
const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Semua routes dilindungi dengan middleware verifikasi token
router.use(verifyToken);

// Routes untuk material
router.get('/materials', materialController.getAllMaterials);
router.get('/materials/categories', materialController.getMaterialCategories);
router.get('/materials/types', materialController.getMaterialTypes);
router.get('/materials/stock-report', materialController.getMaterialStockReport);
router.post('/materials/check-stock', materialController.checkMaterialStock);
router.post('/materials/issue', materialController.issueMaterials);
router.post('/materials/receive', materialController.receiveMaterials);
router.get('/materials/:id', materialController.getMaterialById);
router.post('/materials', materialController.createMaterial);
router.put('/materials/:id', materialController.updateMaterial);
router.delete('/materials/:id', materialController.deleteMaterial);

module.exports = router;
