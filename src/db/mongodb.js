// mongodb-setup.js

import fastifyMongo from '@fastify/mongodb';
import fastifyPlugin from 'fastify-plugin';

/**
 * MongoDB connection plugin for JobSuiteX
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Plugin options
 */
async function mongoConnector(fastify, options) {
    // Get MongoDB connection string from environment variables
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsuitex';

    // Register MongoDB plugin
    fastify.register(fastifyMongo, {
        url: mongoUrl,
        forceClose: true,
        // Optional: If you need to set database connection options
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    });

    // Create indexes when the connection is ready
    fastify.addHook('onReady', async () => {
        try {
            // Create a unique index on email field to prevent duplicates
            await fastify.mongo.db.collection('users').createIndex(
                { email: 1 },
                { unique: true }
            );

            // Optional: Create additional indexes for performance optimization
            await fastify.mongo.db.collection('users').createIndex({ googleId: 1 });
            await fastify.mongo.db.collection('users').createIndex({ authProvider: 1 });

            fastify.log.info('MongoDB indexes created successfully');
        } catch (err) {
            fastify.log.error('Error creating MongoDB indexes:', err);
        }
    });
}

// Export the plugin using fastify-plugin for proper encapsulation
export default fastifyPlugin(mongoConnector);