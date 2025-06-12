import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }

    // Parse request body
    const { prompt } = await req.json()
    
    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate prompt length
    if (prompt.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Prompt must be 500 characters or less' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare the request payload for Gemini API
    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [{ text: "spiderman becomes venom" }]
        },
        {
          role: "model",
          parts: [{
            text: `\`\`\`json
{
  "story": "The bell tower groaned under the strain of the storm. Rain lashed against the stained-glass windows, each pane a fractured reflection of Peter Parker's inner turmoil. He clung to the gargoyle, the cold stone a stark contrast to the burning fever in his veins. He'd ripped the alien symbiote from his body, disgusted by its possessiveness, its hunger. But the city needed Spider-Man. He needed Spider-Man. \\n\\nHe glanced down. New York was a blurred tapestry of lights, sirens wailing in the distance – a symphony of chaos he was sworn to protect. But he felt…weak. Vulnerable. A shard of glass sliced his palm. The crimson droplet smeared on the gargoyle's face, mirroring his own anguish. A familiar tendril snaked out from the shadows, black and slick as oil. The symbiote. It pulsed, a silent promise of power whispered on the wind.\\n\\n\\"Leave me alone!\\" Peter gasped, pulling away. But the symbiote was relentless. It flowed upwards, a living darkness reaching for him, its surface shimmering with iridescent colours under the flickering lightning. It brushed against his skin, and a jolt of raw energy coursed through him. He felt stronger, faster, the exhaustion melting away. But there was something else, a dark thrill, a hunger he hadn't known he possessed.\\n\\nThe symbiote enveloped his hand, crawling up his arm. He tried to fight it, to tear it away, but it was too late. The darkness consumed him, tendrils wrapping around his torso, his legs, his head. He screamed, a sound swallowed by the storm, a plea lost in the thunder's roar. His familiar red and blue suit dissolved, replaced by the sleek, black alien armor. White spider-like veins pulsed across his chest, culminating in a grotesque, grinning maw. \\n\\nHe leaped from the bell tower, landing with a bone-jarring thud on the rain-slicked street. He felt…good. Powerful. The city's chaos no longer seemed like a burden, but an invitation. He grinned, a wide, predatory smile that wasn't his own. \\"We are Venom,\\" he whispered, his voice a guttural growl, a twisted symphony of two minds merging into one. The symbiote surged, urging him forward, its desires now his own. A bank robbery was in progress three blocks away. He could hear the muffled screams, the desperate pleas. A thrill, a dark exhilaration, surged through him. He launched himself into the night, a black silhouette against the stormy sky, the city his hunting ground.\\n\\nThe gargoyle, now stained with rain and a lingering smear of black, stood silent witness to the birth of a monster. The storm raged on, mirroring the darkness that had consumed Spider-Man, a darkness that promised to change the city forever.",
  "scenes": [
    {
      "rank": 5,
      "scene_description": "Peter, mid-transformation on the bell tower, is screaming as the symbiote consumes him. His classic suit is being replaced with the black venom suit.",
      "image_gen_prompt": "Peter Parker, mid-transformation into Venom, screaming in agony, black symbiote tendrils engulfing his body, ripping apart the classic red and blue Spider-Man suit, atop a gothic bell tower, stormy night, lightning flashing, dramatic lighting, close-up on Peter's face, highly detailed, professional illustration, masterpiece."
    },
    {
      "rank": 4,
      "scene_description": "Venom stands on a rain-slicked street, with a menacing grin, the city lights reflected in his eyes.",
      "image_gen_prompt": "Venom standing on a rain-slicked street, menacing grin revealing sharp teeth, city lights reflecting in his wide, white eyes, black symbiote suit with white spider-like veins, dark alleyway, wet asphalt, neon signs, low angle shot, dramatic lighting, film noir style, highly detailed, professional, masterpiece."
    },
    {
      "rank": 3,
      "scene_description": "Peter, exhausted and injured, clings to a stone gargoyle on the bell tower before the symbiote arrives.",
      "image_gen_prompt": "Exhausted and injured Peter Parker clings to a cold, stone gargoyle on a gothic bell tower, rain lashing down, stained-glass windows behind him, bleeding hand, desperate expression, dark and stormy night, flickering lightning, cinematic lighting, medium shot, highly detailed, professional illustration, masterpiece."
    },
    {
      "rank": 2,
      "scene_description": "The symbiote, a black tendril, reaching towards Peter on the bell tower.",
      "image_gen_prompt": "A single, black, oily tendril of the symbiote reaching towards Peter Parker on a gothic bell tower, rain falling, stained glass window in the background, dark and ominous atmosphere, glowing iridescent colors on the symbiote's surface, soft lighting, macro lens, highly detailed, professional rendering, masterpiece."
    },
    {
      "rank": 1,
      "scene_description": "Venom leaps across the city skyline during the storm, heading towards a bank robbery.",
      "image_gen_prompt": "Venom leaping across the New York City skyline during a raging storm, black silhouette against the stormy sky, white spider emblem glowing, rain and lightning, city lights blurred in the background, dynamic action pose, wide shot, cinematic composition, dark and gritty atmosphere, highly detailed, professional concept art, masterpiece."
    }
  ]
}
\`\`\``
          }]
        },
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "text/plain"
      },
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      }
    }

    // Make request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiPayload)
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      throw new Error(`Gemini API request failed: ${response.status}`)
    }

    const geminiResponse = await response.json()
    
    // Extract text from Gemini response
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!responseText) {
      throw new Error('No response text from Gemini API')
    }

    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                     responseText.match(/```\n([\s\S]*?)\n```/) ||
                     [null, responseText]
    
    const jsonString = jsonMatch[1] || responseText
    
    // Parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', responseText)
      throw new Error('Failed to parse response as JSON')
    }

    // Validate response structure
    if (!parsedResponse.story || !parsedResponse.scenes || !Array.isArray(parsedResponse.scenes)) {
      throw new Error('Invalid response structure from Gemini API')
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResponse
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-story function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 