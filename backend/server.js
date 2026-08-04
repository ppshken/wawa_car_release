const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const masterRoutes = require('./src/routes/master.routes');
const carReleaseRoutes = require('./src/routes/carRelease.routes');
const listStoreRoutes = require('./src/routes/listStore.routes');
const reportRoutes = require('./src/routes/report.routes');
const userManagementRoutes = require('./src/routes/userManagement.routes');
const masterDataRoutes = require('./src/routes/masterData.routes');
const optimoRouteRoutes = require('./src/routes/optimoRoute.routes');
const apiKeyRoutes = require('./src/routes/apiKey.routes');

const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // fallback for /api/users
app.use('/api', masterRoutes);
app.use('/api', carReleaseRoutes);
app.use('/api', listStoreRoutes);
app.use('/api', reportRoutes);
app.use('/api/manage', userManagementRoutes);
app.use('/api/master', masterDataRoutes);
app.use('/api', masterDataRoutes);
app.use('/api/optimoroute', optimoRouteRoutes);
app.use('/api', optimoRouteRoutes);
app.use('/api', apiKeyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Wawa Car Release Management API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 Wawa Car Release Backend Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`================================================`);
});
