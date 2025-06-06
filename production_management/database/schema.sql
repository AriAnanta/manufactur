-- =====================================================
-- PRODUCTION MANAGEMENT SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS production_management_db;
USE production_management_db;

-- Drop existing tables
DROP TABLE IF EXISTS material_allocations;
DROP TABLE IF EXISTS production_steps;
DROP TABLE IF EXISTS production_batches;
DROP TABLE IF EXISTS production_requests;

-- Production requests table
CREATE TABLE production_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    due_date DATE NOT NULL,
    specifications TEXT,
    status ENUM('received', 'planned', 'in_production', 'completed', 'cancelled') NOT NULL DEFAULT 'received',
    marketplace_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_request_id (request_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date)
);

-- Production batches table
CREATE TABLE production_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    request_id INT NOT NULL,
    scheduled_start_date DATETIME,
    scheduled_end_date DATETIME,
    actual_start_date DATETIME,
    actual_end_date DATETIME,
    quantity INT NOT NULL,
    status ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    materials_assigned BOOLEAN NOT NULL DEFAULT FALSE,
    machine_assigned BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES production_requests(id) ON DELETE CASCADE,
    INDEX idx_batch_number (batch_number),
    INDEX idx_status (status),
    INDEX idx_request (request_id)
);

-- Production steps table
CREATE TABLE production_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    machine_type VARCHAR(50),
    scheduled_start_time DATETIME,
    scheduled_end_time DATETIME,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    machine_id INT,
    operator_id INT,
    status ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE,
    INDEX idx_batch (batch_id),
    INDEX idx_step_order (step_order),
    INDEX idx_status (status)
);

-- Material allocations table
CREATE TABLE material_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity_required DECIMAL(10,3) NOT NULL,
    quantity_allocated DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    unit_of_measure VARCHAR(20) NOT NULL,
    status ENUM('pending', 'partial', 'allocated', 'consumed') NOT NULL DEFAULT 'pending',
    allocation_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE,
    INDEX idx_batch (batch_id),
    INDEX idx_material (material_id),
    INDEX idx_status (status)
);

-- Insert dummy production requests
INSERT INTO production_requests (request_id, customer_id, product_name, quantity, priority, due_date, specifications, status, marketplace_data) VALUES
('REQ-2024-001', 'CUST-001', 'Bracket Logam Ukuran L', 100, 'high', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Material: Baja ST37, Dimensi: 100x50x10mm, Finish: Powder Coating', 'in_production', '{"marketplace":"tokopedia","order_id":"TKP-001"}'),
('REQ-2024-002', 'CUST-002', 'Cover Plastik Elektronik', 200, 'normal', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'Material: ABS Plastic, Warna: Hitam, Tolerance: ±0.1mm', 'planned', '{"marketplace":"shopee","order_id":"SPE-002"}'),
('REQ-2024-003', 'CUST-001', 'Gear Box Housing', 50, 'urgent', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Material: Cast Iron, Machining: CNC, Surface: Smooth', 'received', NULL),
('REQ-2024-004', 'CUST-003', 'Furniture Set Kayu Jati', 25, 'normal', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Material: Kayu Jati Grade A, Finishing: Natural Wood Stain', 'received', '{"marketplace":"bukalapak","order_id":"BL-004"}'),
('REQ-2024-005', 'CUST-002', 'Komponen Tekstil Custom', 500, 'low', DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'Material: Katun 100%, Pattern: Custom Design, Size: Various', 'received', NULL),
('REQ-2024-006', 'CUST-004', 'Precision Machined Parts', 75, 'high', DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'Material: Aluminum 6061, Tolerance: ±0.05mm, Anodizing Required', 'planned', '{"marketplace":"tokopedia","order_id":"TKP-006"}'),
('REQ-2024-007', 'CUST-001', 'Industrial Valve Body', 30, 'urgent', DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'Material: Stainless Steel 316, Pressure Rating: 150 PSI', 'in_production', NULL),
('REQ-2024-008', 'CUST-005', 'Electronic Enclosure', 150, 'normal', DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'Material: ABS+PC Blend, IP Rating: IP65, Color: Grey', 'received', '{"marketplace":"shopee","order_id":"SPE-008"}'),
('REQ-2024-009', 'CUST-003', 'Custom Wooden Cabinet', 40, 'normal', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Material: Multiplex + Veneer, Hardware: Soft Close, Finish: Duco', 'received', '{"marketplace":"bukalapak","order_id":"BL-009"}'),
('REQ-2024-010', 'CUST-002', 'Automotive Bracket', 300, 'high', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'Material: High Tensile Steel, Coating: Zinc Plating, Load: 500kg', 'planned', NULL);

-- Insert dummy production batches
INSERT INTO production_batches (batch_number, request_id, scheduled_start_date, scheduled_end_date, quantity, status, materials_assigned, machine_assigned, notes) VALUES
('BATCH-001', 1, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 5 DAY, 50, 'in_progress', TRUE, TRUE, 'Batch pertama untuk bracket logam'),
('BATCH-002', 1, NOW() + INTERVAL 6 DAY, NOW() + INTERVAL 10 DAY, 50, 'scheduled', TRUE, TRUE, 'Batch kedua untuk bracket logam'),
('BATCH-003', 2, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 8 DAY, 100, 'pending', FALSE, FALSE, 'Batch pertama cover plastik'),
('BATCH-004', 2, NOW() + INTERVAL 9 DAY, NOW() + INTERVAL 14 DAY, 100, 'pending', FALSE, FALSE, 'Batch kedua cover plastik'),
('BATCH-005', 3, NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 7 DAY, 50, 'scheduled', TRUE, FALSE, 'Gear box housing production'),
('BATCH-006', 6, NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 9 DAY, 75, 'pending', FALSE, FALSE, 'Precision machined parts'),
('BATCH-007', 7, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 6 DAY, 30, 'in_progress', TRUE, TRUE, 'Industrial valve body'),
('BATCH-008', 10, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 12 DAY, 150, 'scheduled', TRUE, FALSE, 'Automotive bracket batch 1'),
('BATCH-009', 10, NOW() + INTERVAL 13 DAY, NOW() + INTERVAL 20 DAY, 150, 'pending', FALSE, FALSE, 'Automotive bracket batch 2'),
('BATCH-010', 4, NOW() + INTERVAL 7 DAY, NOW() + INTERVAL 21 DAY, 25, 'pending', FALSE, FALSE, 'Furniture set kayu jati');

-- Insert dummy production steps
INSERT INTO production_steps (batch_id, step_name, step_order, machine_type, scheduled_start_time, scheduled_end_time, machine_id, operator_id, status, notes) VALUES
(1, 'Cutting Material', 1, 'cutting', NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY + INTERVAL 4 HOUR, NULL, 4, 'in_progress', 'Pemotongan baja ST37'),
(1, 'Drilling Holes', 2, 'drilling', NOW() + INTERVAL 1 DAY + INTERVAL 5 HOUR, NOW() + INTERVAL 1 DAY + INTERVAL 8 HOUR, NULL, 5, 'pending', 'Pengeboran lubang bracket'),
(1, 'Surface Finishing', 3, 'grinding', NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 3 HOUR, NULL, 6, 'pending', 'Finishing permukaan'),
(2, 'Cutting Material', 1, 'cutting', NOW() + INTERVAL 6 DAY, NOW() + INTERVAL 6 DAY + INTERVAL 4 HOUR, NULL, NULL, 'scheduled', 'Batch 2 pemotongan'),
(3, 'Injection Molding', 1, 'molding', NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY + INTERVAL 6 HOUR, NULL, NULL, 'pending', 'Injection molding plastik'),
(5, 'CNC Machining', 1, 'milling', NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 3 DAY, NULL, NULL, 'scheduled', 'CNC machining gear box'),
(5, 'Quality Inspection', 2, 'inspection', NOW() + INTERVAL 3 DAY + INTERVAL 2 HOUR, NOW() + INTERVAL 3 DAY + INTERVAL 4 HOUR, NULL, NULL, 'pending', 'Inspeksi kualitas'),
(7, 'Turning Operation', 1, 'turning', NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY + INTERVAL 8 HOUR, NULL, 4, 'in_progress', 'Turning valve body'),
(7, 'Thread Cutting', 2, 'turning', NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 4 HOUR, NULL, NULL, 'pending', 'Cutting thread'),
(8, 'Material Preparation', 1, 'cutting', NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 5 DAY + INTERVAL 6 HOUR, NULL, NULL, 'scheduled', 'Persiapan material bracket');

-- Insert dummy material allocations
INSERT INTO material_allocations (batch_id, material_id, quantity_required, quantity_allocated, unit_of_measure, status, allocation_date, notes) VALUES
(1, 1, 75.500, 75.500, 'kg', 'allocated', NOW() - INTERVAL 1 DAY, 'Baja untuk batch 001'),
(1, 3, 5.000, 5.000, 'liter', 'allocated', NOW() - INTERVAL 1 DAY, 'Oli untuk pelumasan'),
(2, 1, 75.000, 0.000, 'kg', 'pending', NULL, 'Baja untuk batch 002'),
(3, 2, 50.250, 0.000, 'kg', 'pending', NULL, 'Plastik ABS untuk cover'),
(5, 1, 120.000, 120.000, 'kg', 'allocated', NOW() - INTERVAL 2 DAY, 'Cast iron untuk gear box'),
(5, 4, 8.000, 8.000, 'pcs', 'allocated', NOW() - INTERVAL 2 DAY, 'Bearing untuk assembly'),
(7, 1, 85.500, 85.500, 'kg', 'consumed', NOW() - INTERVAL 1 DAY, 'Stainless steel valve'),
(7, 9, 15.000, 15.000, 'pcs', 'allocated', NOW() - INTERVAL 1 DAY, 'O-ring seals'),
(8, 1, 200.000, 100.000, 'kg', 'partial', NOW() - INTERVAL 3 DAY, 'Material automotive bracket'),
(10, 6, 2.500, 0.000, 'm3', 'pending', NULL, 'Kayu jati furniture');
