/**
 * Production Step Model
 * 
 * Represents individual steps in a production batch
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionStep = sequelize.define('ProductionStep', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    batchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'production_batches',
        key: 'id'
      }
    },
    stepName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    stepOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    machineType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    scheduledStartTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scheduledEndTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualStartTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualEndTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    machineId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'production_steps',
    timestamps: true
  });

  // Define associations
  ProductionStep.associate = (models) => {
    ProductionStep.belongsTo(models.ProductionBatch, {
      foreignKey: 'batchId',
      as: 'batch'
    });
  };

  return ProductionStep;
};
