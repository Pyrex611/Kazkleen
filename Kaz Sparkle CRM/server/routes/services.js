const express = require('express');
const Service = require('../models/Service');
const { requireManager } = require('../middleware/auth');
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.getAll();
        res.json(services);
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new service (managers only)
router.post('/', requireManager, async (req, res) => {
    try {
        const { name, price, description } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }
        
        const serviceId = await Service.create({ name, price, description });
        res.json({ message: 'Service created successfully', serviceId });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update service (managers only)
router.put('/:id', requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }
        
        const changes = await Service.update(id, { name, price, description });
        if (changes === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete service (managers only)
router.delete('/:id', requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        
        const changes = await Service.delete(id);
        if (changes === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;