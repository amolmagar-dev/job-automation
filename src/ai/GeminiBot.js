import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadSystemInstruction } from './SystemInstructionLoader.js';
import dotenv from 'dotenv';
dotenv.config();

let instance = null;

export class GeminiBot {
  constructor(systemInstruction) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
    });
  }

  static async getInstance() {
    if (!instance) {
      const systemInstruction = await loadSystemInstruction();
      instance = new GeminiBot(systemInstruction);
    }
    return instance;
  }

  static async refreshInstruction() {
    const newInstruction = await regenerateSystemInstruction(); // Force re-read from resume
    instance = new GeminiBot(newInstruction); // Replace instance
    console.log('🔁 System instruction updated and bot instance refreshed');
  }

  async ask(question) {
    try {
      const result = await this.model.generateContent(question);
      return result.response.text().trim();
    } catch (error) {
      console.error('[GeminiBot.ask] Error:', error.message);
      return 'Skip';
    }
  }

  async askOneLine(question, options = []) {
    const prompt = options.length
      ? `Choose only one from the following options:\nOptions: ${options.join(', ')}\nQuestion: ${question}`
      : question;

    try {
      const result = await this.model.generateContent(prompt);
      const raw = result.response.text().trim();
      return raw.split(/[.,\n]/)[0].trim();
    } catch (error) {
      console.error('[GeminiBot.askOneLine] Error:', error.message);
      return 'Skip';
    }
  }
}
