const express = require('express');
const User = require('../models/User');
const { requireManager } = require('../middleware/auth');
const router = express.Router();

// Get all users (managers only)
router.get('/', requireManager, async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new user (managers only)
router.post('/', requireManager, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if username or email already exists
        const existingUser = await User.findByUsername(username) || await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        const userId = await User.create({ username, email, password, role });
        res.json({ message: 'User created successfully', userId });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user (managers only)
router.delete('/:id', requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (parseInt(id) === req.session.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        const changes = await User.delete(id);
        if (changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;