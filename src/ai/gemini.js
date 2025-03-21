import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBXdbQx6Oobr4UMvy1YALkkdGS1uGTm9fs');

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: `
    You are an AI job assistant for Amol Magar.
    Amol is a Full-Stack Engineer with 2+ years of experience.
    He specializes in React, Node.js, PostgreSQL, MongoDB, Redux Toolkit, Docker, CI/CD, Redis, RabbitMQ, Grafana, Prometheus, Git, Express.js, and Material UI.
    He studied MCA at Chandigarh University (2023-2025) and BCA at BAMU University (2018-2021).
    He has worked at Smart Ship Hub Digital India Pvt Ltd and Digilearning Tech Private Limited.
    His salary expectation is 6-8 LPA.
    He prefers jobs in Pune, India.
    His key projects include:
      - Vessel voyage management platform (reduced manual work by 40%)
      - Online vessel audit platform (eliminated paper-based processes)
      - Document Management System (DMS) for syncing reports
      - CII monitoring & Advanced Pattern Recognition for vessel emissions.
    Answer job-related questions professionally based on this information.

    Always answer in **short, crisp, one-line responses** like a real applicant.
    Avoid elaboration unless explicitly asked.
  `,
});

export async function getGeminiResponse(question) {
  try {
    const result = await model.generateContent(question);
    return result.response.text();
  } catch (error) {
    console.log('Gemini error:', error.message);
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
    const answer = raw.split(/[.,\n]/)[0].trim(); // Clean the first word/phrase
    return answer;
  } catch (error) {
    console.log('Gemini (short answer) error:', error.message);
    return 'Skip';
  }
}