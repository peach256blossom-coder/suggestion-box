const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId) {
      req.user = decoded;
    } else if (decoded.deanId) {
      req.dean = decoded;
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'department_head' && req.dean?.role !== 'dean_of_students') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  });
};

const deanAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.dean?.role !== 'dean_of_students') {
      return res.status(403).json({ message: 'Only Dean of Students can access this' });
    }
    next();
  });
};

module.exports = { auth, adminAuth, deanAuth };