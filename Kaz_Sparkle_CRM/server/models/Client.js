const { db } = require('../config/database');

class Client {
    static async create(clientData) {
        const { name, email, phone, address } = clientData;
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)`,
                [name, email, phone, address],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async findOrCreate(clientData) {
        const { name, email, phone, address } = clientData;
        
        return new Promise((resolve, reject) => {
            // Try to find existing client by email or phone
            db.get(
                `SELECT * FROM clients WHERE email = ? OR phone = ?`,
                [email, phone],
                async (err, row) => {
                    if (err) return reject(err);
                    
                    if (row) {
                        resolve(row.id);
                    } else {
                        // Create new client
                        const clientId = await this.create(clientData);
                        resolve(clientId);
                    }
                }
            );
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM clients ORDER BY name`,
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    }
}

module.exports = Client;