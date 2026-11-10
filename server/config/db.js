const dns = require('dns');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

// Configure DNS resolver for local development
if (process.env.DNS_SERVERS) {
  const dnsServers = process.env.DNS_SERVERS
    .split(',')
    .map(server => server.trim())
    .filter(Boolean);

  dns.setServers(dnsServers);

  console.log('🌐 Custom DNS configured:', dnsServers);
}

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in environment variables');
    }

    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });

    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`📦 Database: ${mongoose.connection.name}`);

  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed!');
    console.error(err.message);

    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully.');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };