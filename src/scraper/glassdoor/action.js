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


export async function searchGlassdoorJobs(page, keyword, location) {
  try {
    console.log(`[INFO] Navigating to Glassdoor job search page`);
    await page.goto('https://www.glassdoor.co.in/Job/index.htm', { waitUntil: 'networkidle2' });

    console.log(`[INFO] Waiting for job search inputs to load`);
    await page.waitForSelector('#searchBar-jobTitle', { visible: true });
    await page.waitForSelector('#searchBar-location', { visible: true });

    console.log(`[INFO] Typing keyword: ${keyword}`);
    const keywordInput = await page.$('#searchBar-jobTitle');
    await keywordInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await keywordInput.type(keyword, { delay: 100 });

    console.log(`[INFO] Typing location: ${location}`);
    const locationInput = await page.$('#searchBar-location');
    await locationInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await locationInput.type(location, { delay: 100 });

    console.log(`[INFO] Pressing Enter to search`);
    await page.keyboard.press('Enter');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log(`[INFO] Checking for job alert modal close button`);
    const closeButton = await page.$('button[data-test="job-alert-modal-close"]');
    if (closeButton) {
      console.log(`[INFO] Job alert modal found. Closing it.`);
      await closeButton.click();
    }


    console.log(`[INFO] Sorting jobs by 'Most recent'`);
    await page.waitForSelector('button[data-test="sortBy"]', { visible: true });
    await page.click('button[data-test="sortBy"]');

    await page.waitForSelector('ul.ChoiceList_choiceList__6GYUz', { visible: true });

    const buttons = await page.$$('ul.ChoiceList_choiceList__6GYUz > li > button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText.trim().toLowerCase(), btn);
      if (text.includes('most recent')) {
        await btn.focus(); // ensure it's in focus
        await btn.click({ delay: 100 });
        console.log(`[SUCCESS] 'Most recent' selected`);
        break;
      }
    }

    console.log(`[INFO] Scraping job listings`);
    await page.waitForSelector('ul.JobsList_jobsList__lqjTr > li[data-test="jobListing"]', { visible: true });

    const jobs = (await page.$$eval('ul.JobsList_jobsList__lqjTr > li[data-test="jobListing"]', jobCards => {
      return jobCards.map(card => {
        const title = card.querySelector('[data-test="job-title"]')?.innerText?.trim() || '';
        const company = card.querySelector('.EmployerProfile_compactEmployerName__9MGcV')?.innerText?.trim() || '';
        const location = card.querySelector('[data-test="emp-location"]')?.innerText?.trim() || '';
        const salary = card.querySelector('[data-test="detailSalary"]')?.innerText?.trim() || '';
        const posted = card.querySelector('[data-test="job-age"]')?.innerText?.trim() || '';
        const link = card.querySelector('[data-test="job-title"]')?.href || '';
        const easyApply = card.innerText.toLowerCase().includes('easy apply');
    
        return easyApply
          ? { title, company, location, salary, posted, link, easyApply }
          : null;
      });
    })).filter(Boolean); // 🚀 Removes null/undefined

    console.log(`[SUCCESS] Scraped ${jobs.length} job(s)`);
    return jobs;
  } catch (error) {
    console.error(`[ERROR] searchGlassdoorJobs: ${error.message}`);
  }
}

export async function applyForJobs(browser, jobs) {
  const page = await browser.newPage();

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n[INFO] Navigating to job: ${job.title} → ${job.link}`);

    try {
      await page.goto(job.link, { waitUntil: 'networkidle2' });

      console.log(`[INFO] Waiting for Easy Apply button`);
      await page.waitForSelector('button[data-test="easyApply"]', { visible: true, timeout: 5000 });
      await page.click('button[data-test="easyApply"]');
      console.log(`[CLICKED] Easy Apply button`);

      // TODO: Handle the application form here in next steps

      console.log(`[SUCCESS] Easy Apply opened for: ${job.title}`);
    } catch (err) {
      console.error(`[ERROR] Failed to open Easy Apply for ${job.title}: ${err.message}`);
    }

  }

  await page.close();
}

