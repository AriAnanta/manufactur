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
      requestId,
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
