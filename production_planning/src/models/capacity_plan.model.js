/**
 * Model Capacity Plan
 * 
 * Merepresentasikan perencanaan kapasitas mesin untuk produksi
 */
module.exports = (sequelize, DataTypes) => {
  const CapacityPlan = sequelize.define('CapacityPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'production_plans',
        key: 'id'
      }
    },
    machineType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    hoursRequired: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    plannedMachineId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID referensi ke machine_queue service'
    },
    status: {
      type: DataTypes.ENUM('planned', 'reserved', 'confirmed', 'cancelled'),
      defaultValue: 'planned'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'capacity_plans',
    timestamps: true
  });

  // Definisi asosiasi
  CapacityPlan.associate = (models) => {
    CapacityPlan.belongsTo(models.ProductionPlan, {
      foreignKey: 'planId',
      as: 'productionPlan'
    });
  };

  return CapacityPlan;
};
