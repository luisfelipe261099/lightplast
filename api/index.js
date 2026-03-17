require('dotenv').config();

// Import the compiled Express app from crm build
const app = require('../crm/dist/api/index.js').default;

// Vercel expects default export
module.exports = app;
