const { db } = require('../config/database');

class Service {
    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM services WHERE is_active = 1 ORDER BY name`,
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM services WHERE id = ? AND is_active = 1`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    static async create(serviceData) {
        const { name, price, description } = serviceData;
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO services (name, price, description) VALUES (?, ?, ?)`,
                [name, price, description],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async update(id, serviceData) {
        const { name, price, description } = serviceData;
        
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE services SET name = ?, price = ?, description = ? WHERE id = ?`,
                [name, price, description, id],
                function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE services SET is_active = 0 WHERE id = ?`,
                [id],
                function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });
    }
}

module.exports = Service;