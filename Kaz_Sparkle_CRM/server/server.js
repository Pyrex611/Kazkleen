const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const database = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const serviceRoutes = require('./routes/services');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Session configuration
app.use(session({
    secret: 'kazkleen-crm-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Authentication middleware
const { authenticate } = require('./middleware/auth');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/services', authenticate, serviceRoutes);

// Serve frontend files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/orders.html'));
});

app.get('/new-order', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/new-order.html'));
});

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/users.html'));
});

app.get('/worker', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/worker.html'));
});

// Initialize database and start server
database.init().then(() => {
    app.listen(PORT, () => {
        console.log(`Kazkleen CRM Server running on port ${PORT}`);
        console.log(`Frontend: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});