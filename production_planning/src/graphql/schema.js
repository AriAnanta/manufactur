/**
 * GraphQL Schema untuk Production Planning Service
 * 
 * Mendefinisikan tipe dan resolver untuk API GraphQL
 */
const { buildSchema } = require('graphql');
const { ProductionPlan, CapacityPlan, MaterialPlan } = require('../models');
const axios = require('axios');

// Mendefinisikan skema GraphQL
const schema = buildSchema(`
  type Query {
    plans: [ProductionPlan]
    plan(id: Int!): ProductionPlan
    capacityPlans(planId: Int!): [CapacityPlan]
    materialPlans(planId: Int!): [MaterialPlan]
  }

  type Mutation {
    createPlan(input: PlanInput): ProductionPlan
    updatePlan(id: Int!, input: PlanUpdateInput): ProductionPlan
    deletePlan(id: Int!): SuccessResponse
    approvePlan(id: Int!, approvedBy: String!, notes: String): ApproveResponse
    addCapacityPlan(planId: Int!, input: CapacityPlanInput): CapacityPlan
    addMaterialPlan(planId: Int!, input: MaterialPlanInput): MaterialPlan
  }

  input PlanInput {
    requestId: Int!
    productionRequestId: String!
    productName: String!
    plannedStartDate: String
    plannedEndDate: String
    priority: String
    planningNotes: String
  }

  input PlanUpdateInput {
    plannedStartDate: String
    plannedEndDate: String
    priority: String
    status: String
    planningNotes: String
    totalCapacityRequired: Float
    totalMaterialCost: Float
    plannedBatches: Int
  }

  input CapacityPlanInput {
    machineType: String!
    hoursRequired: Float!
    startDate: String
    endDate: String
    plannedMachineId: Int
    notes: String
  }

  input MaterialPlanInput {
    materialId: Int!
    materialName: String!
    quantityRequired: Float!
    unitOfMeasure: String!
    unitCost: Float
    notes: String
  }

  type SuccessResponse {
    success: Boolean
    message: String
  }

  type ApproveResponse {
    success: Boolean
    message: String
    plan: ProductionPlan
    batchCreated: BatchResponse
  }

  type BatchResponse {
    id: Int
    batchNumber: String
  }

  type ProductionPlan {
    id: Int
    planId: String
    requestId: Int
    productionRequestId: String
    productName: String
    plannedStartDate: String
    plannedEndDate: String
    priority: String
    status: String
    planningNotes: String
    totalCapacityRequired: Float
    totalMaterialCost: Float
    plannedBatches: Int
    approvedBy: String
    approvalDate: String
    createdAt: String
    updatedAt: String
    capacityPlans: [CapacityPlan]
    materialPlans: [MaterialPlan]
  }

  type CapacityPlan {
    id: Int
    planId: Int
    machineType: String
    hoursRequired: Float
    startDate: String
    endDate: String
    plannedMachineId: Int
    status: String
    notes: String
    createdAt: String
    updatedAt: String
  }

  type MaterialPlan {
    id: Int
    planId: Int
    materialId: Int
    materialName: String
    quantityRequired: Float
    unitOfMeasure: String
    unitCost: Float
    totalCost: Float
    status: String
    availabilityChecked: Boolean
    availabilityDate: String
    notes: String
    createdAt: String
    updatedAt: String
  }
`);

// Implementasi resolver
const root = {
  // Queries
  plans: async () => {
    try {
      const plans = await ProductionPlan.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      return plans.map(plan => formatPlan(plan));
    } catch (error) {
      console.error('Error mengambil rencana produksi:', error);
      throw new Error('Gagal mengambil rencana produksi');
    }
  },
  
  plan: async ({ id }) => {
    try {
      const plan = await ProductionPlan.findByPk(id, {
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
        throw new Error('Rencana produksi tidak ditemukan');
      }
      
      return formatPlan(plan);
    } catch (error) {
      console.error('Error mengambil detail rencana produksi:', error);
      throw new Error('Gagal mengambil detail rencana produksi');
    }
  },
  
  capacityPlans: async ({ planId }) => {
    try {
      const capacities = await CapacityPlan.findAll({
        where: { planId },
        order: [['createdAt', 'ASC']]
      });
      
      return capacities.map(formatCapacityPlan);
    } catch (error) {
      console.error('Error mengambil rencana kapasitas:', error);
      throw new Error('Gagal mengambil rencana kapasitas');
    }
  },
  
  materialPlans: async ({ planId }) => {
    try {
      const materials = await MaterialPlan.findAll({
        where: { planId },
        order: [['createdAt', 'ASC']]
      });
      
      return materials.map(formatMaterialPlan);
    } catch (error) {
      console.error('Error mengambil rencana material:', error);
      throw new Error('Gagal mengambil rencana material');
    }
  },
  
  // Mutations
  createPlan: async ({ input }) => {
    try {
      // Buat ID rencana unik
      const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Buat rencana produksi
      const newPlan = await ProductionPlan.create({
        planId,
        ...input,
        status: 'draft'
      });
      
      return formatPlan(newPlan);
    } catch (error) {
      console.error('Error membuat rencana produksi:', error);
      throw new Error('Gagal membuat rencana produksi');
    }
  },
  
  updatePlan: async ({ id, input }) => {
    try {
      // Cari rencana
      const plan = await ProductionPlan.findByPk(id);
      
      if (!plan) {
        throw new Error('Rencana produksi tidak ditemukan');
      }
      
      // Update rencana
      await plan.update(input);
      
      // Ambil rencana yang telah diperbarui dengan relasi
      const updatedPlan = await ProductionPlan.findByPk(id, {
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
      
      return formatPlan(updatedPlan);
    } catch (error) {
      console.error('Error memperbarui rencana produksi:', error);
      throw new Error('Gagal memperbarui rencana produksi');
    }
  },
  
  deletePlan: async ({ id }) => {
    try {
      // Cari rencana
      const plan = await ProductionPlan.findByPk(id);
      
      if (!plan) {
        throw new Error('Rencana produksi tidak ditemukan');
      }
      
      // Hapus rencana
      await plan.destroy();
      
      return {
        success: true,
        message: 'Rencana produksi berhasil dihapus'
      };
    } catch (error) {
      console.error('Error menghapus rencana produksi:', error);
      throw new Error('Gagal menghapus rencana produksi');
    }
  },
  
  approvePlan: async ({ id, approvedBy, notes }) => {
    try {
      // Cari rencana
      const plan = await ProductionPlan.findByPk(id, {
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
        throw new Error('Rencana produksi tidak ditemukan');
      }
      
      // Validasi apakah rencana sudah memiliki detail kapasitas dan material
      if (!plan.capacityPlans || plan.capacityPlans.length === 0) {
        throw new Error('Rencana kapasitas belum dibuat');
      }
      
      if (!plan.materialPlans || plan.materialPlans.length === 0) {
        throw new Error('Rencana material belum dibuat');
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
        
        // Ambil rencana yang telah diperbarui
        const updatedPlan = await ProductionPlan.findByPk(id, {
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
        
        return {
          success: true,
          message: 'Rencana produksi disetujui dan batch produksi dibuat',
          plan: formatPlan(updatedPlan),
          batchCreated: {
            id: response.data.batch.id,
            batchNumber: response.data.batch.batchNumber
          }
        };
      } catch (error) {
        console.error('Gagal membuat batch produksi:', error.message);
        
        // Rencana tetap disetujui meskipun batch gagal dibuat
        return {
          success: true,
          message: 'Rencana produksi disetujui tetapi gagal membuat batch produksi',
          plan: formatPlan(plan),
          batchCreated: null
        };
      }
    } catch (error) {
      console.error('Error menyetujui rencana produksi:', error);
      throw new Error(`Gagal menyetujui rencana produksi: ${error.message}`);
    }
  },
  
  addCapacityPlan: async ({ planId, input }) => {
    try {
      // Cari rencana produksi
      const plan = await ProductionPlan.findByPk(planId);
      
      if (!plan) {
        throw new Error('Rencana produksi tidak ditemukan');
      }
      
      // Buat rencana kapasitas
      const capacityPlan = await CapacityPlan.create({
        planId,
        ...input,
        status: 'planned'
      });
      
      // Periksa ketersediaan kapasitas di Machine Queue Service
      try {
        const response = await axios.post(`${process.env.MACHINE_QUEUE_URL}/api/capacity/check`, {
          machineType: input.machineType,
          hoursRequired: input.hoursRequired,
          startDate: input.startDate,
          endDate: input.endDate
        });
        
        // Update status rencana kapasitas berdasarkan ketersediaan
        await capacityPlan.update({
          status: response.data.available ? 'confirmed' : 'planned',
          notes: response.data.available ? 
            'Kapasitas tersedia' : 
            `${input.notes || ''}\nPeringatan: ${response.data.message || 'Kapasitas mungkin tidak tersedia'}`
        });
      } catch (error) {
        console.error('Gagal memeriksa ketersediaan kapasitas:', error.message);
        // Tetap lanjutkan meskipun pemeriksaan gagal
      }
      
      return formatCapacityPlan(capacityPlan);
    } catch (error) {
      console.error('Error menambahkan rencana kapasitas:', error);
      throw new Error('Gagal menambahkan rencana kapasitas');
    }
  },
  
  addMaterialPlan: async ({ planId, input }) => {
    try {
      // Cari rencana produksi
      const plan = await ProductionPlan.findByPk(planId);
      
      if (!plan) {
        throw new Error('Rencana produksi tidak ditemukan');
      }
      
      // Hitung total biaya jika ada biaya satuan
      const totalCost = input.unitCost ? parseFloat(input.unitCost) * parseFloat(input.quantityRequired) : null;
      
      // Buat rencana material
      const materialPlan = await MaterialPlan.create({
        planId,
        ...input,
        totalCost,
        status: 'planned',
        availabilityChecked: false
      });
      
      // Periksa ketersediaan material di Material Inventory Service
      try {
        const response = await axios.post(`${process.env.MATERIAL_INVENTORY_URL}/api/inventory/check`, {
          materialId: input.materialId,
          quantity: input.quantityRequired
        });
        
        // Update status rencana material berdasarkan ketersediaan
        await materialPlan.update({
          status: response.data.available ? 'verified' : 'planned',
          availabilityChecked: true,
          availabilityDate: new Date(),
          notes: response.data.available ? 
            'Material tersedia' : 
            `${input.notes || ''}\nPeringatan: ${response.data.message || 'Material mungkin tidak tersedia'}`
        });
      } catch (error) {
        console.error('Gagal memeriksa ketersediaan material:', error.message);
        // Tetap lanjutkan meskipun pemeriksaan gagal
      }
      
      return formatMaterialPlan(materialPlan);
    } catch (error) {
      console.error('Error menambahkan rencana material:', error);
      throw new Error('Gagal menambahkan rencana material');
    }
  }
};

// Helper untuk memformat tanggal dalam rencana produksi
function formatPlan(plan) {
  const formatted = {
    ...plan.dataValues,
    plannedStartDate: plan.plannedStartDate ? plan.plannedStartDate.toISOString() : null,
    plannedEndDate: plan.plannedEndDate ? plan.plannedEndDate.toISOString() : null,
    approvalDate: plan.approvalDate ? plan.approvalDate.toISOString() : null,
    createdAt: plan.createdAt ? plan.createdAt.toISOString() : null,
    updatedAt: plan.updatedAt ? plan.updatedAt.toISOString() : null
  };
  
  // Format relasi jika ada
  if (plan.capacityPlans) {
    formatted.capacityPlans = plan.capacityPlans.map(formatCapacityPlan);
  }
  
  if (plan.materialPlans) {
    formatted.materialPlans = plan.materialPlans.map(formatMaterialPlan);
  }
  
  return formatted;
}

// Helper untuk memformat tanggal dalam rencana kapasitas
function formatCapacityPlan(capacity) {
  return {
    ...capacity.dataValues,
    startDate: capacity.startDate ? capacity.startDate.toISOString() : null,
    endDate: capacity.endDate ? capacity.endDate.toISOString() : null,
    createdAt: capacity.createdAt ? capacity.createdAt.toISOString() : null,
    updatedAt: capacity.updatedAt ? capacity.updatedAt.toISOString() : null
  };
}

// Helper untuk memformat tanggal dalam rencana material
function formatMaterialPlan(material) {
  return {
    ...material.dataValues,
    availabilityDate: material.availabilityDate ? material.availabilityDate.toISOString() : null,
    createdAt: material.createdAt ? material.createdAt.toISOString() : null,
    updatedAt: material.updatedAt ? material.updatedAt.toISOString() : null
  };
}

module.exports = {
  schema,
  root
};
