/**
 * Routes API Planning
 * 
 * Mengelola endpoint API untuk perencanaan produksi
 */
const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planning.controller');

// Middleware untuk verifikasi token JWT
const verifyToken = require('../middleware/auth.middleware');

// Mendapatkan semua rencana produksi
router.get('/plans', verifyToken, planningController.getAllPlans);

// Mendapatkan detail rencana produksi berdasarkan ID
router.get('/plans/:id', verifyToken, planningController.getPlanById);

// Membuat rencana produksi baru
router.post('/plans', verifyToken, planningController.createPlan);

// Memperbarui rencana produksi
router.put('/plans/:id', verifyToken, planningController.updatePlan);

// Menghapus rencana produksi
router.delete('/plans/:id', verifyToken, planningController.deletePlan);

// Menyetujui rencana produksi
router.post('/plans/:id/approve', verifyToken, planningController.approvePlan);

// Menambahkan rencana kapasitas ke rencana produksi
router.post('/plans/:id/capacity', verifyToken, planningController.addCapacityPlan);

// Menambahkan rencana material ke rencana produksi
router.post('/plans/:id/material', verifyToken, planningController.addMaterialPlan);

// Endpoint untuk menerima notifikasi permintaan produksi baru
router.post('/notifications/request', planningController.receiveNotification);

// Endpoint untuk menerima pembaruan permintaan produksi
router.post('/notifications/update', planningController.receiveUpdate);

module.exports = router;
