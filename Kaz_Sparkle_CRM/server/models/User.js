const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { username, email, password, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                [username, email, hashedPassword, role],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE username = ?`,
                [username],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE email = ?`,
                [email],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT id, username, email, role, last_login, created_at FROM users WHERE id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT id, username, email, role, last_login, created_at FROM users ORDER BY created_at DESC`,
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    }

    static async updateLoginTime(id) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
                [id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM users WHERE id = ?`,
                [id],
                function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;