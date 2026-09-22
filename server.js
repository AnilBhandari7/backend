require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const employeeRoutes = require('./routes/employee');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({
  origin: '*', // Or use process.env.FRONTEND_URL if you want to restrict it
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/safety_detective', {
  serverSelectionTimeoutMS: 5000, // Fail fast if DB is unreachable
})
  .then(() => {
    console.log('MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  });

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);