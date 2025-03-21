import fs from 'fs'; // File system to store cookies
import dotenv from 'dotenv';
import browserInstance from '../../browser/browser.js';
import { getGeminiResponse } from '../../ai/gemini.js';
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

    // if you see this url https://www.naukri.com/mnjuser/homepage that means you are logged in
    const loggedIn = page.url().includes('mnjuser/homepage');

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
  keyword = 'node js',
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
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay to prevent issues

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
      console.log(`Clicked apply button for: ${job.title}`);

      // Wait to see what shows up
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay to prevent issues

      // 1. Handle Chat Drawer if present
      const chatDrawerExists = await jobPage.$('.chatbot_DrawerContentWrapper');
      if (chatDrawerExists) {
        console.log('Chatbot drawer detected');
        await handleChatForm(jobPage);
      } else {
        // 2. Check for Success Message
        const successMessage = await jobPage.evaluate(() => {
          const el = Array.from(document.querySelectorAll('body *')).find((e) =>
            e.innerText?.includes('You have successfully applied to')
          );
          return el ? el.innerText : null;
        });

        if (successMessage) {
          console.log(`✅ ${successMessage}`);
        } else {
          console.log('❓ No chatbot and no success message — something unusual');
        }
      }

      console.log(`Applied successfully to: ${job.title}`);
    } catch (error) {
      console.log(`Apply button not found for: ${job.title}`);
    }

    await jobPage.close();
  }
}

async function handleChatForm(jobPage) {
  try {
    await jobPage.waitForSelector('.chatbot_DrawerContentWrapper', { timeout: 3000 });
    console.log("Chatbot drawer detected");

    let attempt = 0;
    const maxAttempts = 10;

    while (await jobPage.$('.chatbot_DrawerContentWrapper') !== null && attempt < maxAttempts) {
      const question = await jobPage.evaluate(() => {
        const allItems = Array.from(document.querySelectorAll('.chatbot_MessageContainer .chatbot_ListItem'));
        const last = allItems[allItems.length - 1];
        const span = last?.querySelector('.botMsg span');
        return span?.innerText.trim();
      });

      if (!question) {
        console.log("No question detected. Ending chat handler.");
        break;
      }

      console.log(`Bot asks: ${question}`);
      const answer = await getGeminiResponse(question);

      if (answer === "Skip") {
        const skipChip = await jobPage.$('.chatbot_Chip span');
        if (skipChip) {
          await skipChip.click();
          console.log("Clicked Skip");
        } else {
          console.log("Skip button not found");
        }
      } else {
        // Check for radio buttons
        const radioButtons = await jobPage.$$('.ssrc__radio-btn-container');
        if (radioButtons.length > 0) {
          console.log("Detected radio button input");

          // Find the correct answer in the labels
          const optionSelector = `//label[contains(text(), '${answer}')]`;
          const option = await jobPage.$x(optionSelector);
          
          if (option.length > 0) {
              await option[0].click();
              console.log(`Selected: ${answer}`);
          } else {
              console.log(`Option '${answer}' not found, choosing default first option.`);
              await radioButtons[0].click();
          }
        } 
        // Check for checkboxes
        else if (await jobPage.$('input[type="checkbox"]')) {
          console.log("Detected checkbox input");

          const checkbox = await jobPage.$('input[type="checkbox"]');
          if (checkbox) {
            await checkbox.click();
            console.log("Checkbox ticked");
          }
        } 
        // Normal text input
        else {
          await jobPage.evaluate((answerText) => {
            const inputDiv = document.querySelector('div[contenteditable="true"]');
            if (inputDiv) {
              inputDiv.innerText = answerText;
              const event = new Event('input', { bubbles: true });
              inputDiv.dispatchEvent(event);
            }
          }, answer);

          await jobPage.keyboard.press('Enter');
          console.log(`Answered: ${answer}`);
        }
      }

      // Click "Save" if visible
      const saveButton = await jobPage.$('.sendMsgbtn_container .sendMsg');
      if (saveButton) {
        await saveButton.click();
        console.log("Clicked Save button");
      }

      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay to prevent issues
    }

    console.log("Finished chatbot interaction or drawer closed");
  } catch (err) {
    console.log("No chatbot form or failed to handle it:", err.message);
  }
}




