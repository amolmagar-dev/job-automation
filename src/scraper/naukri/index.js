import browserInstance from '../../browser/browser.js';
import dotenv from 'dotenv';
import {
  loginToNaukri,
  applyForJobs,
  searchJobs,
  scrapePaginatedJobs
} from './action.js';

const browser = await browserInstance.getBrowser();
dotenv.config();

export async function startNaukriAutomation() {
  const page = await browser.newPage();

  // Set a real user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  await loginToNaukri(page);
  await searchJobs(page, 'node js', '3', 'Pune'); // or pass from CLI/env

  const currentUrl = page.url();

  const userPrefs = {
    location: 'Pune',
    minExp: 2,
    maxExp: 4,
    requiredSkills: ['Node.js', 'React'],
    minRating: 3.5
  };

  const jobs = await scrapePaginatedJobs(page, currentUrl, userPrefs);
  await applyForJobs(browser, jobs);

  await browserInstance.closeBrowser();
}

startNaukriAutomation();