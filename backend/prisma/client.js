// Import the Prisma Client
const { PrismaClient } = require('@prisma/client');

// Create a new instance of PrismaClient
const prisma = new PrismaClient();

// Export the instance to use it in other parts of the application
module.exports = prisma;
