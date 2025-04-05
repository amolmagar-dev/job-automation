/**
 * Centralized logger utility using pino
 */
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log file paths
const logFilePath = path.join(logsDir, 'app.log');
const errorLogFilePath = path.join(logsDir, 'error.log');

// Create log file streams
const logFileStream = fs.createWriteStream(logFilePath, { flags: 'a' });
const errorLogFileStream = fs.createWriteStream(errorLogFilePath, { flags: 'a' });

// Determine if we're in a development environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure pino logger
const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined
}, pino.multistream([
    // Log everything to standard output in development
    { stream: process.stdout },
    // Log everything to file
    { stream: logFileStream },
    // Log errors and above to error file
    { stream: errorLogFileStream, level: 'error' }
]));

// Add a method to create child loggers with context
logger.withContext = (context) => {
    return logger.child(context);
};

// Log startup info
logger.info({
    env: process.env.NODE_ENV || 'development',
    logLevel: logger.level,
    time: new Date().toISOString()
}, 'Logger initialized');

export default logger;