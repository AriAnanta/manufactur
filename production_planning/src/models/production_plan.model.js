/**
 * Model Production Plan
 *
 * Merepresentasikan rencana produksi yang dibuat berdasarkan permintaan produksi
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionPlan = sequelize.define(
    "ProductionPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      planId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "plan_id",
      },
      requestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID referensi ke production_management service",
        field: "request_id",
      },
      productionRequestId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Request ID dari production_management service",
        field: "production_request_id",
      },
      productName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "product_name",
      },
      plannedStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "planned_start_date",
      },
      plannedEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "planned_end_date",
      },
      priority: {
        type: DataTypes.ENUM("low", "normal", "high", "urgent"),
        defaultValue: "normal",
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "submitted",
          "approved",
          "in_progress",
          "completed",
          "cancelled"
        ),
        defaultValue: "draft",
      },
      planningNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "planning_notes",
      },
      totalCapacityRequired: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: "total_capacity_required",
      },
      totalMaterialCost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "total_material_cost",
      },
      plannedBatches: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "planned_batches",
      },
      approvedBy: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "approved_by",
      },
      approvalDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "approval_date",
      },
    },
    {
      tableName: "production_plans",
      timestamps: true,
      underscored: true,
    }
  );

  // Definisi asosiasi
  ProductionPlan.associate = (models) => {
    ProductionPlan.hasMany(models.CapacityPlan, {
      foreignKey: "planId",
      as: "capacityPlans",
    });

    ProductionPlan.hasMany(models.MaterialPlan, {
      foreignKey: "planId",
      as: "materialPlans",
    });
  };

  return ProductionPlan;
};
