import { downloadAndSendResumeToGemini } from '../../../ai/analyze-profile.js';
import browserInstance from '../../../browser/browser.js';

export const downloadNaukriResumeGenerateUserProfilePromt = async (credentials) => {
    const browser = await browserInstance.getBrowser();

      const page = await browser.newPage();
    
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
    
  let data = await downloadAndSendResumeToGemini(page, credentials);
    browserInstance.closeBrowser();
    return data;
}