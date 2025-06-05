/**
 * Production Request Model
 * 
 * Represents production requests from marketplace
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionRequest = sequelize.define('ProductionRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requestId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    customerId: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('received', 'planned', 'in_production', 'completed', 'cancelled'),
      defaultValue: 'received'
    },
    marketplaceData: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'production_requests',
    timestamps: true
  });

  // Define associations
  ProductionRequest.associate = (models) => {
    ProductionRequest.hasMany(models.ProductionBatch, {
      foreignKey: 'requestId',
      as: 'batches'
    });
  };

  return ProductionRequest;
};
