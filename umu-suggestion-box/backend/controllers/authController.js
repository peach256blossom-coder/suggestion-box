const User = require('../models/User');
const Dean = require('../models/Dean');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const user = new User({ email, password, role });
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      message: 'User registered', 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });
    
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Dean Login
exports.deanLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const dean = await Dean.findOne({ email });
    
    if (!dean) return res.status(404).json({ message: 'Dean account not found' });
    
    const isPasswordValid = await bcrypt.compare(password, dean.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });
    
    const token = jwt.sign(
      { deanId: dean._id, role: dean.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      message: 'Dean login successful', 
      token, 
      user: { 
        id: dean._id, 
        email: dean.email, 
        fullName: dean.fullName,
        role: dean.role 
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Dean Registration (Admin only)
exports.registerDean = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    
    const deanExists = await Dean.findOne({ email });
    if (deanExists) return res.status(400).json({ message: 'Dean account already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const dean = new Dean({
      email,
      password: hashedPassword,
      fullName,
      role: 'dean_of_students'
    });
    
    await dean.save();
    
    res.status(201).json({ 
      message: 'Dean account created successfully',
      dean: {
        id: dean._id,
        email: dean.email,
        fullName: dean.fullName,
        role: dean.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getCurrentDean = async (req, res, next) => {
  try {
    const dean = await Dean.findById(req.user.deanId);
    res.json(dean);
  } catch (error) {
    next(error);
  }
};