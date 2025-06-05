/**
 * Model Material Plan
 * 
 * Merepresentasikan perencanaan kebutuhan material untuk produksi
 */
module.exports = (sequelize, DataTypes) => {
  const MaterialPlan = sequelize.define('MaterialPlan', {
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
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID referensi ke material_inventory service'
    },
    materialName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    quantityRequired: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    unitOfMeasure: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('planned', 'verified', 'reserved', 'unavailable'),
      defaultValue: 'planned'
    },
    availabilityChecked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    availabilityDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'material_plans',
    timestamps: true
  });

  // Definisi asosiasi
  MaterialPlan.associate = (models) => {
    MaterialPlan.belongsTo(models.ProductionPlan, {
      foreignKey: 'planId',
      as: 'productionPlan'
    });
  };

  return MaterialPlan;
};
