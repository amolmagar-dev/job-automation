/**
 * Job Runner Service for Automatic Job Search
 * 
 * This module provides a service that manages and executes scheduled job searches
 * based on user configurations in MongoDB.
 */
import cron from 'node-cron';
import { JobConfigModel } from '../models/JobConfigModel.js';

class JobRunner {
    constructor(app) {
        this.app = app;
        this.isRunning = false;
        this.scheduledJobs = new Map(); // Map to keep track of scheduled jobs
        this.mainScheduler = null;
    }

    /**
     * Initialize the job runner
     */
    async initialize() {
        try {
            this.app.log.info('Initializing Job Runner service...');

            // Schedule the main job checker to run every minute
            this.mainScheduler = cron.schedule('* * * * *', async () => {
                await this.checkAndRunScheduledJobs();
            });

            // Load all active jobs on startup
            await this.loadActiveJobs();

            this.app.log.info('Job Runner service initialized successfully');
        } catch (error) {
            this.app.log.error({ err: error }, 'Failed to initialize Job Runner');
        }
    }

    /**
     * Load all active jobs from the database
     */
    async loadActiveJobs() {
        try {
            // Get all active job configs
            const activeJobs = await this.app.mongo.db.collection('jobConfigs')
                .find({ isActive: true })
                .toArray();

            this.app.log.info(`Found ${activeJobs.length} active jobs`);

            // Schedule each active job
            for (const job of activeJobs) {
                this.scheduleJob(job);
            }
        } catch (error) {
            this.app.log.error({ err: error }, 'Error loading active jobs');
        }
    }

    /**
     * Schedule a job based on its configuration
     * @param {Object} job - The job configuration
     */
    scheduleJob(job) {
        if (!job.schedule || !job.schedule.frequency) {
            this.app.log.warn(`Job ${job._id} has invalid schedule configuration`);
            return;
        }

        // Calculate cron expression based on schedule configuration
        const cronExpression = this.calculateCronExpression(job.schedule);

        if (!cronExpression) {
            this.app.log.warn(`Invalid schedule for job ${job._id}`);
            return;
        }

        this.app.log.info(`Scheduling job ${job._id} with cron: ${cronExpression}`);

        // Schedule the job with node-cron
        const scheduledJob = cron.schedule(cronExpression, async () => {
            await this.executeJob(job._id.toString());
        });

        // Store the scheduled job reference
        this.scheduledJobs.set(job._id.toString(), scheduledJob);
    }

    /**
     * Calculate cron expression based on schedule configuration
     * @param {Object} schedule - The schedule configuration
     * @returns {String|null} - The cron expression or null if invalid
     */
    calculateCronExpression(schedule) {
        try {
            const { frequency, days, time } = schedule;

            // Extract hours and minutes from time (format: HH:mm)
            const [hours, minutes] = (time || '00:00').split(':').map(Number);

            switch (frequency) {
                case 'daily':
                    return `${minutes} ${hours} * * *`;

                case 'weekly':
                    if (!days || !Array.isArray(days) || days.length === 0) {
                        return null;
                    }
                    // Convert days array to cron day expression (0-6, where 0 is Sunday)
                    const weekDays = days.join(',');
                    return `${minutes} ${hours} * * ${weekDays}`;

                case 'custom':
                    if (!days || !Array.isArray(days) || days.length === 0) {
                        return null;
                    }
                    // For custom schedule, treat days as days of week
                    const customDays = days.join(',');
                    return `${minutes} ${hours} * * ${customDays}`;

                default:
                    return null;
            }
        } catch (error) {
            this.app.log.error({ err: error }, 'Error calculating cron expression');
            return null;
        }
    }

    /**
     * Check for jobs that need to be run and execute them
     */
    async checkAndRunScheduledJobs() {
        if (this.isRunning) {
            return; // Prevent concurrent runs
        }

        this.isRunning = true;

        try {
            // Find jobs due for execution
            const jobsToRun = await JobConfigModel.findDueForExecution(this.app);

            if (jobsToRun.length > 0) {
                this.app.log.info(`Found ${jobsToRun.length} jobs to run`);
            }

            // Execute each job
            for (const job of jobsToRun) {
                await this.executeJob(job._id.toString());
            }
        } catch (error) {
            this.app.log.error({ err: error }, 'Error checking scheduled jobs');
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Execute a job by its ID
     * @param {String} jobId - The job ID
     */
    async executeJob(jobId) {
        try {
            this.app.log.info(`Executing job ${jobId}...`);

            // Get job config
            const job = await this.app.mongo.db.collection('jobConfigs').findOne({
                _id: new this.app.mongo.ObjectId(jobId)
            });

            if (!job) {
                this.app.log.warn(`Job ${jobId} not found`);
                return;
            }

            if (!job.isActive) {
                this.app.log.warn(`Job ${jobId} is inactive`);
                return;
            }

            // Get user
            const user = await this.app.mongo.db.collection('users').findOne({
                _id: new this.app.mongo.ObjectId(job.user)
            });

            if (!user || !user.isActive) {
                this.app.log.warn(`User for job ${jobId} is inactive or not found`);
                return;
            }

            // Get portal credentials
            const credentials = await this.app.mongo.db.collection('portalCredentials').findOne({
                user: job.user,
                portal: job.portal,
                isValid: true
            });

            if (!credentials) {
                this.app.log.warn(`No valid credentials found for job ${jobId}, portal: ${job.portal}`);
                return;
            }

            // Execute search based on portal type
            // const results = await searchPortal(
            //     this.app,
            //     job.portal,
            //     credentials,
            //     job.searchConfig,
            //     job.filterConfig
            // );

            // Store results if any
            if (results && results.length > 0) {
                await this.storeJobResults(job, results);
            }

            // Update the job's last run and next run time
            await JobConfigModel.updateNextRunTime(this.app, jobId);

            this.app.log.info(`Job ${jobId} executed successfully, found ${results ? results.length : 0} results`);
        } catch (error) {
            this.app.log.error({ err: error }, `Error executing job ${jobId}`);
        }
    }

    /**
     * Store job results in the database
     * @param {Object} job - The job configuration
     * @param {Array} results - Array of job search results
     */
    async storeJobResults(job, results) {
        try {
            const now = new Date();

            // Prepare bulk operations
            const operations = results.map(result => ({
                insertOne: {
                    document: {
                        jobConfig: job._id,
                        user: job.user,
                        portal: job.portal,
                        title: result.title,
                        company: result.company,
                        location: result.location,
                        salary: result.salary,
                        url: result.url,
                        description: result.description,
                        isApplied: false,
                        isRejected: false,
                        isSaved: false,
                        createdAt: now,
                        updatedAt: now
                    }
                }
            }));

            // Insert all results
            if (operations.length > 0) {
                await this.app.mongo.db.collection('jobResults').bulkWrite(operations);
            }
        } catch (error) {
            this.app.log.error({ err: error }, 'Error storing job results');
        }
    }

    /**
     * Stop the job runner and clear all scheduled jobs
     */
    stop() {
        this.app.log.info('Stopping Job Runner service...');

        // Stop the main scheduler
        if (this.mainScheduler) {
            this.mainScheduler.stop();
        }

        // Stop all scheduled jobs
        for (const [jobId, scheduledJob] of this.scheduledJobs.entries()) {
            scheduledJob.stop();
            this.app.log.debug(`Stopped scheduled job ${jobId}`);
        }

        // Clear the map
        this.scheduledJobs.clear();

        this.app.log.info('Job Runner service stopped');
    }

    /**
     * Add a new job to the scheduler
     * @param {String} jobId - The job ID
     */
    async addJob(jobId) {
        try {
            const job = await this.app.mongo.db.collection('jobConfigs').findOne({
                _id: new this.app.mongo.ObjectId(jobId)
            });

            if (!job || !job.isActive) {
                this.app.log.warn(`Job ${jobId} not found or inactive`);
                return;
            }

            // Remove existing scheduled job if it exists
            this.removeJob(jobId);

            // Schedule the new job
            this.scheduleJob(job);

            this.app.log.info(`Added job ${jobId} to scheduler`);
        } catch (error) {
            this.app.log.error({ err: error }, `Error adding job ${jobId}`);
        }
    }

    /**
     * Remove a job from the scheduler
     * @param {String} jobId - The job ID
     */
    removeJob(jobId) {
        if (this.scheduledJobs.has(jobId)) {
            const scheduledJob = this.scheduledJobs.get(jobId);
            scheduledJob.stop();
            this.scheduledJobs.delete(jobId);
            this.app.log.info(`Removed job ${jobId} from scheduler`);
        }
    }

    /**
     * Update a job in the scheduler
     * @param {String} jobId - The job ID
     */
    async updateJob(jobId) {
        // Simply re-add the job (which will handle removing the old one)
        await this.addJob(jobId);
    }
}

/**
 * Create and register the job runner service with Fastify
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Plugin options
 */
export default async function jobRunnerPlugin(fastify, options) {
    // Create the job runner instance
    const jobRunner = new JobRunner(fastify);

    // Decorate Fastify with the job runner
    fastify.decorate('jobRunner', jobRunner);

    // Initialize the job runner after server starts
    fastify.addHook('onReady', async () => {
        await jobRunner.initialize();
        });

    // Clean up on server close
    fastify.addHook('onClose', async (instance) => {
        instance.jobRunner.stop();
    });

    // Register routes to manage jobs
    fastify.put('/api/jobs/:id/schedule', async (request, reply) => {
        const { id } = request.params;

        try {
            await jobRunner.updateJob(id);
            return { success: true, message: 'Job scheduled successfully' };
        } catch (error) {
            request.log.error({ err: error }, 'Error scheduling job');
            return reply.code(500).send({ success: false, message: 'Failed to schedule job' });
        }
    });

    fastify.delete('/api/jobs/:id/schedule', async (request, reply) => {
        const { id } = request.params;

        try {
            jobRunner.removeJob(id);
            return { success: true, message: 'Job removed from scheduler' };
        } catch (error) {
            request.log.error({ err: error }, 'Error removing job from scheduler');
            return reply.code(500).send({ success: false, message: 'Failed to remove job from scheduler' });
        }
    });
}