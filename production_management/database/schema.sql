-- Create Database
CREATE DATABASE IF NOT EXISTS production_management;
USE production_management;

-- Production Requests Table
CREATE TABLE production_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requestId VARCHAR(50) UNIQUE NOT NULL,
    productName VARCHAR(255) NOT NULL,
    customerId VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    requestDate DATETIME NOT NULL,
    requiredDate DATETIME NOT NULL,
    status ENUM('pending', 'planned', 'in_production', 'completed', 'cancelled') DEFAULT 'pending',
    specifications TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_request_id (requestId),
    INDEX idx_customer_id (customerId),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_required_date (requiredDate)
);

-- Production Batches Table
CREATE TABLE production_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batchNumber VARCHAR(50) UNIQUE NOT NULL,
    requestId INT NOT NULL,
    quantity INT NOT NULL,
    scheduledStartDate DATETIME,
    scheduledEndDate DATETIME,
    actualStartDate DATETIME,
    actualEndDate DATETIME,
    status ENUM('pending', 'planned', 'in_progress', 'completed', 'cancelled', 'on_hold') DEFAULT 'pending',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requestId) REFERENCES production_requests(id) ON DELETE CASCADE,
    INDEX idx_batch_number (batchNumber),
    INDEX idx_request_id (requestId),
    INDEX idx_status (status),
    INDEX idx_scheduled_start (scheduledStartDate),
    INDEX idx_scheduled_end (scheduledEndDate)
);

-- Production Steps Table
CREATE TABLE production_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batchId INT NOT NULL,
    stepName VARCHAR(255) NOT NULL,
    stepOrder INT NOT NULL,
    machineType VARCHAR(100),
    machineId VARCHAR(50),
    operatorId VARCHAR(50),
    scheduledStartTime DATETIME,
    scheduledEndTime DATETIME,
    actualStartTime DATETIME,
    actualEndTime DATETIME,
    status ENUM('pending', 'planned', 'in_progress', 'completed', 'cancelled', 'on_hold') DEFAULT 'pending',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batchId) REFERENCES production_batches(id) ON DELETE CASCADE,
    INDEX idx_batch_id (batchId),
    INDEX idx_step_order (stepOrder),
    INDEX idx_machine_type (machineType),
    INDEX idx_machine_id (machineId),
    INDEX idx_operator_id (operatorId),
    INDEX idx_status (status),
    INDEX idx_scheduled_start (scheduledStartTime)
);

-- Material Allocations Table
CREATE TABLE material_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batchId INT NOT NULL,
    materialId VARCHAR(50) NOT NULL,
    quantityRequired DECIMAL(10,2) NOT NULL,
    quantityAllocated DECIMAL(10,2) DEFAULT 0,
    unitOfMeasure VARCHAR(20) NOT NULL,
    status ENUM('pending', 'reserved', 'allocated', 'consumed', 'cancelled') DEFAULT 'pending',
    reservedAt DATETIME,
    allocatedAt DATETIME,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batchId) REFERENCES production_batches(id) ON DELETE CASCADE,
    INDEX idx_batch_id (batchId),
    INDEX idx_material_id (materialId),
    INDEX idx_status (status)
);

-- Materials Master Table (for reference)
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materialId VARCHAR(50) UNIQUE NOT NULL,
    materialName VARCHAR(255) NOT NULL,
    materialType VARCHAR(100),
    unitOfMeasure VARCHAR(20) NOT NULL,
    standardCost DECIMAL(10,2),
    supplier VARCHAR(255),
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_material_id (materialId),
    INDEX idx_material_type (materialType),
    INDEX idx_is_active (isActive)
);

-- Machines Master Table (for reference)
CREATE TABLE machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machineId VARCHAR(50) UNIQUE NOT NULL,
    machineName VARCHAR(255) NOT NULL,
    machineType VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    capacity DECIMAL(10,2),
    status ENUM('available', 'busy', 'maintenance', 'offline') DEFAULT 'available',
    lastMaintenanceDate DATE,
    nextMaintenanceDate DATE,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_machine_id (machineId),
    INDEX idx_machine_type (machineType),
    INDEX idx_status (status),
    INDEX idx_is_active (isActive)
);

-- Operators/Users Table (for reference)
CREATE TABLE operators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operatorId VARCHAR(50) UNIQUE NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    shift VARCHAR(20),
    skillLevel ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_operator_id (operatorId),
    INDEX idx_email (email),
    INDEX idx_department (department),
    INDEX idx_shift (shift),
    INDEX idx_is_active (isActive)
);

-- Production Logs Table (for tracking changes and history)
CREATE TABLE production_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entityType ENUM('request', 'batch', 'step', 'material') NOT NULL,
    entityId INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    oldValues JSON,
    newValues JSON,
    userId VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    INDEX idx_entity (entityType, entityId),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (userId)
);

-- Quality Control Table
CREATE TABLE quality_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batchId INT NOT NULL,
    stepId INT,
    inspectionType VARCHAR(100) NOT NULL,
    inspectorId VARCHAR(50),
    inspectionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    result ENUM('pass', 'fail', 'rework_required') NOT NULL,
    defectCount INT DEFAULT 0,
    notes TEXT,
    actionRequired TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batchId) REFERENCES production_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (stepId) REFERENCES production_steps(id) ON DELETE SET NULL,
    INDEX idx_batch_id (batchId),
    INDEX idx_step_id (stepId),
    INDEX idx_inspector_id (inspectorId),
    INDEX idx_result (result),
    INDEX idx_inspection_date (inspectionDate)
);

-- Insert sample data for materials
INSERT INTO materials (materialId, materialName, materialType, unitOfMeasure, standardCost, supplier) VALUES
('MAT001', 'Steel Sheet', 'Raw Material', 'kg', 25.50, 'Steel Corp'),
('MAT002', 'Aluminum Rod', 'Raw Material', 'meter', 15.75, 'Metal Works'),
('MAT003', 'Paint - Blue', 'Chemical', 'liter', 45.00, 'Paint Co'),
('MAT004', 'Screws M6', 'Hardware', 'piece', 0.25, 'Hardware Ltd'),
('MAT005', 'Gasket Rubber', 'Component', 'piece', 3.50, 'Rubber Inc');

-- Insert sample data for machines
INSERT INTO machines (machineId, machineName, machineType, location, capacity) VALUES
('MCH001', 'CNC Lathe 1', 'CNC_LATHE', 'Workshop A', 100.00),
('MCH002', 'Milling Machine 1', 'MILLING', 'Workshop A', 80.00),
('MCH003', 'Welding Station 1', 'WELDING', 'Workshop B', 50.00),
('MCH004', 'Paint Booth 1', 'PAINTING', 'Workshop C', 200.00),
('MCH005', 'Assembly Line 1', 'ASSEMBLY', 'Workshop D', 150.00);

-- Insert sample data for operators
INSERT INTO operators (operatorId, firstName, lastName, email, department, shift, skillLevel) VALUES
('OP001', 'John', 'Smith', 'john.smith@company.com', 'Machining', 'Day', 'expert'),
('OP002', 'Maria', 'Garcia', 'maria.garcia@company.com', 'Welding', 'Day', 'advanced'),
('OP003', 'David', 'Johnson', 'david.johnson@company.com', 'Assembly', 'Night', 'intermediate'),
('OP004', 'Sarah', 'Wilson', 'sarah.wilson@company.com', 'Quality', 'Day', 'advanced'),
('OP005', 'Mike', 'Brown', 'mike.brown@company.com', 'Painting', 'Day', 'intermediate');
