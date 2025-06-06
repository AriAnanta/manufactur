/**
 * Batch Routes
 *
 * API routes for production batch management
 */
const express = require("express");
const batchController = require("../controllers/batch.controller");
const router = express.Router();

// Get all production batches
router.get("/", batchController.getAllBatches);

// Get production batch by ID
router.get("/:id", batchController.getBatchById);

// Create a new production batch
router.post("/", batchController.createBatch);

// Update a production batch
router.put("/:id", batchController.updateBatch);

// Update a production step
router.put("/step/:stepId", batchController.updateStep);

// Delete a production batch
router.delete("/:id", batchController.deleteBatch);

module.exports = router;
