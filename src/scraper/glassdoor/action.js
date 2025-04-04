import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const COOKIE_PATH = './cache/glassdoor_cookies.json';

export async function loginToGlassdoor(page) {
  if (fs.existsSync(COOKIE_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf8'));
    await page.setCookie(...cookies);
    await page.goto('https://www.glassdoor.co.in/index.htm', { waitUntil: 'networkidle2' });

    if (page.url().includes('Community/index.htm')) {
      console.log('🎉 Already logged in!');
      return;
    }

    console.log('⚠️ Session expired. Re-logging in...');
    fs.unlinkSync(COOKIE_PATH);
  }
  await new Promise(resolve => setTimeout(resolve, 3000));

  await page.goto('https://www.glassdoor.co.in/index.htm', { waitUntil: 'networkidle2' });

  // Step 2: Wait for email input
  await page.waitForSelector('#inlineUserEmail');
  await page.type('#inlineUserEmail', process.env.NAUKRI_EMAIL, { delay: 100 });

  // Step 3: Continue with email
  await page.click('button[data-test="email-form-button"]');

  // Step 4: Wait for password field and enter it
  await page.waitForSelector('input#inlineUserPassword', { timeout: 8000 });
  await page.type('input#inlineUserPassword', process.env.NAUKRI_PASSWORD, { delay: 100 });

  // Step 5: Final Sign In
  await Promise.all([
    page.click("button[type='submit']"),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  // Save cookies
  const cookies = await page.cookies();
  fs.mkdirSync(path.dirname(COOKIE_PATH), { recursive: true });
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies));
  console.log('✅ Logged in & cookies saved for Glassdoor.');
}
 