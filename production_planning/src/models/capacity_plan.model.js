/**
 * Model Capacity Plan
 *
 * Merepresentasikan perencanaan kapasitas mesin untuk produksi
 */
module.exports = (sequelize, DataTypes) => {
  const CapacityPlan = sequelize.define(
    "CapacityPlan",
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
      machineType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      hoursRequired: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "end_date",
      },
      plannedMachineId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID referensi ke machine_queue service",
        field: "planned_machine_id",
      },
      status: {
        type: DataTypes.ENUM("planned", "confirmed", "rejected"),
        defaultValue: "planned",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "capacity_plans",
      timestamps: true,
      underscored: true,
    }
  );

  // Definisi asosiasi
  CapacityPlan.associate = (models) => {
    CapacityPlan.belongsTo(models.ProductionPlan, {
      foreignKey: "planId",
      as: "productionPlan",
      targetKey: "id",
    });
  };

  return CapacityPlan;
};
