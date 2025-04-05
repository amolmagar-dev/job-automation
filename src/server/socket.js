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
                const { jobId } = data || {};
                logger.info(`Client ${sessionId} requested to start streaming job ${jobId || 'unknown'}`);

                // Get browser instance and create new page
                const browser = await browserInstance.getBrowser();
                const page = await browser.newPage();

                // Set viewport size to match streaming dimensions
                await page.setViewport({
                    width: 1280,
                    height: 720
                });

                // Navigate to a starting page (this could be configurable)
                await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });

                // Update client with status
                socket.emit('status', {
                    status: 'initializing',
                    message: 'Starting browser automation',
                    jobId
                });

                // Store page reference on socket for cleanup
                socket.data.page = page;
                socket.data.jobId = jobId;

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

                // Emit status update
                socket.emit('status', {
                    status: 'streaming',
                    message: 'Started streaming browser activity',
                    jobId
                });
            } catch (error) {
                logger.error(`Error starting stream for ${sessionId}:`, error);
                socket.emit('status', {
                    status: 'error',
                    message: `Failed to start streaming: ${error.message}`
                });
            }
        });

        // Handle client requesting to stop streaming
        socket.on('stop-stream', async () => {
            const jobId = socket.data?.jobId || 'unknown';
            logger.info(`Client ${sessionId} requested to stop streaming job ${jobId}`);

            // Stop the streaming session
            browserInstance.stopStreaming(sessionId);

            // Close the page if we have a reference to it
            if (socket.data.page) {
                try {
                    await socket.data.page.close();
                    socket.data.page = null;
                } catch (error) {
                    logger.error(`Error closing page for session ${sessionId}:`, error);
                }
            }

            socket.emit('status', {
                status: 'stopped',
                message: 'Browser streaming stopped',
                jobId
            });
        });

        // Handle client disconnection
        socket.on('disconnect', () => {
            logger.info(`Streaming client disconnected: ${sessionId}`);

            // Stop any active streaming
            browserInstance.stopStreaming(sessionId);

            // Close the page if we have a reference to it
            if (socket.data.page) {
                socket.data.page.close().catch(err => {
                    logger.error(`Error closing page on disconnect: ${err.message}`);
                });
            }
        });
    });

    // Return the io instance
    return io;
}