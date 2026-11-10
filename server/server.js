const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PORT, UPLOAD_DIR } = require('./config/env');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const documentRoutes = require('./routes/documentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const gapRoutes = require('./routes/gapRoutes');
const conflictRoutes = require('./routes/conflictRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const handoverRoutes = require('./routes/handoverRoutes');
const sampleRoutes = require('./routes/sampleRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploads (PDFs, docs)
app.use('/uploads', express.static(UPLOAD_DIR));

// Static client bundle serving (single-port production deployment support)
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'THREADKEEP',
    version: '1.0.0',
    team: 'SPY_2.O',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gaps', gapRoutes);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/handovers', handoverRoutes);
app.use('/api/sample', sampleRoutes);

// SPA client fallback route
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(errorHandler);

// Boot server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 THREADKEEP Backend Service running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🛡️  Team: SPY_2.O | "Keep the knowledge. Keep the work moving."`);
      console.log(`====================================================`);
    });

    // Handle port-in-use error gracefully
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`   Run: npx kill-port ${PORT}   OR   taskkill /F /IM node.exe`);
        console.error(`   Then restart the server.\n`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

  } catch (err) {
    console.error('Fatal Server Boot Error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
