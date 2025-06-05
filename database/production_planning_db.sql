-- =====================================================
-- PRODUCTION PLANNING SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS production_planning_db;
USE production_planning_db;

-- Drop existing tables
DROP TABLE IF EXISTS material_plans;
DROP TABLE IF EXISTS capacity_plans;
DROP TABLE IF EXISTS production_plans;

-- Production plans table
CREATE TABLE production_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id VARCHAR(50) UNIQUE NOT NULL,
    request_id INT NOT NULL,
    production_request_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    planned_start_date DATE,
    planned_end_date DATE,
    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    status ENUM('draft', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'draft',
    planning_notes TEXT,
    total_capacity_required DECIMAL(10,2) DEFAULT 0.00,
    total_material_cost DECIMAL(15,2) DEFAULT 0.00,
    planned_batches INT DEFAULT 1,
    approved_by VARCHAR(100),
    approval_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_request (request_id)
);

-- Capacity plans table
CREATE TABLE capacity_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    machine_type VARCHAR(50) NOT NULL,
    hours_required DECIMAL(6,2) NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    planned_machine_id INT,
    status ENUM('planned', 'confirmed', 'rejected') NOT NULL DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
    INDEX idx_plan (plan_id),
    INDEX idx_machine_type (machine_type),
    INDEX idx_status (status)
);

-- Material plans table
CREATE TABLE material_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    material_id INT NOT NULL,
    material_name VARCHAR(100) NOT NULL,
    quantity_required DECIMAL(10,3) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(12,2) DEFAULT 0.00,
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('planned', 'verified', 'rejected') NOT NULL DEFAULT 'planned',
    availability_checked BOOLEAN NOT NULL DEFAULT FALSE,
    availability_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
    INDEX idx_plan (plan_id),
    INDEX idx_material (material_id),
    INDEX idx_status (status)
);

-- Insert dummy production plans
INSERT INTO production_plans (plan_id, request_id, production_request_id, product_name, planned_start_date, planned_end_date, priority, status, planning_notes, total_capacity_required, total_material_cost, planned_batches, approved_by, approval_date) VALUES
('PLAN-001', 1, 'REQ-2024-001', 'Bracket Logam Ukuran L', CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 10 DAY, 'high', 'approved', 'Rencana produksi bracket logam dengan 2 batch', 24.00, 7500000.00, 2, 'manager1', NOW() - INTERVAL 2 DAY),
('PLAN-002', 2, 'REQ-2024-002', 'Cover Plastik Elektronik', CURDATE() + INTERVAL 3 DAY, CURDATE() + INTERVAL 14 DAY, 'normal', 'approved', 'Injection molding untuk cover plastik', 12.00, 5000000.00, 2, 'manager1', NOW() - INTERVAL 1 DAY),
('PLAN-003', 3, 'REQ-2024-003', 'Gear Box Housing', CURDATE() + INTERVAL 2 DAY, CURDATE() + INTERVAL 7 DAY, 'urgent', 'approved', 'CNC machining untuk housing', 16.00, 8500000.00, 1, 'manager1', NOW() - INTERVAL 3 DAY),
('PLAN-004', 4, 'REQ-2024-004', 'Furniture Set Kayu Jati', CURDATE() + INTERVAL 7 DAY, CURDATE() + INTERVAL 21 DAY, 'normal', 'draft', 'Rencana furniture kayu jati belum final', 40.00, 25000000.00, 1, NULL, NULL),
('PLAN-005', 5, 'REQ-2024-005', 'Komponen Tekstil Custom', CURDATE() + INTERVAL 15 DAY, CURDATE() + INTERVAL 35 DAY, 'low', 'draft', 'Menunggu spesifikasi detail dari customer', 60.00, 17500000.00, 3, NULL, NULL),
('PLAN-006', 6, 'REQ-2024-006', 'Precision Machined Parts', CURDATE() + INTERVAL 4 DAY, CURDATE() + INTERVAL 9 DAY, 'high', 'approved', 'Precision machining dengan toleransi ketat', 20.00, 12000000.00, 1, 'manager1', NOW() - INTERVAL 1 DAY),
('PLAN-007', 7, 'REQ-2024-007', 'Industrial Valve Body', CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 6 DAY, 'urgent', 'approved', 'Valve body stainless steel', 18.00, 15000000.00, 1, 'manager1', NOW() - INTERVAL 2 DAY),
('PLAN-008', 8, 'REQ-2024-008', 'Electronic Enclosure', CURDATE() + INTERVAL 8 DAY, CURDATE() + INTERVAL 18 DAY, 'normal', 'draft', 'Enclosure dengan rating IP65', 30.00, 8500000.00, 2, NULL, NULL),
('PLAN-009', 9, 'REQ-2024-009', 'Custom Wooden Cabinet', CURDATE() + INTERVAL 12 DAY, CURDATE() + INTERVAL 28 DAY, 'normal', 'draft', 'Cabinet kayu custom design', 50.00, 22000000.00, 2, NULL, NULL),
('PLAN-010', 10, 'REQ-2024-010', 'Automotive Bracket', CURDATE() + INTERVAL 5 DAY, CURDATE() + INTERVAL 15 DAY, 'high', 'approved', 'Bracket otomotif high tensile', 35.00, 18000000.00, 2, 'manager1', NOW() - INTERVAL 1 DAY);

-- Insert dummy capacity plans
INSERT INTO capacity_plans (plan_id, machine_type, hours_required, start_date, end_date, planned_machine_id, status, notes) VALUES
(1, 'cutting', 8.00, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY + INTERVAL 8 HOUR, 3, 'confirmed', 'Cutting untuk batch 1 dan 2'),
(1, 'drilling', 6.00, NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 6 HOUR, 4, 'planned', 'Drilling holes bracket'),
(1, 'grinding', 6.00, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY + INTERVAL 6 HOUR, 5, 'confirmed', 'Surface finishing'),
(2, 'molding', 12.00, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 4 DAY, 6, 'confirmed', 'Injection molding cover'),
(3, 'milling', 16.00, NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 4 DAY, 1, 'confirmed', 'CNC milling gear box'),
(6, 'milling', 20.00, NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 6 DAY, 1, 'confirmed', 'Precision machining'),
(7, 'turning', 12.00, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 3 DAY, 2, 'confirmed', 'Valve body turning'),
(7, 'inspection', 6.00, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY + INTERVAL 6 HOUR, 9, 'confirmed', 'Quality inspection'),
(10, 'cutting', 15.00, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 7 DAY, 3, 'confirmed', 'Automotive bracket cutting'),
(10, 'welding', 20.00, NOW() + INTERVAL 8 DAY, NOW() + INTERVAL 10 DAY, 7, 'planned', 'Bracket welding');

-- Insert dummy material plans
INSERT INTO material_plans (plan_id, material_id, material_name, quantity_required, unit_of_measure, unit_cost, total_cost, status, availability_checked, availability_date, notes) VALUES
(1, 1, 'Baja ST37', 150.500, 'kg', 15000.00, 2257500.00, 'verified', TRUE, NOW() - INTERVAL 1 DAY, 'Material tersedia'),
(1, 3, 'Oli Mesin SAE 40', 10.000, 'liter', 45000.00, 450000.00, 'verified', TRUE, NOW() - INTERVAL 1 DAY, 'Oli pelumas tersedia'),
(2, 2, 'Plastik ABS', 50.250, 'kg', 25000.00, 1256250.00, 'planned', FALSE, NULL, 'Belum dicek ketersediaan'),
(3, 1, 'Baja ST37', 120.000, 'kg', 15000.00, 1800000.00, 'verified', TRUE, NOW() - INTERVAL 2 DAY, 'Material tersedia'),
(3, 4, 'Bearing 6205', 8.000, 'pcs', 85000.00, 680000.00, 'verified', TRUE, NOW() - INTERVAL 2 DAY, 'Bearing tersedia'),
(6, 1, 'Baja ST37', 200.000, 'kg', 15000.00, 3000000.00, 'verified', TRUE, NOW() - INTERVAL 1 DAY, 'Material untuk precision part'),
(7, 1, 'Baja ST37', 100.500, 'kg', 15000.00, 1507500.00, 'verified', TRUE, NOW() - INTERVAL 2 DAY, 'Stainless steel valve'),
(7, 9, 'O-Ring NBR 50mm', 20.000, 'pcs', 15000.00, 300000.00, 'verified', TRUE, NOW() - INTERVAL 2 DAY, 'Seal tersedia'),
(10, 1, 'Baja ST37', 400.000, 'kg', 15000.00, 6000000.00, 'verified', TRUE, NOW() - INTERVAL 1 DAY, 'High tensile steel'),
(10, 5, 'Kabel Listrik 2.5mm', 100.000, 'meter', 12000.00, 1200000.00, 'planned', FALSE, NULL, 'Kabel untuk wiring');
