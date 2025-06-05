/**
 * Routes UI Planning
 * 
 * Mengelola endpoint UI untuk perencanaan produksi
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ProductionPlan, CapacityPlan, MaterialPlan } = require('../models');

// Middleware untuk verifikasi apakah pengguna sudah login
const isAuthenticated = async (req, res, next) => {
  // Periksa apakah ada token di cookies
  const token = req.cookies?.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    // Verifikasi token melalui User Service
    const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/verify`, { token });
    
    // Tetapkan data pengguna ke request
    req.user = response.data.user;
    
    // Lanjutkan ke handler berikutnya
    next();
  } catch (error) {
    console.error('Token tidak valid:', error.message);
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Middleware untuk memeriksa apakah pengguna memiliki role tertentu
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).render('error', {
      user: req.user,
      error: {
        status: 403,
        message: 'Anda tidak memiliki akses ke halaman ini'
      }
    });
  };
};

// Halaman Login
router.get('/login', (req, res) => {
  // Redirect ke halaman utama jika sudah login
  if (req.cookies?.token) {
    return res.redirect('/');
  }
  
  res.render('login', {
    title: 'Login - Production Planning Service',
    error: null
  });
});

// Proses Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validasi input
    if (!username || !password) {
      return res.render('login', {
        title: 'Login - Production Planning Service',
        error: 'Username dan password harus diisi'
      });
    }
    
    // Kirim permintaan login ke User Service
    const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/login`, {
      username,
      password
    });
    
    // Simpan token di cookie
    res.cookie('token', response.data.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 hari
    });
    
    // Redirect ke halaman utama
    return res.redirect('/');
  } catch (error) {
    console.error('Error login:', error.message);
    
    // Tampilkan pesan error
    return res.render('login', {
      title: 'Login - Production Planning Service',
      error: 'Username atau password salah'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  // Hapus cookie token
  res.clearCookie('token');
  
  // Redirect ke halaman login
  return res.redirect('/login');
});

// Dashboard utama - Menampilkan ringkasan perencanaan produksi
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Dapatkan statistik perencanaan produksi
    const plans = await ProductionPlan.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Hitung jumlah rencana berdasarkan status
    const draftCount = await ProductionPlan.count({ where: { status: 'draft' } });
    const submittedCount = await ProductionPlan.count({ where: { status: 'submitted' } });
    const approvedCount = await ProductionPlan.count({ where: { status: 'approved' } });
    const inProgressCount = await ProductionPlan.count({ where: { status: 'in_progress' } });
    const completedCount = await ProductionPlan.count({ where: { status: 'completed' } });
    const cancelledCount = await ProductionPlan.count({ where: { status: 'cancelled' } });
    
    // Dapatkan daftar permintaan produksi terbaru dari Production Management Service
    let recentRequests = [];
    try {
      const response = await axios.get(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/production?limit=5`, {
        headers: {
          'Authorization': `Bearer ${req.cookies.token}`
        }
      });
      recentRequests = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan permintaan produksi terbaru:', error.message);
    }
    
    res.render('dashboard', {
      title: 'Dashboard - Production Planning Service',
      user: req.user,
      plans,
      recentRequests,
      stats: {
        draft: draftCount,
        submitted: submittedCount,
        approved: approvedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount,
        total: draftCount + submittedCount + approvedCount + inProgressCount + completedCount + cancelledCount
      }
    });
  } catch (error) {
    console.error('Error dashboard:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Daftar semua rencana produksi
router.get('/plans', isAuthenticated, async (req, res) => {
  try {
    // Dapatkan query filter
    const { status, priority, q } = req.query;
    
    // Buat filter untuk query
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (q) {
      filter[Sequelize.Op.or] = [
        { planId: { [Sequelize.Op.like]: `%${q}%` } },
        { productName: { [Sequelize.Op.like]: `%${q}%` } },
        { productionRequestId: { [Sequelize.Op.like]: `%${q}%` } }
      ];
    }
    
    // Dapatkan semua rencana produksi
    const plans = await ProductionPlan.findAll({
      where: filter,
      order: [['createdAt', 'DESC']]
    });
    
    res.render('plans/index', {
      title: 'Daftar Rencana Produksi',
      user: req.user,
      plans,
      filter: { status, priority, q }
    });
  } catch (error) {
    console.error('Error daftar rencana produksi:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Form tambah rencana produksi
router.get('/plans/create', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    // Dapatkan daftar permintaan produksi dari Production Management Service
    let productionRequests = [];
    try {
      const response = await axios.get(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/production`, {
        headers: {
          'Authorization': `Bearer ${req.cookies.token}`
        }
      });
      productionRequests = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan permintaan produksi:', error.message);
    }
    
    res.render('plans/create', {
      title: 'Tambah Rencana Produksi',
      user: req.user,
      productionRequests
    });
  } catch (error) {
    console.error('Error form tambah rencana produksi:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Simpan rencana produksi baru
router.post('/plans', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    const {
      requestId,
      productName,
      plannedStartDate,
      plannedEndDate,
      priority,
      planningNotes
    } = req.body;
    
    // Validasi data masukan
    if (!requestId || !productName) {
      return res.status(400).render('plans/create', {
        title: 'Tambah Rencana Produksi',
        user: req.user,
        error: 'ID permintaan dan nama produk diperlukan',
        input: req.body
      });
    }
    
    // Buat ID rencana unik
    const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Buat rencana produksi
    await ProductionPlan.create({
      planId,
      requestId,
      productionRequestId: requestId,
      productName,
      plannedStartDate,
      plannedEndDate,
      priority: priority || 'normal',
      status: 'draft',
      planningNotes
    });
    
    // Redirect ke daftar rencana produksi
    return res.redirect('/plans');
  } catch (error) {
    console.error('Error simpan rencana produksi:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Detail rencana produksi
router.get('/plans/:id', isAuthenticated, async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId, {
      include: [
        {
          model: CapacityPlan,
          as: 'capacityPlans'
        },
        {
          model: MaterialPlan,
          as: 'materialPlans'
        }
      ]
    });
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    // Dapatkan detail permintaan produksi dari Production Management Service
    let productionRequest = null;
    try {
      const response = await axios.get(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/production/${plan.requestId}`, {
        headers: {
          'Authorization': `Bearer ${req.cookies.token}`
        }
      });
      productionRequest = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan detail permintaan produksi:', error.message);
    }
    
    res.render('plans/detail', {
      title: `Detail Rencana Produksi - ${plan.planId}`,
      user: req.user,
      plan,
      productionRequest
    });
  } catch (error) {
    console.error('Error detail rencana produksi:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Form edit rencana produksi
router.get('/plans/:id/edit', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    res.render('plans/edit', {
      title: `Edit Rencana Produksi - ${plan.planId}`,
      user: req.user,
      plan
    });
  } catch (error) {
    console.error('Error form edit rencana produksi:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Update rencana produksi
router.post('/plans/:id/update', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    const planId = req.params.id;
    const {
      plannedStartDate,
      plannedEndDate,
      priority,
      status,
      planningNotes,
      totalCapacityRequired,
      totalMaterialCost,
      plannedBatches
    } = req.body;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    // Update bidang
    const updateData = {};
    if (plannedStartDate) updateData.plannedStartDate = plannedStartDate;
    if (plannedEndDate) updateData.plannedEndDate = plannedEndDate;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (planningNotes !== undefined) updateData.planningNotes = planningNotes;
    if (totalCapacityRequired) updateData.totalCapacityRequired = totalCapacityRequired;
    if (totalMaterialCost) updateData.totalMaterialCost = totalMaterialCost;
    if (plannedBatches) updateData.plannedBatches = plannedBatches;
    
    // Update rencana
    await plan.update(updateData);
    
    // Redirect ke detail rencana produksi
    return res.redirect(`/plans/${planId}`);
  } catch (error) {
    console.error('Error update rencana produksi:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Form tambah rencana kapasitas
router.get('/plans/:id/capacity/add', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    // Dapatkan daftar tipe mesin dari Machine Queue Service
    let machineTypes = [];
    try {
      const response = await axios.get(`${process.env.MACHINE_QUEUE_URL}/api/machines/types`, {
        headers: {
          'Authorization': `Bearer ${req.cookies.token}`
        }
      });
      machineTypes = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan daftar tipe mesin:', error.message);
    }
    
    res.render('plans/add_capacity', {
      title: `Tambah Rencana Kapasitas - ${plan.planId}`,
      user: req.user,
      plan,
      machineTypes
    });
  } catch (error) {
    console.error('Error form tambah rencana kapasitas:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Simpan rencana kapasitas
router.post('/plans/:id/capacity', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    const planId = req.params.id;
    const {
      machineType,
      hoursRequired,
      startDate,
      endDate,
      plannedMachineId,
      notes
    } = req.body;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    // Validasi input
    if (!machineType || !hoursRequired) {
      return res.status(400).render('plans/add_capacity', {
        title: `Tambah Rencana Kapasitas - ${plan.planId}`,
        user: req.user,
        plan,
        machineTypes: [],
        error: 'Tipe mesin dan jam yang dibutuhkan harus diisi',
        input: req.body
      });
    }
    
    // Buat rencana kapasitas
    await CapacityPlan.create({
      planId: plan.id,
      machineType,
      hoursRequired,
      startDate,
      endDate,
      plannedMachineId,
      status: 'planned',
      notes
    });
    
    // Redirect ke detail rencana produksi
    return res.redirect(`/plans/${planId}`);
  } catch (error) {
    console.error('Error simpan rencana kapasitas:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Form tambah rencana material
router.get('/plans/:id/material/add', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    // Dapatkan daftar material dari Material Inventory Service
    let materials = [];
    try {
      const response = await axios.get(`${process.env.MATERIAL_INVENTORY_URL}/api/materials`, {
        headers: {
          'Authorization': `Bearer ${req.cookies.token}`
        }
      });
      materials = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan daftar material:', error.message);
    }
    
    res.render('plans/add_material', {
      title: `Tambah Rencana Material - ${plan.planId}`,
      user: req.user,
      plan,
      materials
    });
  } catch (error) {
    console.error('Error form tambah rencana material:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Simpan rencana material
router.post('/plans/:id/material', isAuthenticated, hasRole(['admin', 'planner']), async (req, res) => {
  try {
    const planId = req.params.id;
    const {
      materialId,
      materialName,
      quantityRequired,
      unitOfMeasure,
      unitCost,
      notes
    } = req.body;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    // Validasi input
    if (!materialId || !materialName || !quantityRequired || !unitOfMeasure) {
      return res.status(400).render('plans/add_material', {
        title: `Tambah Rencana Material - ${plan.planId}`,
        user: req.user,
        plan,
        materials: [],
        error: 'ID material, nama, jumlah, dan satuan harus diisi',
        input: req.body
      });
    }
    
    // Hitung total biaya jika ada biaya satuan
    const totalCost = unitCost ? parseFloat(unitCost) * parseFloat(quantityRequired) : null;
    
    // Buat rencana material
    await MaterialPlan.create({
      planId: plan.id,
      materialId,
      materialName,
      quantityRequired,
      unitOfMeasure,
      unitCost,
      totalCost,
      status: 'planned',
      availabilityChecked: false,
      notes
    });
    
    // Redirect ke detail rencana produksi
    return res.redirect(`/plans/${planId}`);
  } catch (error) {
    console.error('Error simpan rencana material:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Setujui rencana produksi
router.post('/plans/:id/approve', isAuthenticated, hasRole(['admin', 'manager']), async (req, res) => {
  try {
    const planId = req.params.id;
    const { notes } = req.body;
    
    // Dapatkan detail rencana produksi
    const plan = await ProductionPlan.findByPk(planId, {
      include: [
        {
          model: CapacityPlan,
          as: 'capacityPlans'
        },
        {
          model: MaterialPlan,
          as: 'materialPlans'
        }
      ]
    });
    
    if (!plan) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Rencana produksi tidak ditemukan'
        }
      });
    }
    
    // Validasi apakah rencana sudah memiliki detail kapasitas dan material
    if (!plan.capacityPlans || plan.capacityPlans.length === 0) {
      return res.status(400).render('plans/detail', {
        title: `Detail Rencana Produksi - ${plan.planId}`,
        user: req.user,
        plan,
        productionRequest: null,
        error: 'Rencana kapasitas belum dibuat'
      });
    }
    
    if (!plan.materialPlans || plan.materialPlans.length === 0) {
      return res.status(400).render('plans/detail', {
        title: `Detail Rencana Produksi - ${plan.planId}`,
        user: req.user,
        plan,
        productionRequest: null,
        error: 'Rencana material belum dibuat'
      });
    }
    
    // Perbarui status rencana
    await plan.update({
      status: 'approved',
      approvedBy: req.user.username,
      approvalDate: new Date(),
      planningNotes: notes ? `${plan.planningNotes || ''}\n${notes}` : plan.planningNotes
    });
    
    // Buat batch produksi di Production Management Service
    try {
      // Siapkan data langkah-langkah produksi dari rencana kapasitas
      const steps = plan.capacityPlans.map(capacity => ({
        stepName: `Operasi ${capacity.machineType}`,
        machineType: capacity.machineType,
        scheduledStartTime: capacity.startDate,
        scheduledEndTime: capacity.endDate
      }));
      
      // Siapkan data material dari rencana material
      const materials = plan.materialPlans.map(material => ({
        materialId: material.materialId,
        quantityRequired: material.quantityRequired,
        unitOfMeasure: material.unitOfMeasure
      }));
      
      // Kirim permintaan ke Production Management Service
      await axios.post(
        `${process.env.PRODUCTION_MANAGEMENT_URL}/api/batches`,
        {
          requestId: plan.requestId,
          quantity: plan.plannedBatches || 1,
          scheduledStartDate: plan.plannedStartDate,
          scheduledEndDate: plan.plannedEndDate,
          notes: `Dibuat dari rencana produksi ${plan.planId}`,
          steps,
          materials
        },
        {
          headers: {
            'Authorization': `Bearer ${req.cookies.token}`
          }
        }
      );
    } catch (error) {
      console.error('Gagal membuat batch produksi:', error.message);
      
      // Tampilkan pesan kesalahan tetapi tetap lanjutkan (batch gagal dibuat tetapi rencana tetap disetujui)
      return res.render('plans/detail', {
        title: `Detail Rencana Produksi - ${plan.planId}`,
        user: req.user,
        plan,
        productionRequest: null,
        warning: 'Rencana produksi disetujui tetapi gagal membuat batch produksi: ' + error.message
      });
    }
    
    // Redirect ke detail rencana produksi
    return res.redirect(`/plans/${planId}`);
  } catch (error) {
    console.error('Error menyetujui rencana produksi:', error);
    res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

module.exports = router;
