const mongoose = require('mongoose');
const logger = require('./logger');
const MONGODB_URI = "mongodb+srv://pankajrajputiet_db_user:YzDqHObMtjXOLB7A@cluster0.sxzxzrc.mongodb.net/school_management?retryWrites=true&w=majority";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://pankajrajputiet_db_user:YzDqHObMtjXOLB7A@cluster0.sxzxzrc.mongodb.net/school_management?retryWrites=true&w=majority");
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
