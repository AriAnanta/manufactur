/**
 * Controller Planning
 * 
 * Mengelola operasi terkait perencanaan produksi
 */
const { ProductionPlan, CapacityPlan, MaterialPlan } = require('../models');
const axios = require('axios');

/**
 * Mendapatkan semua rencana produksi
 */
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(plans);
  } catch (error) {
    console.error('Error mengambil rencana produksi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Mendapatkan detail rencana produksi berdasarkan ID
 */
exports.getPlanById = async (req, res) => {
  try {
    const plan = await ProductionPlan.findByPk(req.params.id, {
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
      return res.status(404).json({ message: 'Rencana produksi tidak ditemukan' });
    }
    
    return res.status(200).json(plan);
  } catch (error) {
    console.error('Error mengambil detail rencana produksi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Menerima notifikasi permintaan produksi baru dari Production Management Service
 */
exports.receiveNotification = async (req, res) => {
  try {
    const { requestId, priority, dueDate } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ message: 'ID permintaan diperlukan' });
    }
    
    // Dapatkan detail permintaan dari Production Management Service
    let request;
    try {
      const response = await axios.get(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/production/${requestId}`);
      request = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan detail permintaan:', error.message);
      return res.status(404).json({ message: 'Detail permintaan tidak ditemukan' });
    }
    
    // Buat ID rencana unik
    const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Buat rencana produksi awal
    const newPlan = await ProductionPlan.create({
      planId,
      requestId,
      productionRequestId: request.requestId,
      productName: request.productName,
      priority: priority || request.priority,
      plannedStartDate: new Date(),
      plannedEndDate: dueDate || request.dueDate,
      status: 'draft',
      planningNotes: 'Rencana dibuat otomatis dari notifikasi permintaan baru'
    });
    
    // Mulai proses perencanaan
    setTimeout(() => {
      planProduction(newPlan.id);
    }, 100);
    
    return res.status(201).json({
      message: 'Notifikasi diterima dan rencana produksi dibuat',
      planId: newPlan.id
    });
  } catch (error) {
    console.error('Error menerima notifikasi permintaan:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Menerima pembaruan permintaan produksi dari Production Management Service
 */
exports.receiveUpdate = async (req, res) => {
  try {
    const { requestId, priority, status } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ message: 'ID permintaan diperlukan' });
    }
    
    // Cari rencana produksi terkait
    const plan = await ProductionPlan.findOne({
      where: { requestId }
    });
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana produksi tidak ditemukan' });
    }
    
    // Update rencana produksi berdasarkan perubahan permintaan
    const updateData = {};
    
    if (priority) {
      updateData.priority = priority;
    }
    
    if (status === 'cancelled') {
      updateData.status = 'cancelled';
    }
    
    await plan.update(updateData);
    
    return res.status(200).json({
      message: 'Rencana produksi diperbarui berdasarkan perubahan permintaan',
      planId: plan.id
    });
  } catch (error) {
    console.error('Error memperbarui rencana produksi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Membuat rencana produksi baru secara manual
 */
exports.createPlan = async (req, res) => {
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
      return res.status(400).json({ message: 'ID permintaan dan nama produk diperlukan' });
    }
    
    // Buat ID rencana unik
    const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Buat rencana produksi
    const newPlan = await ProductionPlan.create({
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
    
    return res.status(201).json({
      message: 'Rencana produksi berhasil dibuat',
      plan: newPlan
    });
  } catch (error) {
    console.error('Error membuat rencana produksi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Memperbarui rencana produksi
 */
exports.updatePlan = async (req, res) => {
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
    
    // Cari rencana
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana produksi tidak ditemukan' });
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
    
    return res.status(200).json({
      message: 'Rencana produksi berhasil diperbarui',
      plan: plan
    });
  } catch (error) {
    console.error('Error memperbarui rencana produksi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Menghapus rencana produksi
 */
exports.deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Cari rencana
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana produksi tidak ditemukan' });
    }
    
    // Hapus rencana
    await plan.destroy();
    
    return res.status(200).json({
      message: 'Rencana produksi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error menghapus rencana produksi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Menyetujui rencana produksi
 */
exports.approvePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const { approvedBy, notes } = req.body;
    
    // Cari rencana
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
      return res.status(404).json({ message: 'Rencana produksi tidak ditemukan' });
    }
    
    // Validasi apakah rencana sudah memiliki detail kapasitas dan material
    if (!plan.capacityPlans || plan.capacityPlans.length === 0) {
      return res.status(400).json({ message: 'Rencana kapasitas belum dibuat' });
    }
    
    if (!plan.materialPlans || plan.materialPlans.length === 0) {
      return res.status(400).json({ message: 'Rencana material belum dibuat' });
    }
    
    // Perbarui status rencana
    await plan.update({
      status: 'approved',
      approvedBy,
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
      const response = await axios.post(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/batches`, {
        requestId: plan.requestId,
        quantity: plan.plannedBatches || 1,
        scheduledStartDate: plan.plannedStartDate,
        scheduledEndDate: plan.plannedEndDate,
        notes: `Dibuat dari rencana produksi ${plan.planId}`,
        steps,
        materials
      });
      
      // Perbarui status rencana dengan info batch yang dibuat
      await plan.update({
        planningNotes: `${plan.planningNotes || ''}\nBatch produksi dibuat dengan ID: ${response.data.batch.batchNumber}`
      });
      
      return res.status(200).json({
        message: 'Rencana produksi disetujui dan batch produksi dibuat',
        plan: plan,
        batchCreated: response.data.batch
      });
    } catch (error) {
      console.error('Gagal membuat batch produksi:', error.message);
      
      // Rencana tetap disetujui meskipun batch gagal dibuat
      return res.status(207).json({
        message: 'Rencana produksi disetujui tetapi gagal membuat batch produksi',
        plan: plan,
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error menyetujui rencana produksi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Menambahkan rencana kapasitas ke rencana produksi
 */
exports.addCapacityPlan = async (req, res) => {
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
    
    // Cari rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana produksi tidak ditemukan' });
    }
    
    // Validasi input
    if (!machineType || !hoursRequired) {
      return res.status(400).json({ message: 'Tipe mesin dan jam yang dibutuhkan harus diisi' });
    }
    
    // Buat rencana kapasitas
    const capacityPlan = await CapacityPlan.create({
      planId: plan.id,
      machineType,
      hoursRequired,
      startDate,
      endDate,
      plannedMachineId,
      status: 'planned',
      notes
    });
    
    // Periksa ketersediaan kapasitas di Machine Queue Service
    try {
      const response = await axios.post(`${process.env.MACHINE_QUEUE_URL}/api/capacity/check`, {
        machineType,
        hoursRequired,
        startDate,
        endDate
      });
      
      // Update status rencana kapasitas berdasarkan ketersediaan
      await capacityPlan.update({
        status: response.data.available ? 'confirmed' : 'planned',
        notes: response.data.available ? 
          'Kapasitas tersedia' : 
          `${notes || ''}\nPeringatan: ${response.data.message || 'Kapasitas mungkin tidak tersedia'}`
      });
    } catch (error) {
      console.error('Gagal memeriksa ketersediaan kapasitas:', error.message);
      // Tetap lanjutkan meskipun pemeriksaan gagal
    }
    
    return res.status(201).json({
      message: 'Rencana kapasitas berhasil ditambahkan',
      capacityPlan
    });
  } catch (error) {
    console.error('Error menambahkan rencana kapasitas:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Menambahkan rencana material ke rencana produksi
 */
exports.addMaterialPlan = async (req, res) => {
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
    
    // Cari rencana produksi
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana produksi tidak ditemukan' });
    }
    
    // Validasi input
    if (!materialId || !materialName || !quantityRequired || !unitOfMeasure) {
      return res.status(400).json({ message: 'ID material, nama, jumlah, dan satuan harus diisi' });
    }
    
    // Hitung total biaya jika ada biaya satuan
    const totalCost = unitCost ? parseFloat(unitCost) * parseFloat(quantityRequired) : null;
    
    // Buat rencana material
    const materialPlan = await MaterialPlan.create({
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
    
    // Periksa ketersediaan material di Material Inventory Service
    try {
      const response = await axios.post(`${process.env.MATERIAL_INVENTORY_URL}/api/inventory/check`, {
        materialId,
        quantity: quantityRequired
      });
      
      // Update status rencana material berdasarkan ketersediaan
      await materialPlan.update({
        status: response.data.available ? 'verified' : 'planned',
        availabilityChecked: true,
        availabilityDate: new Date(),
        notes: response.data.available ? 
          'Material tersedia' : 
          `${notes || ''}\nPeringatan: ${response.data.message || 'Material mungkin tidak tersedia'}`
      });
    } catch (error) {
      console.error('Gagal memeriksa ketersediaan material:', error.message);
      // Tetap lanjutkan meskipun pemeriksaan gagal
    }
    
    return res.status(201).json({
      message: 'Rencana material berhasil ditambahkan',
      materialPlan
    });
  } catch (error) {
    console.error('Error menambahkan rencana material:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Fungsi helper untuk otomatisasi perencanaan produksi
 */
async function planProduction(planId) {
  try {
    // Dapatkan detail rencana
    const plan = await ProductionPlan.findByPk(planId);
    
    if (!plan) {
      console.error(`Rencana dengan ID ${planId} tidak ditemukan`);
      return;
    }
    
    // Dapatkan detail permintaan dari Production Management Service
    let request;
    try {
      const response = await axios.get(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/production/${plan.requestId}`);
      request = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan detail permintaan:', error.message);
      return;
    }
    
    // Dapatkan daftar material yang dibutuhkan dari Material Inventory
    let materials;
    try {
      const response = await axios.get(`${process.env.MATERIAL_INVENTORY_URL}/api/materials/product?name=${encodeURIComponent(plan.productName)}`);
      materials = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan daftar material:', error.message);
      materials = [];
    }
    
    // Dapatkan daftar mesin yang dibutuhkan dari Machine Queue
    let machines;
    try {
      const response = await axios.get(`${process.env.MACHINE_QUEUE_URL}/api/machines/product?name=${encodeURIComponent(plan.productName)}`);
      machines = response.data;
    } catch (error) {
      console.error('Gagal mendapatkan daftar mesin:', error.message);
      machines = [];
    }
    
    // Perkirakan jumlah batch berdasarkan kuantitas
    const plannedBatches = Math.ceil(request.quantity / 100); // Asumsi 100 unit per batch
    
    // Update rencana dengan jumlah batch yang direncanakan
    await plan.update({
      plannedBatches
    });
    
    // Buat rencana material untuk setiap material yang dibutuhkan
    let totalMaterialCost = 0;
    for (const material of materials) {
      // Perkiraan kuantitas yang dibutuhkan per item
      const quantityPerItem = material.quantityPerUnit || 1;
      const totalRequired = quantityPerItem * request.quantity;
      
      // Hitung total biaya
      const totalCost = material.unitCost ? parseFloat(material.unitCost) * totalRequired : 0;
      totalMaterialCost += totalCost;
      
      // Buat rencana material
      const materialPlan = await MaterialPlan.create({
        planId: plan.id,
        materialId: material.id,
        materialName: material.name,
        quantityRequired: totalRequired,
        unitOfMeasure: material.unitOfMeasure,
        unitCost: material.unitCost,
        totalCost,
        status: 'planned',
        availabilityChecked: false,
        notes: 'Dibuat otomatis oleh sistem perencanaan'
      });
      
      // Periksa ketersediaan material
      try {
        const response = await axios.post(`${process.env.MATERIAL_INVENTORY_URL}/api/inventory/check`, {
          materialId: material.id,
          quantity: totalRequired
        });
        
        // Update status rencana material
        await materialPlan.update({
          status: response.data.available ? 'verified' : 'planned',
          availabilityChecked: true,
          availabilityDate: new Date(),
          notes: response.data.available ? 
            'Material tersedia' : 
            'Peringatan: Material mungkin tidak tersedia dalam jumlah yang cukup'
        });
      } catch (error) {
        console.error(`Gagal memeriksa ketersediaan material ${material.name}:`, error.message);
      }
    }
    
    // Buat rencana kapasitas untuk setiap mesin yang dibutuhkan
    let totalCapacityRequired = 0;
    const startDate = new Date();
    let currentDate = new Date(startDate);
    
    for (const machine of machines) {
      // Perkiraan waktu yang dibutuhkan per item dalam jam
      const hoursPerItem = machine.hoursPerUnit || 0.1;
      const totalHours = hoursPerItem * request.quantity;
      totalCapacityRequired += totalHours;
      
      // Perkiraan tanggal mulai dan selesai
      const endDate = new Date(currentDate);
      endDate.setHours(endDate.getHours() + totalHours);
      
      // Buat rencana kapasitas
      const capacityPlan = await CapacityPlan.create({
        planId: plan.id,
        machineType: machine.type,
        hoursRequired: totalHours,
        startDate: currentDate,
        endDate: endDate,
        status: 'planned',
        notes: 'Dibuat otomatis oleh sistem perencanaan'
      });
      
      // Perbarui tanggal untuk mesin berikutnya (penjadwalan sekuensial)
      currentDate = new Date(endDate);
      
      // Periksa ketersediaan kapasitas
      try {
        const response = await axios.post(`${process.env.MACHINE_QUEUE_URL}/api/capacity/check`, {
          machineType: machine.type,
          hoursRequired: totalHours,
          startDate: capacityPlan.startDate,
          endDate: capacityPlan.endDate
        });
        
        // Update status rencana kapasitas
        await capacityPlan.update({
          status: response.data.available ? 'confirmed' : 'planned',
          notes: response.data.available ? 
            'Kapasitas tersedia' : 
            'Peringatan: Kapasitas mungkin tidak tersedia dalam rentang waktu yang direncanakan'
        });
      } catch (error) {
        console.error(`Gagal memeriksa ketersediaan kapasitas untuk ${machine.type}:`, error.message);
      }
    }
    
    // Update rencana produksi dengan total kapasitas dan biaya material
    await plan.update({
      totalCapacityRequired,
      totalMaterialCost,
      plannedEndDate: currentDate, // Tanggal akhir dari mesin terakhir
      status: 'submitted',
      planningNotes: `${plan.planningNotes || ''}\nPerencanaan otomatis selesai. Total kapasitas: ${totalCapacityRequired} jam. Total biaya material: ${totalMaterialCost}.`
    });
    
    console.log(`Perencanaan otomatis untuk rencana ${plan.planId} berhasil selesai`);
  } catch (error) {
    console.error('Error dalam planProduction:', error);
  }
}
