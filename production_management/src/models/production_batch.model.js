/**
 * Production Batch Model
 * 
 * Represents a batch of production that is created from a production request
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionBatch = sequelize.define('ProductionBatch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'production_requests',
        key: 'id'
      }
    },
    scheduledStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scheduledEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    materialsAssigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    machineAssigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'production_batches',
    timestamps: true
  });

  // Define associations
  ProductionBatch.associate = (models) => {
    ProductionBatch.belongsTo(models.ProductionRequest, {
      foreignKey: 'requestId',
      as: 'request'
    });
    
    ProductionBatch.hasMany(models.ProductionStep, {
      foreignKey: 'batchId',
      as: 'steps'
    });
    
    ProductionBatch.hasMany(models.MaterialAllocation, {
      foreignKey: 'batchId',
      as: 'materialAllocations'
    });
  };

  return ProductionBatch;
};
