const { db } = require('../config/database');

class Order {
    static async create(orderData) {
        const { client_id, quote_number, order_date, special_instructions, created_by, floors } = orderData;
        
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Start transaction
                db.run('BEGIN TRANSACTION');
                
                // Insert order
                db.run(
                    `INSERT INTO orders (client_id, quote_number, order_date, special_instructions, created_by) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [client_id, quote_number, order_date, special_instructions, created_by],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }
                        
                        const orderId = this.lastID;
                        let totalPrice = 0;
                        let floorIndex = 0;
                        
                        // Insert floors, rooms, and services
                        floors.forEach((floor, floorIdx) => {
                            db.run(
                                `INSERT INTO order_floors (order_id, floor_number, floor_name) 
                                 VALUES (?, ?, ?)`,
                                [orderId, floorIdx + 1, floor.floor_name || `Floor ${floorIdx + 1}`],
                                function(err) {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }
                                    
                                    const floorId = this.lastID;
                                    
                                    floor.rooms.forEach((room, roomIdx) => {
                                        db.run(
                                            `INSERT INTO order_rooms (floor_id, room_number, room_name) 
                                             VALUES (?, ?, ?)`,
                                            [floorId, roomIdx + 1, room.room_name || `Room ${roomIdx + 1}`],
                                            function(err) {
                                                if (err) {
                                                    db.run('ROLLBACK');
                                                    return reject(err);
                                                }
                                                
                                                const roomId = this.lastID;
                                                
                                                room.services.forEach(service => {
                                                    const serviceTotal = service.unit_price * service.quantity;
                                                    totalPrice += serviceTotal;
                                                    
                                                    db.run(
                                                        `INSERT INTO order_services (room_id, service_id, quantity, unit_price, total_price) 
                                                         VALUES (?, ?, ?, ?, ?)`,
                                                        [roomId, service.service_id, service.quantity, service.unit_price, serviceTotal],
                                                        (err) => {
                                                            if (err) {
                                                                db.run('ROLLBACK');
                                                                return reject(err);
                                                            }
                                                        }
                                                    );
                                                });
                                            }
                                        );
                                    });
                                }
                            );
                        });
                        
                        // Update total price and commit
                        db.run(
                            `UPDATE orders SET total_price = ? WHERE id = ?`,
                            [totalPrice, orderId],
                            (err) => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return reject(err);
                                }
                                
                                db.run('COMMIT', (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }
                                    resolve(orderId);
                                });
                            }
                        );
                    }
                );
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT o.*, c.name as client_name, c.phone as client_phone, u.username as created_by_name
                FROM orders o
                LEFT JOIN clients c ON o.client_id = c.id
                LEFT JOIN users u ON o.created_by = u.id
                ORDER BY o.created_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            // Get order basic info
            db.get(`
                SELECT o.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.address as client_address
                FROM orders o
                LEFT JOIN clients c ON o.client_id = c.id
                WHERE o.id = ?
            `, [id], (err, order) => {
                if (err) return reject(err);
                
                if (!order) {
                    return resolve(null);
                }
                
                // Get floors with rooms and services
                db.all(`
                    SELECT of.*,
                           orm.id as room_id, orm.room_number, orm.room_name,
                           os.id as service_id, os.quantity, os.unit_price, os.total_price as service_total,
                           s.name as service_name
                    FROM order_floors of
                    LEFT JOIN order_rooms orm ON of.id = orm.floor_id
                    LEFT JOIN order_services os ON orm.id = os.room_id
                    LEFT JOIN services s ON os.service_id = s.id
                    WHERE of.order_id = ?
                    ORDER BY of.floor_number, orm.room_number
                `, [id], (err, rows) => {
                    if (err) return reject(err);
                    
                    // Structure the data
                    const floors = {};
                    rows.forEach(row => {
                        if (!floors[row.id]) {
                            floors[row.id] = {
                                id: row.id,
                                floor_number: row.floor_number,
                                floor_name: row.floor_name,
                                rooms: {}
                            };
                        }
                        
                        if (row.room_id && !floors[row.id].rooms[row.room_id]) {
                            floors[row.id].rooms[row.room_id] = {
                                id: row.room_id,
                                room_number: row.room_number,
                                room_name: row.room_name,
                                services: []
                            };
                        }
                        
                        if (row.service_id) {
                            floors[row.id].rooms[row.room_id].services.push({
                                id: row.service_id,
                                service_name: row.service_name,
                                quantity: row.quantity,
                                unit_price: row.unit_price,
                                service_total: row.service_total
                            });
                        }
                    });
                    
                    // Convert to arrays
                    order.floors = Object.values(floors).map(floor => ({
                        ...floor,
                        rooms: Object.values(floor.rooms)
                    }));
                    
                    resolve(order);
                });
            });
        });
    }

    static async updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [status, id],
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
                `DELETE FROM orders WHERE id = ?`,
                [id],
                function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });
    }

    static async getStats() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_orders,
                    SUM(total_price) as total_revenue,
                    COUNT(DISTINCT client_id) as unique_clients
                FROM orders
            `, (err, rows) => {
                if (err) reject(err);
                resolve(rows[0]);
            });
        });
    }
}

module.exports = Order;