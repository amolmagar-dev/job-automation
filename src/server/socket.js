/**
 * Socket.io event handlers for browser streaming
 */
import logger from '../utils/logger.js';
import browserInstance from '../browser/browser.js';

/**
 * Setup Socket.io event handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
export default function setupSocketHandlers(io) {
    // Namespace for browser streaming
    const streamNamespace = io.of('/browser-stream');

    streamNamespace.on('connection', (socket) => {
        const sessionId = socket.id;
        logger.info(`New streaming client connected: ${sessionId}`);

        // Handle client requesting to start streaming
        socket.on('start-stream', async (data) => {
            try {
                const { jobId, page } = data || {};

                if (!page) {
                    socket.emit('status', {
                        status: 'error',
                        message: 'No page provided for streaming',
                        jobId
                    });
                    return;
                }

                logger.info(`Client ${sessionId} requested to start streaming job ${jobId || 'unknown'}`);

                // Emit status update
                socket.emit('status', {
                    status: 'streaming',
                    message: 'Started streaming browser activity',
                    jobId
                });

                // Start streaming the page
                await browserInstance.startStreaming(
                    sessionId,
                    page,
                    (frameData) => {
                        // Emit frame data to the client
                        socket.emit('stream-frame', frameData);
                    },
                    {
                        frameRate: 25,
                        quality: 80,
                        maxWidth: 1280,
                        maxHeight: 720
                    }
                );
            } catch (error) {
                logger.error(`Error starting stream for ${sessionId}:`, error);
                socket.emit('status', {
                    status: 'error',
                    message: `Failed to start streaming: ${error.message}`
                });
            }
        });

        // Handle client requesting to stop streaming
        socket.on('stop-stream', () => {
            logger.info(`Client ${sessionId} requested to stop streaming`);

            // Stop the streaming session
            browserInstance.stopStreaming(sessionId);

            socket.emit('status', {
                status: 'stopped',
                message: 'Browser streaming stopped'
            });
        });

        // Handle client disconnection
        socket.on('disconnect', () => {
            logger.info(`Streaming client disconnected: ${sessionId}`);

            // Stop any active streaming
            browserInstance.stopStreaming(sessionId);
        });
    });

    // Return the io instance
    return io;
}