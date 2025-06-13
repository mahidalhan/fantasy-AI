import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// This interface now matches the JSON structure requested from the Gemini API
interface GeminiStoryResponse {
  story: string;
  scenes: Array<{
    rank: number;
    scene_description: string;
    image_gen_prompt: string;
  }>;
}

interface RequestBody {
  prompt: string;
  style?: string;
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const SYSTEM_INSTRUCTION = `You are an expert creative writer and visual storytelling specialist. Your task is to transform user prompts into magnificent stories with visually compelling scenes optimized for AI image generation.

**CHAIN OF THOUGHT PROCESS:**

**STEP 1: STORY ANALYSIS & PLANNING**
First, analyze the user's story prompt: {{Story_prompt}}

Think through:
- What genre and tone does this suggest?
- What are the key characters, setting, and conflict?
- What visual elements would make this story compelling?
- How can I create vivid, cinematic moments?

**STEP 2: STORY CREATION**
Create a magnificent story following these requirements:
- Length: Exactly 450-500 words
- Structure: Clear beginning, rising action, climax, resolution
- Style: Rich, descriptive language with strong visual imagery
- Characters: Well-defined with clear motivations
- Setting: Vivid world-building that supports visual scenes
- Conflict: Engaging tension that creates dramatic moments
- Pacing: Build to climactic visual moments
- Voice: Engaging and immersive narrative style

Focus on creating scenes that would translate beautifully into visual art - moments with:
- Strong character emotions and expressions
- Dynamic action or dramatic tension
- Rich environmental details
- Compelling lighting or atmospheric effects
- Clear focal points for composition

**STEP 3: SCENE IDENTIFICATION**
From your completed story, identify exactly 5 scenes that would make the most compelling illustrations. Consider:
- Visual impact and drama
- Character expression opportunities
- Environmental storytelling potential
- Action or emotional intensity
- Compositional interest
- Artistic appeal across different styles

**STEP 4: SCENE RANKING**
Rank these 5 scenes from 1-5 where:
- Rank 5 = Most visually compelling and dramatic
- Rank 4 = Very strong visual appeal
- Rank 3 = Good visual elements
- Rank 2 = Moderate visual interest  
- Rank 1 = Least visually compelling (but still good)

**STEP 5: IMAGE PROMPT GENERATION**
For each scene, create an optimized image generation prompt using best practices:

**Image Prompt Formula:**
[CHARACTER DESCRIPTION] + [ACTION/POSE] + [EMOTION/EXPRESSION] + [SETTING/ENVIRONMENT] + [LIGHTING/ATMOSPHERE] + [COMPOSITION] + [ARTISTIC STYLE MODIFIERS] + [QUALITY ENHANCERS]

**Best Practices for Image Prompts:**
- Be specific about character appearance, clothing, and pose
- Include detailed environmental elements
- Specify lighting conditions (dramatic, soft, golden hour, etc.)
- Add composition elements (close-up, wide shot, low angle, etc.)
- Include atmospheric details (mist, particles, weather)
- Add artistic quality modifiers (highly detailed, professional, masterpiece)
- Keep prompts focused but comprehensive (50-80 words per prompt)

**OUTPUT FORMAT:**
Return your response as a JSON object with this exact structure:

{
  "story": "Your complete 450-500 word story here...",
  "scenes": [
    {
      "rank": 5,
      "scene_description": "Brief description of what happens in this scene from the story",
      "image_gen_prompt": "Detailed image generation prompt optimized for AI art creation"
    },
    {
      "rank": 4,
      "scene_description": "Brief description of what happens in this scene from the story", 
      "image_gen_prompt": "Detailed image generation prompt optimized for AI art creation"
    },
    {
      "rank": 3,
      "scene_description": "Brief description of what happens in this scene from the story",
      "image_gen_prompt": "Detailed image generation prompt optimized for AI art creation"
    },
    {
      "rank": 2,
      "scene_description": "Brief description of what happens in this scene from the story",
      "image_gen_prompt": "Detailed image generation prompt optimized for AI art creation"
    },
    {
      "rank": 1,
      "scene_description": "Brief description of what happens in this scene from the story",
      "image_gen_prompt": "Detailed image generation prompt optimized for AI art creation"
    }
  ]
}

**IMPORTANT GUIDELINES:**
- Ensure the story is exactly 450-500 words - count carefully
- Make each scene description 1-2 sentences referencing specific story moments
- Create image prompts that are 50-80 words each
- Focus on visual storytelling and dramatic moments
- Ensure scenes are diverse in composition and emotional tone
- Make image prompts specific enough to generate consistent, high-quality art
- Include artistic enhancement keywords in every image prompt
- Return ONLY the JSON object, no additional text

Now process this story prompt: {{Story_prompt}}`

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. PARSE AND VALIDATE INPUT
    const { prompt } = await req.json() as RequestBody

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (prompt.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Prompt must be 500 characters or less' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // 2. PREPARE THE API REQUEST
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.')
    }
    
    const finalSystemInstruction = SYSTEM_INSTRUCTION.replace(/{{Story_prompt}}/g, prompt)

    const geminiPayload = {
      contents: [{
        parts: [{ "text": finalSystemInstruction }]
      }],
      generationConfig: {
        "response_mime_type": "application/json",
      }
    }

    // 3. CALL THE GEMINI API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiPayload)
      }
    )

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text()
      console.error('Gemini API Error:', errorBody)
      throw new Error(`Gemini API request failed with status: ${geminiResponse.status}`)
    }

    const responseData = await geminiResponse.json()
    const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!responseText) {
      throw new Error('Received an empty response from Gemini API.')
    }

    // 4. PARSE AND RETURN THE FINAL JSON
    const parsedResponse: GeminiStoryResponse = JSON.parse(responseText)

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResponse,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Error in generate-story function:', errorMessage)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
}) 