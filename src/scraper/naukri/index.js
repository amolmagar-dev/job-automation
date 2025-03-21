import browserInstance from '../../browser/browser.js';
import dotenv from 'dotenv';
import {loginToNaukri, applyForJobs, searchJobs } from './action.js';
const browser = await browserInstance.getBrowser();

dotenv.config(); // Load environment variables

export async function startNaukriAutomation() {
  const page = await browser.newPage();

  // Set a real user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  await loginToNaukri(page);
  await searchJobs(page);
  await applyForJobs(page);

  // Close the browser session after applying
  await browserInstance.closeBrowser();
}

startNaukriAutomation()