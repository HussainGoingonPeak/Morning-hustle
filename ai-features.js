// ai-features.js

// --- IMPORTANT SECURITY NOTICE ---
// The API key below is a placeholder. You MUST replace it with your actual Google AI API key.
// It is a major security risk to expose your secret keys in a public code repository.
// In a real application, this should be managed on a backend server to keep it secure.
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

/**
 * Generates content using the Gemini 1.5 Flash model.
 * @param {string} inputText The text prompt to send to the model.
 * @returns {Promise<string>} The generated text content.
 */
async function generateGeminiContent(inputText) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    return "The Gemini API key has not been configured. Please add it to ai-features.js.";
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: inputText }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Assuming the response structure contains the content in the first candidate
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating Gemini content:', error);
    return `Error: ${error.message}`;
  }
}

/**
 * Generates an image URL from a prompt using the Pollinations AI API.
 * @param {string} prompt The text prompt for the image.
 * @returns {string} The URL of the generated image.
 */
function generateImage(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}`;
}
