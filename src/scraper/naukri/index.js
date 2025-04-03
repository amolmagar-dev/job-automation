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

dotenv.config();

const browser = await browserInstance.getBrowser();

// Dynamic keyword list
const searchConfigs = [
  { keyword: 'nodejs , reactjs', exp: '2', location: 'Pune' }
];

export async function startNaukriAutomation() {
  let index = 0;

  while (true) {
    try {
      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await loginToNaukri(page);

      // Check if the bot is trained
      const isTrained = isBotTrained()
      if (!isTrained) {        // download the resume
        console.log('📥 Downloading resume...');
        await downloadResume(page);
      }

      // Pick dynamic config
      const { keyword, exp, location } = searchConfigs[index];
      console.log(`🔍 Searching for: ${keyword} in ${location} (Exp: ${exp} yrs)`);

      await searchJobs(page, keyword, exp, location);

      const currentUrl = page.url();

      const userPrefs = {
        location,
        minExp: Number(exp),
        maxExp: Number(exp) + 2,
        requiredSkills: [],
        minRating: 3.5
      };

      const jobs = await scrapePaginatedJobs(page, currentUrl, userPrefs);
      if (jobs.length === 0) {
        console.log('No jobs found for the given criteria');
      } else {
        await applyForJobs(browser, jobs);
      }

      await page.close();

      // Move to next config or loop back to start
      index = (index + 1) % searchConfigs.length;

      console.log('Waiting 5 minutes before next run...');
      await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000));

    } catch (err) {
      console.error('Error during automation loop:', err);
    }
  }
}

startNaukriAutomation();
