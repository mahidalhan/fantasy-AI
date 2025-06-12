/**
 * Serverless function to generate image prompts using Gemini API
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
    const { story, scene, style } = req.body;

    // Input validation
    if (!story || !scene || !style) {
      return res.status(400).json({ 
        error: 'Story, scene, and style are required' 
      });
    }

    // TODO: Implement Gemini API integration
    // This is a placeholder response
    const mockPrompt = `${style} style artwork depicting: ${scene.substring(0, 100)}... 
    High quality, detailed, cinematic lighting, masterpiece`;

    return res.status(200).json({
      prompt: mockPrompt,
      metadata: {
        style: style,
        processedAt: Date.now()
      }
    });

  } catch (error) {
    console.error('Image prompt generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate image prompt' 
    });
  }
} 