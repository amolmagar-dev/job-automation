import fs from 'fs';
import os from 'os';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export async function downloadAndSendResumeToGemini(page, credentials) {
    await page.goto('https://www.naukri.com/', { waitUntil: 'networkidle2' });
    await page.click("a[title='Jobseeker Login']");
    await page.waitForSelector("input[type='text']");

    await page.type("input[type='text']", credentials.username, { delay: 150 });
    await page.type("input[type='password']", credentials.password, { delay: 150 });
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.nI-gNb-sb__main', { visible: true });

    await page.evaluate(() => window.scrollTo(0, 10));

    const tempPdfPath = path.join(os.tmpdir(), `resume_${Date.now()}.pdf`);
    await page.pdf({
        path: tempPdfPath,
        format: 'A4',
        printBackground: true,
    });

    const pdfBuffer = fs.readFileSync(tempPdfPath);
    fs.unlinkSync(tempPdfPath); // Delete temp file after reading

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

    const result = await model.generateContent([
        {
            inlineData: {
                data: pdfBuffer.toString('base64'),
                mimeType: 'application/pdf',
            },
        },
        `
      Based on this resume, generate a comprehensive and detailed systemInstruction string for a job assistant bot.
      
      Extract and include ALL of the following specific details from the resume:
      - Full legal name (exactly as written)
      - Current professional role and title 
      - Total years of experience (be precise)
      - Complete list of technical skills, programming languages, frameworks, tools and platforms
      - Soft skills and work style traits
      - All educational qualifications with degree names, institutions, and graduation years
      - All companies worked for with exact employment durations (years/months) and job titles
      - 3-5 most significant projects with quantifiable achievements and metrics
      - Specific location preferences if mentioned (remote/hybrid/on-site)
      - Salary expectations or current compensation if listed
      - Industry specializations and domain expertise
      - Certifications with dates and issuing organizations
      - Languages spoken and proficiency levels
      
      Format the instruction as a first-person script that the assistant will use to respond as if it were the applicant.
      
      Be always positive, professional, and confident but not arrogant. The tone should reflect a motivated, capable professional.
      
      End with exactly this line: "Always answer in short, crisp, one-line responses like a real applicant."
      
      Output only the instruction text without any additional commentary.
      `
    ]);

    const instruction = result.response.text().trim();
    console.log('🧠 Gemini Instruction:', instruction);
    return instruction;
}