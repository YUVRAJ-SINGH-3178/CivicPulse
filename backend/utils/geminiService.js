const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes a civic issue using Gemini AI to automatically categorize and extract metadata.
 * @param {string} title - The title of the reported issue.
 * @param {string} description - The detailed description of the issue.
 * @returns {Promise<Object>} JSON object containing category, severity, department, summary, and confidence.
 */
async function analyzeIssueWithAI(title, description) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found, skipping AI categorization.");
      return null;
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
You are an AI assistant for a civic issue reporting platform. 
Analyze the following civic issue report and provide a structured JSON response.

Title: "${title}"
Description: "${description}"

Determine the following fields:
1. "category": A broad category (e.g., "Roads", "Water", "Electricity", "Sanitation", "Public Infrastructure", "Other").
2. "severity": The severity level ("Low", "Medium", "High", "Critical").
3. "department": The most appropriate municipal department to handle this (e.g., "Public Works", "Water Supply", "Electrical Department", "Waste Management").
4. "summary": A concise, 1-sentence summary of the issue.
5. "confidence": A float between 0.0 and 1.0 indicating your confidence in this categorization.

Output ONLY valid JSON without any markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Strip markdown formatting if the model still includes it
    if (text.startsWith('```json')) {
      text = text.substring(7);
    }
    if (text.startsWith('```')) {
        text = text.substring(3);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return null;
  }
}

module.exports = {
  analyzeIssueWithAI,
};
