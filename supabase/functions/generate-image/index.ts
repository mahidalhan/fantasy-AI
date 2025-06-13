import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  prompt: string;
  aspectRatio?: string;
}

interface GeminiImageResponse {
  imageUrl?: string;
  imageData?: string;
  mimeType?: string;
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. PARSE AND VALIDATE INPUT
    const { prompt, aspectRatio = '1:1' } = await req.json() as RequestBody

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Image generation prompt is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (prompt.length > 1000) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Prompt must be 1000 characters or less' 
        }),
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

    const geminiPayload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        responseMimeType: 'text/plain'
      }
    }

    console.log('Calling Gemini Image Generation API with prompt:', prompt.substring(0, 100) + '...')

    // 3. CALL THE GEMINI IMAGE GENERATION API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
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
      console.error('Gemini Image API Error:', errorBody)
      throw new Error(`Gemini Image API request failed with status: ${geminiResponse.status}`)
    }

    const responseData = await geminiResponse.json()
    console.log('Gemini Image API Response received')

    // 4. EXTRACT IMAGE DATA FROM RESPONSE
    const candidate = responseData.candidates?.[0]
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('No image data received from Gemini API')
    }

    let imageData = null
    let textResponse = null

    // Process response parts to extract image and text
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        imageData = {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png'
        }
      } else if (part.text) {
        textResponse = part.text
      }
    }

    if (!imageData) {
      throw new Error('No image data found in API response')
    }

    console.log('Image data extracted successfully')

    // 5. RETURN SUCCESS RESPONSE
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imageData: imageData.data,
          mimeType: imageData.mimeType,
          textResponse: textResponse,
          prompt: prompt
        }
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
    console.error('Error in generate-image function:', errorMessage)
    
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