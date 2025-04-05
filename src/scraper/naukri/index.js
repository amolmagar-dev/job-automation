import browserInstance from '../../browser/browser.js';
import dotenv from 'dotenv';
import {
  loginToNaukri,
  applyForJobs,
  searchJobs,
  scrapePaginatedJobs,
  downloadResume
} from './action.js';
import { isBotTrained } from './helper.js';
import logger from '../../utils/logger.js';

dotenv.config();

// Track the active automation page for streaming
let activePage = null;
let activeJobId = null;

// Function to get the current active page for streaming
export function getActivePage() {
  return activePage;
}

// Function to get the current job ID
export function getActiveJobId() {
  return activeJobId;
}

export async function startNaukriAutomation(jobId = `naukri_${Date.now()}`) {
  const browser = await browserInstance.getBrowser();
  let index = 0;
  activeJobId = jobId;

  // Dynamic keyword list
  const searchConfigs = [
    { keyword: process.env.JOB_KEYWORDS, exp: process.env.JOB_EXPERIENCE, location: process.env.JOB_LOCATION },
  ];

  while (true) {
    try {
      const page = await browser.newPage();

      // Set this as the active page for streaming
      activePage = page;

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      logger.info(`[Job ${jobId}] Starting Naukri automation`);
      await loginToNaukri(page);

      // Check if the bot is trained
      const isTrained = isBotTrained()
      if (!isTrained) {
        logger.info(`[Job ${jobId}] 📥 Downloading resume...`);
        await downloadResume(page);
      }

      // Pick dynamic config
      const { keyword, exp, location } = searchConfigs[index];
      logger.info(`[Job ${jobId}] 🔍 Searching for: ${keyword} in ${location} (Exp: ${exp} yrs)`);

      await searchJobs(page, keyword, exp, location);

      const currentUrl = page.url();

      const userPrefs = {
        location,
        minExp: Number(exp),
        maxExp: Number(exp) + 2,
        requiredSkills: keyword.split(',').map(skill => skill.trim()),
        minRating: 3.5
      };

      const jobs = await scrapePaginatedJobs(page, currentUrl, userPrefs);
      if (jobs.length === 0) {
        logger.info(`[Job ${jobId}] No jobs found for the given criteria`);
      } else {
        logger.info(`[Job ${jobId}] Found ${jobs.length} jobs matching criteria`);
        logger.info(`[Job ${jobId}] Applying for jobs...`);
        await applyForJobs(browser, jobs);
      }

      await page.close();

      // Clear active page reference
      if (activePage === page) {
        activePage = null;
      }

      // Move to next config or loop back to start
      index = (index + 1) % searchConfigs.length;

      logger.info(`[Job ${jobId}] Waiting 5 minutes before next run...`);
      await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000));

    } catch (err) {
      logger.error(`[Job ${jobId}] Error during automation loop:`, err);

      // Clear active page reference if there's an error
      activePage = null;
    }
  }
}

// Only auto-start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startNaukriAutomation();
}