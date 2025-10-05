const express = require('express');
const Order = require('../models/Order');
const Client = require('../models/Client');
const Service = require('../models/Service');
const router = express.Router();

// Generate quote number
function generateQuoteNumber() {
    const timestamp = new Date().getTime().toString().slice(-6);
    return `Q-${timestamp}`;
}

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.getById(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const { client, order_date, special_instructions, floors } = req.body;
        
        if (!client || !client.name || !order_date) {
            return res.status(400).json({ error: 'Client name and order date are required' });
        }
        
        // Create or find client
        const clientId = await Client.findOrCreate(client);
        
        // Generate quote number
        const quoteNumber = generateQuoteNumber();
        
        // Prepare services with pricing
        const services = await Service.getAll();
        const serviceMap = new Map(services.map(s => [s.name, s]));
        
        const orderData = {
            client_id: clientId,
            quote_number: quoteNumber,
            order_date,
            special_instructions,
            created_by: req.session.userId,
            floors: floors.map(floor => ({
                floor_name: floor.floor_name,
                rooms: floor.rooms.map(room => ({
                    room_name: room.room_name,
                    services: room.services.map(service => {
                        const serviceInfo = serviceMap.get(service.service_type);
                        return {
                            service_id: serviceInfo.id,
                            quantity: service.quantity,
                            unit_price: serviceInfo.price
                        };
                    })
                }))
            }))
        };
        
        const orderId = await Order.create(orderData);
        res.json({ message: 'Order created successfully', orderId, quoteNumber });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const changes = await Order.updateStatus(id, status);
        if (changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get order statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await Order.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;