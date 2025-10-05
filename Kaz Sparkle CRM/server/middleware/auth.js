const authenticate = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

const requireManager = (req, res, next) => {
    if (req.session && req.session.role === 'manager') {
        next();
    } else {
        res.status(403).json({ error: 'Manager access required' });
    }
};

module.exports = {
    authenticate,
    requireManager
};