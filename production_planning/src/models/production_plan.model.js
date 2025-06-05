/**
 * Model Production Plan
 * 
 * Merepresentasikan rencana produksi yang dibuat berdasarkan permintaan produksi
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionPlan = sequelize.define('ProductionPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    planId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID referensi ke production_management service'
    },
    productionRequestId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Request ID dari production_management service'
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    plannedStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    plannedEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'draft'
    },
    planningNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    totalCapacityRequired: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    totalMaterialCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    plannedBatches: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'production_plans',
    timestamps: true
  });

  // Definisi asosiasi
  ProductionPlan.associate = (models) => {
    ProductionPlan.hasMany(models.CapacityPlan, {
      foreignKey: 'planId',
      as: 'capacityPlans'
    });
    
    ProductionPlan.hasMany(models.MaterialPlan, {
      foreignKey: 'planId',
      as: 'materialPlans'
    });
  };

  return ProductionPlan;
};
