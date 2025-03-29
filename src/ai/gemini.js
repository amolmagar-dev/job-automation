import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { initWhatsAppClient } from '../../notify/whatsapp/whatsappAdapter.js';

console.log('🚀 Initializing Job Assistant Bot Setup...');

const genAI = new GoogleGenerativeAI('AIzaSyBXdbQx6Oobr4UMvy1YALkkdGS1uGTm9fs');

// 🔍 Step 1: Locate resume PDF in user-data folder
const userDataDir = path.resolve('user-data');
const pdfFiles = fs.readdirSync(userDataDir).filter((file) => file.toLowerCase().endsWith('.pdf'));

if (pdfFiles.length === 0) {
  console.error('❌ No PDF resume found in user-data folder.');
  process.exit(1);
}
await initWhatsAppClient()

const resumePath = path.join(userDataDir, pdfFiles[0]);
console.log(`📄 Found resume: ${resumePath}`);

// 🧠 Step 2: Load model for analyzing resume
const modelForInstruction = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

console.log('🤖 Bot is reading your resume and generating context...');
const instructionResult = await modelForInstruction.generateContent([
  {
    inlineData: {
      data: Buffer.from(fs.readFileSync(resumePath)).toString('base64'),
      mimeType: 'application/pdf',
    },
  },
  `
  Based on this resume, generate a systemInstruction string for a job assistant bot.
  Include name, role, experience, skills, education, companies, projects, location preference, and salary expectation.
  be always positive and professional.
  End with: "Always answer in short, crisp, one-line responses like a real applicant."
  Output only the instruction text.
  `,
]);

const systemInstruction = instructionResult.response.text().trim();

if (!systemInstruction) {
  console.error('❌ Failed to extract system instruction from resume.');
  process.exit(1);
}

console.log('✅ Bot training completed from:', path.basename(resumePath));
console.log('🧾 ---------- System Instruction for Bot ----------\n');
console.log(systemInstruction);
console.log('\n🧾 -----------------------------------------------\n');

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction,
});

export async function getGeminiResponse(question) {
  try {
    const result = await model.generateContent(question);
    return result.response.text().trim();
  } catch (error) {
    console.log('Bot error:', error.message);
    return 'Skip';
  }
}

export async function getShortGeminiResponse(question, options = []) {
  const prompt = options.length
    ? `Choose only one from the following options:\nOptions: ${options.join(', ')}\nQuestion: ${question}`
    : question;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const answer = raw.split(/[.,\n]/)[0].trim();
    return answer;
  } catch (error) {
    console.log('Bot (short answer) error:', error.message);
    return 'Skip';
  }
}

// Dynamic keyword list from gemeni
