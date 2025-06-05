/**
 * Material Allocation Model
 * 
 * Represents materials allocated to a production batch
 */
module.exports = (sequelize, DataTypes) => {
  const MaterialAllocation = sequelize.define('MaterialAllocation', {
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
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to material_inventory service'
    },
    quantityRequired: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    quantityAllocated: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    unitOfMeasure: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'allocated', 'consumed'),
      defaultValue: 'pending'
    },
    allocationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'material_allocations',
    timestamps: true
  });

  // Define associations
  MaterialAllocation.associate = (models) => {
    MaterialAllocation.belongsTo(models.ProductionBatch, {
      foreignKey: 'batchId',
      as: 'batch'
    });
  };

  return MaterialAllocation;
};
