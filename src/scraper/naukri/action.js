import fs from 'fs'; // File system to store cookies
import dotenv from 'dotenv';
import browserInstance from '../../browser/browser.js';
const browser = await browserInstance.getBrowser();

dotenv.config(); // Load .env credentials

const COOKIE_PATH = './data/naukri_cookies.json'; // Path to store session

export async function loginToNaukri(page) {
  console.log('🔍 Checking for existing session...');

  // **Load Cookies if Available**
  if (fs.existsSync(COOKIE_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf8'));
    await page.setCookie(...cookies);
    console.log('✅ Loaded saved session cookies!');

    // **Verify session by checking if we are still logged in**
    await page.goto('https://www.naukri.com/', { waitUntil: 'networkidle2' });
    const loggedIn = await page.evaluate(() => !!document.querySelector("a[title='Logout']"));

    if (loggedIn) {
      console.log('🎉 Already logged in! Skipping login...');
      return;
    } else {
      console.log('⚠️ Session expired. Logging in again...');
      fs.unlinkSync(COOKIE_PATH); // Delete old cookies
    }
  }

  console.log('🔍 Navigating to Naukri login...');
  await page.goto('https://www.naukri.com/', { waitUntil: 'networkidle2' });

  // Wait for login button
  await page.waitForSelector("a[title='Jobseeker Login']", { visible: true });

  // Click login button
  await page.click("a[title='Jobseeker Login']");
  console.log('✅ Clicked on Login button');

  // Wait for login form
  await page.waitForSelector("input[type='text']", { visible: true });

  // **Type credentials with human-like delay**
  await page.type("input[type='text']", process.env.NAUKRI_EMAIL, {
    delay: Math.random() * 200 + 100,
  });
  await page.type("input[type='password']", process.env.NAUKRI_PASSWORD, {
    delay: Math.random() * 200 + 100,
  });

  // Click login
  await page.click("button[type='submit']");
  console.log('✅ Submitted login credentials');

  // Wait for navigation to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('🎉 Successfully logged in!');

  // **Save session cookies**
  const cookies = await page.cookies();
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies));
  console.log('✅ Session saved! Next time, you won’t need to log in.');
}

export async function searchJobs(
  page,
  keyword = 'React js',
  experience = '3',
  location = 'Bangalore'
) {
  console.log(
    `🔍 Searching for: ${keyword} jobs with ${experience} years experience in ${location}`
  );

  // **Ensure the search bar is visible**
  await page.waitForSelector('.nI-gNb-sb__main', { visible: true });

  // **Click and enter job title**
  const keywordInput = await page.$(
    "input.suggestor-input[placeholder='Enter keyword / designation / companies']"
  );
  if (keywordInput) {
    await keywordInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace'); // Clear it
    await page.type(
      "input.suggestor-input[placeholder='Enter keyword / designation / companies']",
      keyword,
      { delay: 100 }
    );
    console.log('✅ Entered Job Title:', keyword);
  } else {
    console.log('❌ Job title input not found!');
  }

  // **Click and select experience**
  const experienceInput = await page.$('input#experienceDD');
  if (experienceInput) {
    await experienceInput.click();
    console.log('✅ Opened Experience Dropdown');

    // Wait for dropdown options to appear
    await page.waitForSelector('.dropdownContainer .dropdownPrimary', { visible: true });

    // Select the experience value dynamically
    const experienceOptions = await page.$$('.dropdownPrimary li'); // Get all experience options
    if (experienceOptions.length > 0) {
      for (const option of experienceOptions) {
        const text = await page.evaluate((el) => el.innerText.trim(), option);
        if (text === `${experience} years`) {
          await option.click();
          console.log(`✅ Selected Experience: ${experience} Years`);
          break;
        }
      }
    } else {
      console.log('❌ Experience option not found!');
    }
  } else {
    console.log('❌ Experience input not found!');
  }

  // **Click and enter location**
  const locationInput = await page.$("input.suggestor-input[placeholder='Enter location']");
  if (locationInput) {
    await locationInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace'); // Clear it
    await page.type("input.suggestor-input[placeholder='Enter location']", location, {
      delay: Math.random() * 200 + 100,
    });
    console.log('✅ Entered Location:', location);
  } else {
    console.log('❌ Location input not found!');
  }

  // **Click the search button**
  const searchButton = await page.$('button.nI-gNb-sb__icon-wrapper');
  if (searchButton) {
    await searchButton.click();
    console.log('🚀 Clicked Search Button');
  } else {
    console.log('❌ Search button not found!');
  }

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay to prevent issues
  // **Step: Click "Sort By" Dropdown**
  const sortByButton = await page.$('button#filter-sort');
  if (sortByButton) {
    await sortByButton.click();
    console.log('📌 Opened Sort By Dropdown');

    // **Wait for the dropdown to appear**
    await page.waitForSelector("ul[data-filter-id='sort']", { visible: true });

    // **Select "Date" Option**
    const dateOption = await page.$("li[title='Date'] a[data-id='filter-sort-f']");
    if (dateOption) {
      await dateOption.click();
      console.log('✅ Sorted jobs by Date');
    } else {
      console.log("❌ 'Date' sort option not found!");
    }
  } else {
    console.log('❌ Sort By dropdown not found!');
  }
}

export async function applyForJobs(page) {
  // Wait for job listings to load
  await page.waitForSelector('.srp-jobtuple-wrapper');

  // Extract job titles and links
  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.srp-jobtuple-wrapper'))
      .map((job) => {
        const titleElement = job.querySelector('h2 a');
        const applyLink = titleElement ? titleElement.href : null;
        return { title: titleElement?.innerText, applyLink };
      })
      .filter((job) => job.applyLink); // Filter out null values
  });

  console.log(`Found ${jobs.length} jobs`);

  // Loop through jobs and apply
  for (let job of jobs) {
    console.log(`Applying to: ${job.title}`);
    const jobPage = await browser.newPage();
    await jobPage.goto(job.applyLink, { waitUntil: 'networkidle2' });

    // Click Apply button
    try {
      await jobPage.waitForSelector('.apply-button', { timeout: 5000 });
      await jobPage.click('.apply-button');
      console.log(`Applied successfully to: ${job.title}`);
    } catch (error) {
      console.log(`Apply button not found for: ${job.title}`);
    }

    await jobPage.close();
  }
}
