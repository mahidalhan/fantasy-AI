import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const SUPABASE_URL = 'https://lkvyyfzytojjjaizvner.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrdnl5Znp5dG9qamphaXp2bmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mjc2NDksImV4cCI6MjA2NTMwMzY0OX0.oonH1WShleQS__cVLUijkjPDTjS4vwZsLRoysGy_GmA'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Generate story and scenes using Supabase Edge Function
 * @param {string} userPrompt - The user's story prompt
 * @returns {Promise<Object>} Response with success/error and data
 */
async function generateStoryAndScenes(userPrompt) {
    try {
        console.log('Calling Supabase Edge Function with prompt:', userPrompt)
        
        // Validate input
        if (!userPrompt || typeof userPrompt !== 'string') {
            throw new Error('Prompt is required and must be a string')
        }
        
        if (userPrompt.trim().length === 0) {
            throw new Error('Prompt cannot be empty')
        }
        
        if (userPrompt.length > 500) {
            throw new Error('Prompt must be 500 characters or less')
        }

        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('generate-story', {
            body: {
                prompt: userPrompt.trim()
            }
        })

        // Handle Supabase function errors
        if (error) {
            console.error('Supabase function error:', error)
            throw new Error(error.message || 'Failed to call story generation function')
        }

        // Log the raw response for debugging
        console.log('Raw Supabase response:', data)

        // The edge function should return structured data
        // Expected format: { success: true, data: { story: string, scenes: array } }
        if (!data) {
            throw new Error('No response data from story generation function')
        }

        // Return the response as-is since the edge function handles formatting
        return data
        
    } catch (error) {
        console.error('Error in generateStoryAndScenes:', error)
        
        // Return standardized error response
        return {
            success: false,
            error: error.message || 'Failed to generate story and scenes'
        }
    }
}

/**
 * Generate image prompt from story, scene, and style (placeholder for future use)
 * @param {string} story - The generated story
 * @param {string} scene - Selected scene description
 * @param {string} style - Selected art style
 * @returns {Promise<Object>} Response with generated prompt
 */
async function generateImagePrompt(story, scene, style) {
    try {
        // TODO: Implement when generate-image-prompt edge function is ready
        const { data, error } = await supabase.functions.invoke('generate-image-prompt', {
            body: {
                story,
                scene,
                style
            }
        })

        if (error) {
            throw new Error(error.message || 'Failed to generate image prompt')
        }

        return data
        
    } catch (error) {
        console.error('Error generating image prompt:', error)
        return {
            success: false,
            error: error.message || 'Failed to generate image prompt'
        }
    }
}

/**
 * Generate image from prompt (placeholder for future use)
 * @param {string} prompt - The image generation prompt
 * @param {string} style - Selected art style
 * @returns {Promise<Object>} Response with generated image URL
 */
async function generateImage(prompt, style) {
    try {
        // TODO: Implement when generate-image edge function is ready
        const { data, error } = await supabase.functions.invoke('generate-image', {
            body: {
                prompt,
                style
            }
        })

        if (error) {
            throw new Error(error.message || 'Failed to generate image')
        }

        return data
        
    } catch (error) {
        console.error('Error generating image:', error)
        return {
            success: false,
            error: error.message || 'Failed to generate image'
        }
    }
}

// Export the functions
export { 
    generateStoryAndScenes,
    generateImagePrompt,
    generateImage
} 