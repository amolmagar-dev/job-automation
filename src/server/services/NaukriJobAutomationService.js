import dotenv from 'dotenv';
import { GeminiBot } from '../../ai/GeminiBot.js';
import { notifyAll } from '../../../notifier/index.js';


dotenv.config();

export class NaukriJobAutomation {
    constructor(browser, jobConfig) {
        this.browser = browser;
        this.jobConfig = jobConfig;
        this.bot = null;
        this.credentials = {
            email: process.env.NAUKRI_EMAIL,
            password: process.env.NAUKRI_PASSWORD
        };
        this.maxPagesToScrape = parseInt(process.env.SCRAPE_PAGES || "5");
        this.sortBy = process.env.JOB_SHORT_BY || "Date";
    }

    async trainBot() {
        this.bot = await GeminiBot.getInstance();
        GeminiBot.trainBotOnSelfDescription(this.jobConfig.aiTraining.selfDescription);
    }

    async loginToNaukri(page) {
        await page.goto('https://www.naukri.com/', { waitUntil: 'networkidle2' });
        await page.click("a[title='Jobseeker Login']");
        await page.waitForSelector("input[type='text']");

        await page.type("input[type='text']", this.credentials.email, { delay: 150 });
        await page.type("input[type='password']", this.credentials.password, { delay: 150 });
        await page.click("button[type='submit']");
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    async searchJobs(page, keyword, experience, location) {
        await page.waitForSelector('.nI-gNb-sb__main', { visible: true });

        const keywordInput = await page.$("input.suggestor-input[placeholder='Enter keyword / designation / companies']");
        if (keywordInput) {
            await keywordInput.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.type("input.suggestor-input[placeholder='Enter keyword / designation / companies']", keyword, { delay: 100 });
        }

        const experienceInput = await page.$('input#experienceDD');
        if (experienceInput) {
            await experienceInput.click();
            await page.waitForSelector('.dropdownContainer .dropdownPrimary', { visible: true });
            const experienceOptions = await page.$$('.dropdownPrimary li');
            for (const option of experienceOptions) {
                const text = await page.evaluate(el => el.innerText.trim(), option);
                if (text === `${experience} years`) {
                    await option.click();
                    break;
                }
            }
        }

        const locationInput = await page.$("input.suggestor-input[placeholder='Enter location']");
        if (locationInput) {
            await locationInput.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.type("input.suggestor-input[placeholder='Enter location']", location, { delay: 100 });
        }

        const searchButton = await page.$('button.nI-gNb-sb__icon-wrapper');
        if (searchButton) {
            await searchButton.click();
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        const sortByButton = await page.$('button#filter-sort');
        if (sortByButton) {
            await sortByButton.click();
            await page.waitForSelector("ul[data-filter-id='sort']", { visible: true });
            console.log(`🔄 Sorting jobs by ${process.env.JOB_SHORT_BY}`);
            await new Promise(resolve => setTimeout(resolve, 3000)); const dateOption = await page.$(`li[title=${process.env.JOB_SHORT_BY}] a[data-id='filter-sort-f']`);
            if (dateOption) {
                await dateOption.click();
            }
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    filterJobs(jobs, prefs) {
        return jobs.filter(job => {
            // Location match
            const locationMatch = job.location.toLowerCase().includes(prefs.location.toLowerCase());

            // Experience match
            const expMatch = (() => {
                const match = job.experience.match(/(\d+)-?(\d+)?/);
                if (!match) return false;
                const min = parseInt(match[1], 10);
                const max = match[2] ? parseInt(match[2], 10) : min;
                return prefs.minExp >= min && prefs.maxExp <= max;
            })();

            // Skills match
            const skills = job.skills.map(s => s.toLowerCase());
            const skillMatch = prefs.requiredSkills.every(skill =>
                skills.some(s => s.includes(skill.toLowerCase()))
            );

            // Rating match
            const ratingMatch = (() => {
                const rating = parseFloat(job.rating);
                return !isNaN(rating) && rating >= prefs.minRating;
            })();

            // Company exclusion
            const companyExcluded = prefs.excludeCompanies && prefs.excludeCompanies.length > 0
                ? prefs.excludeCompanies.some(company =>
                    job.company.toLowerCase().includes(company.toLowerCase())
                )
                : false;

            // return locationMatch && skillMatch && ratingMatch && !companyExcluded;
            return true
        });
    }

    async scrapePaginatedJobs(page, baseUrl, preferences) {
        let allJobs = [];
        let pageNum = 1;

        while (true) {
            console.log(`📄 Scraping Page ${pageNum}`);
            await page.waitForSelector('.cust-job-tuple', { timeout: 5000 });

            const jobs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.cust-job-tuple')).map(job => {
                    const titleEl = job.querySelector('h2 > a.title');
                    const companyEl = job.querySelector('a.comp-name');
                    const ratingEl = job.querySelector('a.rating .main-2');
                    const reviewsEl = job.querySelector('a.review');
                    const expEl = job.querySelector('.exp span[title]');
                    const salEl = job.querySelector('.sal span[title]');
                    const locEl = job.querySelector('.loc span[title]');
                    const descEl = job.querySelector('.job-desc');
                    const skillEls = job.querySelectorAll('ul.tags-gt li');
                    const postedOnEl = job.querySelector('.job-post-day');

                    return {
                        title: titleEl?.innerText.trim() || "",
                        applyLink: titleEl?.href || "",
                        company: companyEl?.innerText.trim() || "",
                        rating: ratingEl?.innerText.trim() || "",
                        reviews: reviewsEl?.innerText.trim() || "",
                        experience: expEl?.title?.trim() || "",
                        salary: salEl?.title?.trim() || "",
                        location: locEl?.title?.trim() || "",
                        description: descEl?.innerText.trim() || "",
                        skills: Array.from(skillEls).map(li => li.innerText.trim()),
                        postedOn: postedOnEl?.innerText.trim() || ""
                    };
                });
            });

            allJobs.push(...jobs);

            const hasNext = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a.styles_btn-secondary__2AsIP'));
                const next = anchors.find(a => a.innerText.trim() === 'Next' && !a.hasAttribute('disabled'));
                if (next) {
                    next.click();
                    return true;
                }
                return false;
            });

            if (!hasNext || pageNum >= this.maxPagesToScrape) {
                console.log('✅ All pages scraped or limit reached.');
                console.log('🚫 No more pages.');
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 3000)); // allow DOM to update
            pageNum++;
        }

        console.log(`✅ Scraped total ${allJobs.length} jobs`);
        console.log(`🔍 Filtering jobs based on preferences... with skills: ${preferences.requiredSkills}`);
        return this.filterJobs(allJobs, preferences);
    }

    async applyForJobs(jobs) {
        for (const job of jobs) {
            console.log(`\n💼 Applying to: ${job.title} | ${job.company} Skills: ${job?.skills}`);
            const jobPage = await this.browser.newPage();
            await jobPage.goto(job.applyLink, { waitUntil: 'networkidle2' });

            try {
                await jobPage.waitForSelector('.apply-button', { timeout: 5000 });
                await jobPage.click('.apply-button');
                await new Promise(resolve => setTimeout(resolve, 3000));

                const chatDrawer = await jobPage.$('.chatbot_DrawerContentWrapper');
                if (chatDrawer) {
                    console.log("💬 Chatbot detected");
                    let appliedJobPage = await this.handleChatForm(jobPage);
                    const success = await appliedJobPage.evaluate(() => {
                        const msg = Array.from(document.querySelectorAll('body *')).find(el =>
                            el.innerText?.includes('You have successfully applied to')
                        );
                        return msg?.innerText;
                    });
                    if (success) {
                        notifyAll(this.createNotification(job));
                        console.log(`✅ ${success}`);
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    const success = await jobPage.evaluate(() => {
                        const msg = Array.from(document.querySelectorAll('body *')).find(el =>
                            el.innerText?.includes('You have successfully applied to')
                        );
                        return msg?.innerText;
                    });
                    if (success) {
                        notifyAll(this.createNotification(job));
                        console.log(`✅ ${success}`);
                    }
                    else console.log("🤷 Unknown apply result");
                }

            } catch (err) {
                console.log(`❌ Couldn't apply: ${err.message}`);
            }

            await jobPage.close();
        }
    }

async handleChatForm(page) {
    try {
        await page.waitForSelector('.chatbot_DrawerContentWrapper', { timeout: 3000 });

        let attempt = 0;
        const max = 10;

        while (await page.$('.chatbot_DrawerContentWrapper') !== null && attempt < max) {
            const question = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('.chatbot_ListItem'));
                const last = items[items.length - 1];
                const span = last?.querySelector('.botMsg span');
                return span?.innerText.trim();
            });

            if (!question) break;
            console.log(`🤖 Bot asks: ${question}`);

            const radioBtns = await page.$$('.ssrc__radio-btn-container');
            if (radioBtns.length > 0) {
                const optionLabels = [];

                for (const btn of radioBtns) {
                    const label = await btn.$('label');
                    const labelText = await page.evaluate(el => el.innerText.trim(), label);
                    optionLabels.push(labelText);
                }

                const answer = await this.bot.askOneLine(question, optionLabels);
                console.log(`🎯 Bot chose: ${answer}`);

                let clicked = false;
                for (let i = 0; i < optionLabels.length; i++) {
                    if (optionLabels[i].toLowerCase() === answer.toLowerCase()) {
                        const label = await radioBtns[i].$('label');
                        if (label) {
                            await label.click();
                            clicked = true;
                            console.log(`✅ Clicked radio: ${optionLabels[i]}`);
                            break;
                        }
                    }
                }

                if (!clicked) {
                    console.log(`❌ No match found. Selecting first option.`);
                    const firstLabel = await radioBtns[0].$('label');
                    if (firstLabel) await firstLabel.click();
                }

                // ✅ Save after selection (if button exists)
                const saveBtn = await page.$('.sendMsg');
                if (saveBtn) {
                    await saveBtn.click();
                    console.log('📩 Clicked Save after selecting radio');
                }
            } else if (await page.$('input[type="checkbox"]')) {
                const checkbox = await page.$('input[type="checkbox"]');
                if (checkbox) {
                    await checkbox.click();
                    console.log('✅ Checkbox selected');
                }
            } else {
                const answer = await this.bot.ask(question);
                console.log(`💬 Bot (text): ${answer}`);

                await page.evaluate((val) => {
                    const input = document.querySelector('div[contenteditable="true"]');
                    if (input) {
                        input.innerText = val;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, answer);
                await page.keyboard.press('Enter');
            }

            attempt++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        console.log("✅ Chatbot finished");
        await new Promise(resolve => setTimeout(resolve, 5000));
        return page
    } catch (e) {
        console.log("⚠️ Chatbot handling failed:", e.message);
    }
}

    createNotification(job) {
        return `📢 *Job Applied Successfully!*

🔹 *Position:* ${job.title}
🏢 *Company:* ${job.company}
📍 *Location:* ${job.location || 'N/A'}
🧠 *Experience:* ${job.experience || 'N/A'}
💰 *Salary:* ${job.salary || 'N/A'}
⭐ *Rating:* ${job.rating || 'N/A'} (${job.reviews || 'No'} reviews)
📅 *Posted On:* ${job.postedOn || 'N/A'}

📝 *Description:* ${job.description || 'No description available'}

🛠️ *Skills:* ${job.skills && job.skills.length ? job.skills.join(', ') : 'N/A'}

🔗 *Apply Link:* ${job.applyLink || 'N/A'}

🟢 Please wait while we track the application status.`;
    }

    async start() {
        try {
            this.trainBot();
            const page = await this.browser.newPage();

            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );

            console.log(`🔑 Logging in to Naukri.com with account: ${this.credentials.email}`);
            await this.loginToNaukri(page);
            console.log(`🔑 Logged in successfully`);
            // Extract search parameters from job config
            const { keywords, experience, location } = this.jobConfig.searchConfig;
            console.log(`🔍 Searching for: ${keywords} in ${location} (Exp: ${experience} yrs)`);

            await this.searchJobs(page, keywords, experience, location);

            const currentUrl = page.url();

            // Create user preferences from job config
            const userPrefs = {
                location,
                minExp: Number(experience),
                maxExp: Number(experience) + 2,
                requiredSkills: Array.isArray(this.jobConfig.filterConfig.requiredSkills)
                    ? this.jobConfig.filterConfig.requiredSkills
                    : keywords.split(',').map(skill => skill.trim()),
                excludeCompanies: this.jobConfig.filterConfig.excludeCompanies || [],
                minRating: this.jobConfig.filterConfig.minRating || 3.5
            };

            const jobs = await this.scrapePaginatedJobs(page, currentUrl, userPrefs);

            if (jobs.length === 0) {
                console.log('No jobs found for the given criteria');
            } else {
                console.log(`Found ${jobs.length} jobs matching criteria`);
                console.log('Applying for jobs...');
                await this.applyForJobs(jobs);
            }

            // Update job config with last run details
            if (this.jobConfig.schedule) {
                this.jobConfig.schedule.lastRun = new Date();

                // Calculate next run based on frequency
                if (this.jobConfig.schedule.frequency === 'daily') {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    this.jobConfig.schedule.nextRun = tomorrow;
                } else if (this.jobConfig.schedule.frequency === 'weekly') {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    this.jobConfig.schedule.nextRun = nextWeek;
                }

                console.log(`✅ Job automation completed. Next run scheduled for: ${this.jobConfig.schedule.nextRun}`);
            }

            await page.close();
            await this.browser.closeBrowser()
            return {
                success: true,
                message: `Job search completed. Found ${jobs.length} matching jobs.`,
                jobsApplied: jobs.length
            };
        } catch (err) {
            console.error('Error during automation:', err);
            return {
                success: false,
                message: `Error during automation: ${err.message}`,
                error: err
            };
        }
    }
}