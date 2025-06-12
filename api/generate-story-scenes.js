/**
 * Serverless function to generate story and scenes using Gemini API
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, maxLength = 500, sceneCount = 4 } = req.body;

    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Story prompt must be at least 10 characters long' 
      });
    }

    // TODO: Implement Gemini API integration
    // This is a placeholder response
    const mockResponse = {
      story: `Based on your prompt: "${prompt.substring(0, 50)}..." - A captivating story unfolds...`,
      scenes: [
        'Scene 1: The adventure begins in a mysterious forest...',
        'Scene 2: Our hero encounters a magical creature...',
        'Scene 3: A challenge must be overcome...',
        'Scene 4: The triumphant conclusion...'
      ]
    };

    return res.status(200).json(mockResponse);

  } catch (error) {
    console.error('Story generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate story and scenes' 
    });
  }
} 