// Main server entry point
import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { Server as SocketIOServer } from 'socket.io';
import config from '../../config/config.js';
import routes from './routes.js';
import setupSocketHandlers from './socket.js';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Fastify instance
const fastify = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: {
            target: 'pino-pretty'
        }
    }
});

// Initialize Socket.io directly
let io;

// Register cors
await fastify.register(fastifyCors, {
    origin: true // Allow all origins for now
});

// Register WebSocket support
await fastify.register(fastifyWebsocket);

// Serve static files for the frontend
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../frontend/public'),
    prefix: '/' // Serve frontend at root URL
});

// Register API routes
await fastify.register(routes, { prefix: '/api' });

// Start the server
const start = async () => {
    try {
        // Get port from config or use default
        const port = process.env.PORT || config.server?.port || 3000;
        const host = process.env.HOST || config.server?.host || '0.0.0.0';

        await fastify.listen({ port, host });

        // Initialize Socket.io after the server is listening
        io = new SocketIOServer(fastify.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        // Setup Socket.io handlers with the properly initialized io instance
        setupSocketHandlers(io);

        fastify.log.info(`Server listening on ${host}:${port}`);
        fastify.log.info('Socket.io is ready');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

// Export start function and fastify instance
export { start, fastify };