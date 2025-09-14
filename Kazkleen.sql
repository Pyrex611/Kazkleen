-- Database schema for the cleaning company CRM
CREATE DATABASE cleaning_crm;

USE cleaning_crm;

-- Table for storing orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    order_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing order items
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    service_type VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Table for available services
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2)
);

-- Sample data for services
INSERT INTO services (service_name, description, base_price) VALUES
('Carpet Cleaning', 'Professional carpet cleaning service', 120.00),
('Window Cleaning', 'Interior and exterior window cleaning', 80.00),
('Floor Polishing', 'Hardwood and tile floor polishing', 150.00),
('Upholstery Cleaning', 'Furniture and upholstery cleaning', 100.00),
('Deep Cleaning', 'Comprehensive deep cleaning service', 250.00),
('Office Cleaning', 'Regular office cleaning maintenance', 200.00);