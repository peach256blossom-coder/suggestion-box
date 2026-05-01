require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const suggestionRoutes = require('./routes/suggestions');
const adminRoutes = require('./routes/admin');
const deanRoutes = require('./routes/dean');
const supportRoutes = require('./routes/support');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dean', deanRoutes);
app.use('/api/support', supportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✓', timestamp: new Date() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Backend Server running on http://localhost:${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api\n`);
});