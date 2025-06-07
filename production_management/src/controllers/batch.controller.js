/**
 * Batch Controller
 *
 * Handles operations related to production batches
 */
const {
  ProductionBatch,
  ProductionRequest,
  ProductionStep,
  MaterialAllocation,
} = require("../models");
const axios = require("axios");

/**
 * Get all production batches
 */
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await ProductionBatch.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: ProductionRequest,
          as: "request",
          attributes: ["requestId", "productName", "customerId", "priority"],
        },
      ],
    });

    return res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching production batches:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get production batch by ID
 */
exports.getBatchById = async (req, res) => {
  try {
    const batch = await ProductionBatch.findByPk(req.params.id, {
      include: [
        {
          model: ProductionRequest,
          as: "request",
        },
        {
          model: ProductionStep,
          as: "steps",
          order: [["stepOrder", "ASC"]],
        },
        {
          model: MaterialAllocation,
          as: "materialAllocations",
          attributes: [
            "id",
            ["batch_id", "batchId"],
            "materialId",
            "quantityRequired",
            "quantityAllocated",
            "unitOfMeasure",
            "status",
            "allocationDate",
            "notes",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    return res.status(200).json(batch);
  } catch (error) {
    console.error("Error fetching production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new production batch
 */
exports.createBatch = async (req, res) => {
  try {
    const {
      requestId,
      quantity,
      scheduledStartDate,
      scheduledEndDate,
      notes,
      steps,
      materials,
    } = req.body;

    // Find the production request
    const request = await ProductionRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ message: "Production request not found" });
    }

    // Generate batch number
    const batchNumber = `B${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the production batch
    const newBatch = await ProductionBatch.create({
      batchNumber,
      request_id: request.id,
      quantity,
      scheduledStartDate,
      scheduledEndDate,
      notes,
      status: "pending",
    });

    // Create production steps if provided
    if (steps && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await ProductionStep.create({
          batchId: newBatch.id,
          stepName: step.stepName,
          stepOrder: i + 1,
          machineType: step.machineType,
          scheduledStartTime: step.scheduledStartTime,
          scheduledEndTime: step.scheduledEndTime,
          status: "pending",
        });
      }
    }

    // Create material allocations if provided
    if (materials && materials.length > 0) {
      for (const material of materials) {
        await MaterialAllocation.create({
          batchId: newBatch.id,
          materialId: material.materialId,
          quantityRequired: material.quantityRequired,
          unitOfMeasure: material.unitOfMeasure,
          status: "pending",
        });
      }
    }

    // Update the request status to 'planned'
    await request.update({ status: "planned" });

    // Notify the Material Inventory Service
    try {
      if (materials && materials.length > 0) {
        await axios.post(
          `${process.env.MATERIAL_INVENTORY_URL}/api/inventory/reserve`,
          {
            batchId: newBatch.id,
            materials: materials,
          }
        );
      }
    } catch (error) {
      console.error(
        "Failed to notify Material Inventory Service:",
        error.message
      );
      // Continue execution even if notification fails
    }

    // Notify the Machine Queue Service
    try {
      if (steps && steps.length > 0) {
        await axios.post(`${process.env.MACHINE_QUEUE_URL}/api/queue/add`, {
          batchId: newBatch.id,
          batchNumber: newBatch.batchNumber,
          requestId: request.requestId,
          productName: request.productName,
          priority: request.priority,
          steps: steps.map((s, i) => ({
            stepId: i + 1,
            stepName: s.stepName,
            machineType: s.machineType,
            scheduledStartTime: s.scheduledStartTime,
            scheduledEndTime: s.scheduledEndTime,
          })),
        });
      }
    } catch (error) {
      console.error("Failed to notify Machine Queue Service:", error.message);
      // Continue execution even if notification fails
    }

    // Return the created batch with associations
    return await ProductionBatch.findByPk(newBatch.id, {
      include: [
        {
          model: ProductionRequest,
          as: "request",
        },
        {
          model: ProductionStep,
          as: "steps",
          order: [["stepOrder", "ASC"]],
        },
        {
          model: MaterialAllocation,
          as: "materialAllocations",
          attributes: [
            "id",
            ["batch_id", "batchId"],
            "materialId",
            "quantityRequired",
            "quantityAllocated",
            "unitOfMeasure",
            "status",
            "allocationDate",
            "notes",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Error creating production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a production batch
 */
exports.updateBatch = async (req, res) => {
  try {
    const batchId = req.params.id;
    const {
      scheduledStartDate,
      scheduledEndDate,
      actualStartDate,
      actualEndDate,
      status,
      notes,
      quantity,
    } = req.body;

    // Find the batch
    const batch = await ProductionBatch.findByPk(batchId);

    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    // Update fields
    const updateData = {};
    if (scheduledStartDate) updateData.scheduledStartDate = scheduledStartDate;
    if (scheduledEndDate) updateData.scheduledEndDate = scheduledEndDate;
    if (actualStartDate) updateData.actualStartDate = actualStartDate;
    if (actualEndDate) updateData.actualEndDate = actualEndDate;
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (quantity) updateData.quantity = quantity;

    // Update batch
    await batch.update(updateData);

    // If status changed to 'in_progress', update request status and notify Feedback Service
    if (status === "in_progress") {
      const request = await ProductionRequest.findByPk(batch.requestId);
      if (request) {
        await request.update({ status: "in_production" });

        // Notify the Production Feedback Service
        try {
          await axios.post(
            `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
            {
              requestId: request.requestId,
              status: "in_production",
              notes: `Batch ${batch.batchNumber} started production`,
            }
          );
        } catch (error) {
          console.error("Failed to notify Feedback Service:", error.message);
          // Continue execution even if notification fails
        }
      }
    }

    // If status changed to 'completed', check if all batches are completed to update request status
    if (status === "completed") {
      const request = await ProductionRequest.findByPk(batch.requestId);
      if (request) {
        const allBatches = await ProductionBatch.findAll({
          where: { requestId: batch.requestId },
        });

        const allCompleted = allBatches.every(
          (b) => b.status === "completed" || b.status === "cancelled"
        );

        if (allCompleted) {
          await request.update({ status: "completed" });

          // Notify the Production Feedback Service
          try {
            await axios.post(
              `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
              {
                requestId: request.requestId,
                status: "completed",
                notes: "All batches completed",
              }
            );
          } catch (error) {
            console.error("Failed to notify Feedback Service:", error.message);
            // Continue execution even if notification fails
          }
        }
      }
    }

    return res.status(200).json({
      message: "Production batch updated successfully",
      batch: batch,
    });
  } catch (error) {
    console.error("Error updating production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get production steps for a batch
 */
exports.getBatchSteps = async (req, res) => {
  try {
    const { batchId } = req.params;

    const steps = await ProductionStep.findAll({
      where: { batch_id: batchId },
      order: [["stepOrder", "ASC"]],
    });

    return res.status(200).json(steps);
  } catch (error) {
    console.error("Error fetching batch steps:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new production step
 */
exports.createProductionStep = async (req, res) => {
  try {
    const { batchId } = req.params;
    const {
      stepName,
      stepOrder,
      machineType,
      scheduledStartTime,
      scheduledEndTime,
      notes,
    } = req.body;

    // Validate batch exists
    const batch = await ProductionBatch.findByPk(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    // Check if step order already exists
    const existingStep = await ProductionStep.findOne({
      where: { batch_id: batchId, stepOrder },
    });

    if (existingStep) {
      return res.status(400).json({
        message: "Step order already exists for this batch",
      });
    }

    const newStep = await ProductionStep.create({
      batch_id: batchId,
      stepName,
      stepOrder,
      machineType,
      scheduledStartTime,
      scheduledEndTime,
      notes,
      status: "pending",
    });

    return res.status(201).json({
      message: "Production step created successfully",
      step: newStep,
    });
  } catch (error) {
    console.error("Error creating production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a production step
 */
exports.updateProductionStep = async (req, res) => {
  try {
    const { batchId, stepId } = req.params;
    const updateData = req.body;

    const step = await ProductionStep.findOne({
      where: { id: stepId, batch_id: batchId },
    });

    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    await step.update(updateData);

    return res.status(200).json({
      message: "Production step updated successfully",
      step: step,
    });
  } catch (error) {
    console.error("Error updating production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a production step
 */
exports.deleteProductionStep = async (req, res) => {
  try {
    const { batchId, stepId } = req.params;

    const step = await ProductionStep.findOne({
      where: { id: stepId, batch_id: batchId },
    });

    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    if (step.status === "in_progress" || step.status === "completed") {
      return res.status(400).json({
        message: "Cannot delete step that is in progress or completed",
      });
    }

    await step.destroy();

    return res.status(200).json({
      message: "Production step deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Start a production step
 */
exports.startProductionStep = async (req, res) => {
  try {
    const { batchId, stepId } = req.params;
    const { machineId, operatorId } = req.body;

    const step = await ProductionStep.findOne({
      where: { id: stepId, batch_id: batchId },
    });

    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    if (step.status !== "pending" && step.status !== "scheduled") {
      return res.status(400).json({
        message: "Step cannot be started in current status",
      });
    }

    await step.update({
      status: "in_progress",
      actualStartTime: new Date(),
      machine_id: machineId,
      operator_id: operatorId,
    });

    // Update batch status if this is the first step
    const batch = await ProductionBatch.findByPk(batchId);
    if (batch.status === "pending" || batch.status === "scheduled") {
      await batch.update({
        status: "in_progress",
        actualStartDate: new Date(),
      });
    }

    return res.status(200).json({
      message: "Production step started successfully",
      step: step,
    });
  } catch (error) {
    console.error("Error starting production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Complete a production step
 */
exports.completeProductionStep = async (req, res) => {
  try {
    const { batchId, stepId } = req.params;
    const { notes } = req.body;

    const step = await ProductionStep.findOne({
      where: { id: stepId, batch_id: batchId },
    });

    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    if (step.status !== "in_progress") {
      return res.status(400).json({
        message: "Step must be in progress to complete",
      });
    }

    await step.update({
      status: "completed",
      actualEndTime: new Date(),
      notes: notes || step.notes,
    });

    // Check if all steps are completed to update batch status
    const allSteps = await ProductionStep.findAll({
      where: { batch_id: batchId },
    });

    const allCompleted = allSteps.every((s) => s.status === "completed");
    if (allCompleted) {
      const batch = await ProductionBatch.findByPk(batchId);
      await batch.update({
        status: "completed",
        actualEndDate: new Date(),
      });
    }

    return res.status(200).json({
      message: "Production step completed successfully",
      step: step,
    });
  } catch (error) {
    console.error("Error completing production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get material allocations for a batch
 */
exports.getBatchMaterials = async (req, res) => {
  try {
    const { batchId } = req.params;

    const materials = await MaterialAllocation.findAll({
      where: { batch_id: batchId },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching batch materials:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new material allocation
 */
exports.createMaterialAllocation = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { materialId, quantityRequired, unitOfMeasure, notes } = req.body;

    // Validate batch exists
    const batch = await ProductionBatch.findByPk(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    // Check if material is already allocated to this batch
    const existingAllocation = await MaterialAllocation.findOne({
      where: { batch_id: batchId, materialId },
    });

    if (existingAllocation) {
      return res.status(400).json({
        message: "Material already allocated to this batch",
      });
    }

    const newAllocation = await MaterialAllocation.create({
      batch_id: batchId,
      materialId,
      quantityRequired,
      quantityAllocated: 0,
      unitOfMeasure,
      notes,
      status: "pending",
    });

    return res.status(201).json({
      message: "Material allocation created successfully",
      allocation: newAllocation,
    });
  } catch (error) {
    console.error("Error creating material allocation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a material allocation
 */
exports.updateMaterialAllocation = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;
    const updateData = req.body;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    await allocation.update(updateData);

    return res.status(200).json({
      message: "Material allocation updated successfully",
      allocation: allocation,
    });
  } catch (error) {
    console.error("Error updating material allocation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a material allocation
 */
exports.deleteMaterialAllocation = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    if (allocation.status === "allocated" || allocation.status === "consumed") {
      return res.status(400).json({
        message:
          "Cannot delete allocation that is already allocated or consumed",
      });
    }

    await allocation.destroy();

    return res.status(200).json({
      message: "Material allocation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material allocation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Allocate material to batch
 */
exports.allocateMaterial = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;
    const { quantityAllocated } = req.body;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    if (quantityAllocated > allocation.quantityRequired) {
      return res.status(400).json({
        message: "Allocated quantity cannot exceed required quantity",
      });
    }

    const status =
      quantityAllocated >= allocation.quantityRequired
        ? "allocated"
        : "partial";

    await allocation.update({
      quantityAllocated,
      status,
      allocationDate: new Date(),
    });

    return res.status(200).json({
      message: "Material allocated successfully",
      allocation: allocation,
    });
  } catch (error) {
    console.error("Error allocating material:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Consume allocated material
 */
exports.consumeMaterial = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    if (allocation.status !== "allocated") {
      return res.status(400).json({
        message: "Material must be allocated before consumption",
      });
    }

    await allocation.update({
      status: "consumed",
    });

    return res.status(200).json({
      message: "Material consumed successfully",
      allocation: allocation,
    });
  } catch (error) {
    console.error("Error consuming material:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a production batch
 */
exports.deleteBatch = async (req, res) => {
  try {
    const batchId = req.params.id;

    const batch = await ProductionBatch.findByPk(batchId);

    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    // Check for associated steps or material allocations before deleting
    const steps = await ProductionStep.findAll({
      where: { batch_id: batch.id },
    });
    const materialAllocations = await MaterialAllocation.findAll({
      where: { batch_id: batch.id },
    });

    if (steps.length > 0 || materialAllocations.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete batch with associated steps or material allocations. Consider cancelling or completing it instead.",
        steps: steps.map((s) => ({
          id: s.id,
          stepName: s.stepName,
          status: s.status,
          stepOrder: s.stepOrder,
        })),
        materialAllocations: materialAllocations.map((ma) => ({
          id: ma.id,
          materialId: ma.materialId,
          quantityRequired: ma.quantityRequired,
          status: ma.status,
        })),
      });
    }

    await batch.destroy();

    return res
      .status(200)
      .json({ message: "Production batch deleted successfully" });
  } catch (error) {
    console.error("Error deleting production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a production step
 */
exports.updateStep = async (req, res) => {
  try {
    const stepId = req.params.stepId;
    const {
      machineId,
      operatorId,
      actualStartTime,
      actualEndTime,
      status,
      notes,
    } = req.body;

    // Find the step
    const step = await ProductionStep.findByPk(stepId);

    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    // Update fields
    const updateData = {};
    if (machineId) updateData.machineId = machineId;
    if (operatorId) updateData.operatorId = operatorId;
    if (actualStartTime) updateData.actualStartTime = actualStartTime;
    if (actualEndTime) updateData.actualEndTime = actualEndTime;
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    // Update step
    await step.update(updateData);

    // If step status changed to 'in_progress', update batch status if it's the first step
    if (status === "in_progress") {
      const batch = await ProductionBatch.findByPk(step.batchId);
      if (batch && batch.status !== "in_progress") {
        // Check if this is the first step
        const steps = await ProductionStep.findAll({
          where: { batchId: step.batchId },
          order: [["stepOrder", "ASC"]],
        });

        if (steps[0].id === step.id) {
          await batch.update({
            status: "in_progress",
            actualStartDate: new Date(),
          });

          // Update the request status
          const request = await ProductionRequest.findByPk(batch.requestId);
          if (request) {
            await request.update({ status: "in_production" });
          }
        }
      }
    }

    // If step status changed to 'completed', check if all steps are completed to update batch status
    if (status === "completed") {
      const batch = await ProductionBatch.findByPk(step.batchId);
      if (batch) {
        const steps = await ProductionStep.findAll({
          where: { batchId: step.batchId },
        });

        const allCompleted = steps.every(
          (s) => s.status === "completed" || s.status === "cancelled"
        );

        if (allCompleted) {
          await batch.update({
            status: "completed",
            actualEndDate: new Date(),
          });

          // Check if all batches for this request are completed
          const allBatches = await ProductionBatch.findAll({
            where: { requestId: batch.requestId },
          });

          const allBatchesCompleted = allBatches.every(
            (b) => b.status === "completed" || b.status === "cancelled"
          );

          if (allBatchesCompleted) {
            const request = await ProductionRequest.findByPk(batch.requestId);
            if (request) {
              await request.update({ status: "completed" });

              // Notify the Production Feedback Service
              try {
                await axios.post(
                  `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
                  {
                    requestId: request.requestId,
                    status: "completed",
                    notes: "All production completed",
                  }
                );
              } catch (error) {
                console.error(
                  "Failed to notify Feedback Service:",
                  error.message
                );
                // Continue execution even if notification fails
              }
            }
          }
        }
      }
    }

    return res.status(200).json({
      message: "Production step updated successfully",
      step: step,
    });
  } catch (error) {
    console.error("Error updating production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
