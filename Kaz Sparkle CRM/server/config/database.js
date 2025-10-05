const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const init = async () => {
    return new Promise((resolve, reject) => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'worker',
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, async (err) => {
            if (err) reject(err);
            
            // Insert default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run(`INSERT OR IGNORE INTO users (username, email, password, role) 
                   VALUES (?, ?, ?, ?)`, 
                   ['admin', 'admin@kazkleen.com', hashedPassword, 'manager']);
            
            // Insert default worker user
            const workerPassword = await bcrypt.hash('worker123', 10);
            db.run(`INSERT OR IGNORE INTO users (username, email, password, role) 
                   VALUES (?, ?, ?, ?)`, 
                   ['worker', 'worker@kazkleen.com', workerPassword, 'worker']);
        });

        // Services table
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) reject(err);
            
            // Insert default services
            const defaultServices = [
                ['Carpet Cleaning', 45.00, 'Professional carpet cleaning service'],
                ['Window Washing', 25.00, 'Window cleaning and washing'],
                ['Dusting', 15.00, 'Comprehensive dusting service'],
                ['Vacuuming', 20.00, 'Thorough vacuuming service'],
                ['Disinfection', 35.00, 'Surface disinfection and sanitization']
            ];
            
            defaultServices.forEach(service => {
                db.run(`INSERT OR IGNORE INTO services (name, price, description) VALUES (?, ?, ?)`, service);
            });
        });

        // Clients table
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(20),
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) reject(err);
        });

        // Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            quote_number VARCHAR(50) UNIQUE,
            order_date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            special_instructions TEXT,
            total_price DECIMAL(10,2) DEFAULT 0,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients (id),
            FOREIGN KEY (created_by) REFERENCES users (id)
        )`, (err) => {
            if (err) reject(err);
        });

        // Order floors table
        db.run(`CREATE TABLE IF NOT EXISTS order_floors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            floor_number INTEGER,
            floor_name VARCHAR(100),
            FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) reject(err);
        });

        // Order rooms table
        db.run(`CREATE TABLE IF NOT EXISTS order_rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            floor_id INTEGER,
            room_number INTEGER,
            room_name VARCHAR(100),
            FOREIGN KEY (floor_id) REFERENCES order_floors (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) reject(err);
        });

        // Order services table
        db.run(`CREATE TABLE IF NOT EXISTS order_services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER,
            service_id INTEGER,
            quantity INTEGER DEFAULT 1,
            unit_price DECIMAL(10,2),
            total_price DECIMAL(10,2),
            FOREIGN KEY (room_id) REFERENCES order_rooms (id) ON DELETE CASCADE,
            FOREIGN KEY (service_id) REFERENCES services (id)
        )`, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
};

module.exports = {
    db,
    init
};