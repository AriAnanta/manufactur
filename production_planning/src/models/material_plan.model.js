/**
 * Model Material Plan
 *
 * Merepresentasikan perencanaan kebutuhan material untuk produksi
 */
module.exports = (sequelize, DataTypes) => {
  const MaterialPlan = sequelize.define(
    "MaterialPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "production_plans",
          key: "id",
        },
        field: "plan_id",
      },
      materialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID referensi ke material_inventory service",
        field: "material_id",
      },
      materialName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "material_name",
      },
      quantityRequired: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: "quantity_required",
      },
      unitOfMeasure: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "unit_of_measure",
      },
      unitCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "unit_cost",
      },
      totalCost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "total_cost",
      },
      status: {
        type: DataTypes.ENUM("planned", "verified", "rejected"),
        defaultValue: "planned",
      },
      availabilityChecked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "availability_checked",
      },
      availabilityDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "availability_date",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "material_plans",
      timestamps: true,
      underscored: true,
    }
  );

  // Definisi asosiasi
  MaterialPlan.associate = (models) => {
    MaterialPlan.belongsTo(models.ProductionPlan, {
      foreignKey: "planId",
      as: "productionPlan",
      targetKey: "id",
    });
  };

  return MaterialPlan;
};
