/**
 * Production Batch Management Service
 * Port: 5001
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Service information
const service = {
  name: 'production_management',
  description: 'Production Batch Management Service',
  version: '1.0.0'
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: service.name,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: service.description + ' API',
    version: service.version,
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    service: service.name
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    service: service.name,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown handler
function gracefulShutdown(server) {
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

// Function to find available port
function findAvailablePort(startPort, maxTries = 10) {
  return new Promise((resolve, reject) => {
    const net = require('net');
    let currentPort = startPort;
    let tries = 0;

    function tryPort(port) {
      if (tries >= maxTries) {
        reject(new Error(`No available port found after ${maxTries} attempts`));
        return;
      }

      const server = net.createServer();
      
      server.listen(port, () => {
        server.close(() => {
          resolve(port);
        });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          tries++;
          console.log(`⚠️  Port ${port} is in use, trying ${port + 1}...`);
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });
    }

    tryPort(currentPort);
  });
}

// Start server
async function startServer() {
  let serverPort = PORT;
  
  // Try to find available port if default is in use
  try {
    serverPort = await findAvailablePort(PORT);
    if (serverPort !== PORT) {
      console.log(`🔄 Using port ${serverPort} instead of ${PORT}`);
    }
  } catch (error) {
    console.error('❌ Could not find available port:', error.message);
    process.exit(1);
  }
  
  const server = app.listen(serverPort, () => {
    console.log(`🚀 ${service.description} is running on port ${serverPort}`);
    console.log(`📊 Health check: http://localhost:${serverPort}/health`);
    console.log(`🔗 API endpoint: http://localhost:${serverPort}/api`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });

  gracefulShutdown(server);
  return server;
}

startServer().catch(console.error);

module.exports = app;
