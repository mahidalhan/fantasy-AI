# StoryCanvas - Master Specification

## 📋 **Project Overview**

StoryCanvas is a single-page AI-powered fan fiction creation tool that generates illustrated stories in real-time. Users enter a prompt, receive an AI-generated story with selectable scenes, choose an illustration style, and get a hyperrealistic image generated to accompany their story.

**Core Philosophy**: Zero friction, instant gratification, one-time use creative experience.

---

## 🛠️ **Tech Stack**

### **Frontend**
- **HTML5**: Semantic markup with progressive disclosure
- **CSS3**: Modern styling with CSS Grid/Flexbox, animations
- **Vanilla JavaScript**: ES6+ modules, async/await, fetch API
- **No Frameworks**: Keep it simple, fast, and dependency-free

### **Backend/API**
- **Supabase Edge Functions**: Secure serverless functions for API calls
- **Gemini API**: AI story and image generation (called from Edge Functions)
- **Deno Runtime**: TypeScript/JavaScript runtime for Edge Functions

### **Deployment**
- **Environment Variables**: API keys securely stored
- **Edge Computing**: supabase edge functions

---

## 🏗️ **Codebase Architecture**

### **File Structure**
```
storycanvas/
├── index.html                  # Single page application
├── css/
│   ├── main.css               # Core styles and layout
│   ├── components.css         # Reusable UI components
│   └── animations.css         # Loading states and transitions
├── js/
│   ├── app.js                 # Main application logic
│   ├── api.js                 # API service layer (calls Supabase Edge Functions)
│   ├── ui.js                  # UI management and DOM manipulation
│   └── utils.js               # Helper functions
├── supabase/
│   ├── functions/
│   │   ├── generate-story/
│   │   │   └── index.ts       # Story + scene generation Edge Function
│   │   ├── generate-image-prompt/
│   │   │   └── index.ts       # Image prompt generation Edge Function
│   │   ├── generate-image/
│   │   │   └── index.ts       # Image generation Edge Function
│   │   └── _shared/
│   │       └── cors.ts        # Shared CORS configuration
│   └── config.toml            # Supabase configuration
├── assets/
│   ├── icons/                 # UI icons and logos
│   └── placeholders/          # Loading and error state images
├── README.md                  # Setup and deployment instructions
└── claude.md                  # This specification file
```

**Note**: `/api` folder is deprecated - replaced by Supabase Edge Functions for security

### **Architecture Principles**
- **Modular Design**: Separation of concerns across files
- **Progressive Enhancement**: Works without JavaScript (basic form)
- **Mobile First**: Responsive design starting from mobile
- **Performance Focused**: Minimal dependencies, optimized loading
- **Error Resilient**: Graceful handling of API failures

---

## 🔄 **User Flow & States**

### **State Machine**
```
INITIAL → GENERATING_STORY → STORY_READY → 
SCENE_SELECTION → STYLE_SELECTION → 
GENERATING_PROMPT → PROMPT_READY → 
GENERATING_IMAGE → COMPLETE
```

### **User Journey**
1. **Landing** → User sees clean interface with prompt input
2. **Input** → User enters story idea and clicks "Generate Story"
3. **Story Generation** → Loading state while AI creates story + 10 scenes
4. **Story Display** → Story appears with best scene pre-selected
5. **Scene Selection** → User can cycle through ranked scenes or edit
6. **Style Selection** → User chooses illustration style
7. **Prompt Generation** → AI creates hyperrealistic image prompt
8. **Prompt Editing** → User can modify the generated prompt
9. **Image Generation** → Final image is created and displayed
10. **Completion** → User can start over or try variations

---

## 🔧 **Core Functions & Components**

### **Frontend JavaScript Classes**

#### **1. StoryCanvas (Main Application)**
```javascript
class StoryCanvas {
  constructor()
  async generateStory(userPrompt)
  nextScene()
  previousScene() 
  editScene(newText)
  selectStyle(styleName)
  async generateImagePrompt()
  editImagePrompt(newPrompt)
  async generateImage()
  reset()
  handleError(error)
}
```

#### **2. UIManager (Interface Controller)**
```javascript
class UIManager {
  showSection(sectionName)
  hideSection(sectionName)
  updateProgress(step)
  showLoading(message)
  hideLoading()
  displayStory(storyText)
  displayScene(sceneText, rank)
  displayImagePrompt(promptText)
  displayImage(imageUrl)
  showError(message)
}
```

#### **3. APIService (External Communication)**
```javascript
class APIService {
  async generateStoryAndScenes(prompt)
  async generateImagePrompt(story, scene, style)
  async generateImage(prompt)
  handleAPIError(response)
  retryWithBackoff(apiCall, maxRetries)
}
```

#### **4. SceneManager (Scene Selection Logic)**
```javascript
class SceneManager {
  constructor(rankedScenes)
  getCurrentScene()
  nextScene()
  previousScene()
  editCurrentScene(newText)
  getSceneHistory()
  resetToOriginal()
}
```

### **Supabase Edge Functions**

#### **1. generate-story/index.ts**
```typescript
// Input: { prompt: string }
// Output: { success: boolean, data: { story: string, scenes: Array<{rank: number, scene_description: string, image_gen_prompt: string}> } }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  const { prompt } = await req.json()
  
  const geminiPayload = {
    contents: [...],
    systemInstruction: {
      parts: [{ text: "You are an expert creative writer..." }]
    }
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    { method: 'POST', body: JSON.stringify(geminiPayload) }
  )
  
  return new Response(JSON.stringify({ success: true, data: parsedResponse }))
})
```

#### **2. generate-image-prompt/index.ts** (To Be Created)
```typescript
// Input: { story: string, scene: string, style: string }
// Output: { success: boolean, data: { prompt: string } }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { story, scene, style } = await req.json()
  
  const geminiPrompt = `
    Create hyperrealistic image generation prompt:
    
    STORY CONTEXT: ${story}
    SELECTED SCENE: ${scene}
    ILLUSTRATION STYLE: ${style}
    
    Generate detailed prompt with:
    - Character descriptions from story
    - Scene-specific visual elements  
    - Style-appropriate techniques
    - Lighting, composition, quality modifiers
    
    Return only the final prompt.
  `
  
  const response = await callGeminiAPI(geminiPrompt)
  return { prompt: response }
}
```

#### **3. generate-image.js**
```javascript
// Input: { prompt: string }
// Output: { imageUrl: string }

async function handler(request) {
  const { prompt } = await request.json()
  
  const imageResponse = await callGeminiImageAPI({
    prompt: prompt,
    aspectRatio: "16:9",
    quality: "high"
  })
  
  return { imageUrl: imageResponse.url }
}
```

---

## 🎨 **UI/UX Design System**

### **Visual Hierarchy**
```
┌─ Header ─────────────────────────────────┐
│ StoryCanvas Logo + Minimal Navigation   │
├─ Main Content ──────────────────────────┤
│ ┌─ Story Input Section ──────────────┐  │
│ │ Large textarea + Generate button   │  │
│ └────────────────────────────────────┘  │
│ ┌─ Generated Story Section ───────────┐  │
│ │ Typography-focused story display   │  │
│ └────────────────────────────────────┘  │
│ ┌─ Scene Selection Section ───────────┐  │
│ │ Scene card + navigation controls   │  │
│ └────────────────────────────────────┘  │
│ ┌─ Style Selection Section ───────────┐  │
│ │ Style grid + preview             │  │
│ └────────────────────────────────────┘  │
│ ┌─ Image Prompt Section ──────────────┐  │
│ │ Editable prompt + generate button  │  │
│ └────────────────────────────────────┘  │
│ ┌─ Final Image Section ───────────────┐  │
│ │ Generated artwork display          │  │
│ └────────────────────────────────────┘  │
└─ Footer ─────────────────────────────────┘
```

### **Color Palette**
- **Primary**: `#8B5CF6` (Purple) - CTA buttons, progress indicators
- **Secondary**: `#EC4899` (Pink) - Accent elements, highlights
- **Background**: `#FAFAFA` (Light Gray) - Page background
- **Surface**: `#FFFFFF` (White) - Card backgrounds
- **Text Primary**: `#1F2937` (Dark Gray) - Headings, body text
- **Text Secondary**: `#6B7280` (Medium Gray) - Captions, metadata
- **Success**: `#10B981` (Green) - Completion states
- **Warning**: `#F59E0B` (Amber) - Loading states
- **Error**: `#EF4444` (Red) - Error messages

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Headings**: Inter Bold (700)
- **Body**: Inter Regular (400)
- **UI Elements**: Inter Medium (500)
- **Code/Prompts**: JetBrains Mono (monospace)

### **Component Library**

#### **Cards**
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
}
```

#### **Buttons**
```css
.btn-primary {
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  color: #6B7280;
  border: 1px solid #D1D5DB;
  padding: 12px 24px;
  border-radius: 8px;
}
```

#### **Loading States**
```css
.loading-spinner {
  animation: spin 1s linear infinite;
  width: 24px;
  height: 24px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #8B5CF6;
  border-radius: 50%;
}
```

---

## 🔌 **API Integration Specifications**

### **Gemini API Configuration**
```javascript
const GEMINI_CONFIG = {
  baseURL: 'https://generativelanguage.googleapis.com',
  model: 'gemini-pro',
  imageModel: 'imagen-2',
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9
}
```

### **Request/Response Formats**

#### **Story Generation Request**
```json
{
  "prompt": "A wizard discovers his magic comes from emotions",
  "maxWords": 500,
  "sceneCount": 10
}
```

#### **Story Generation Response**
```json
{
  "story": "In the ancient realm of Mystara, where crystalline towers pierced clouds of starlight...",
  "scenes": [
    {
      "rank": 10,
      "scene": "The wizard's eyes blazed with golden fire as emotional energy swirled around his trembling hands, reality bending to his will."
    },
    {
      "rank": 9, 
      "scene": "Ancient runes carved themselves into the air, glowing with the intensity of his newfound understanding."
    }
  ]
}
```

#### **Image Prompt Request**
```json
{
  "story": "Full story text...",
  "scene": "Selected scene description...",
  "style": "Fantasy Art"
}
```

#### **Image Prompt Response**
```json
{
  "prompt": "A young wizard with glowing golden eyes, emotional energy swirling as visible aurora around his outstretched hands, ancient magical runes materializing in the air with brilliant light, dramatic fantasy art style with rich colors and dynamic lighting, detailed character design, mystical atmosphere, professional fantasy illustration, 8K resolution"
}
```

#### **Image Generation Request**
```json
{
  "prompt": "Generated or user-edited prompt...",
  "aspectRatio": "16:9",
  "quality": "high"
}
```

#### **Image Generation Response**
```json
{
  "imageUrl": "https://storage.googleapis.com/generated-image-url",
  "metadata": {
    "dimensions": "1024x576",
    "format": "PNG"
  }
}
```

---

## ⚡ **Performance Optimization**

### **Frontend Optimization**
- **Code Splitting**: Lazy load non-critical JavaScript
- **Image Optimization**: Responsive images with proper formats
- **CSS Minification**: Production builds with compressed styles
- **Caching Strategy**: Service worker for offline functionality
- **Bundle Size**: Keep total JavaScript under 100KB

### **API Optimization**
- **Response Compression**: Gzip enabled on all endpoints
- **Caching Headers**: Appropriate cache-control for static assets
- **Rate Limiting**: 60 requests per minute per IP
- **Timeout Handling**: 30-second timeout on API calls
- **Retry Logic**: Exponential backoff for failed requests

### **Loading Performance**
- **Critical CSS**: Inline critical styles
- **Preload Fonts**: Inter font family preloaded
- **DNS Prefetch**: Gemini API domains prefetched
- **Resource Hints**: Preconnect to external services

---

## 🔒 **Security & Error Handling**

### **Security Measures**
- **API Key Protection**: Server-side only, never exposed to client
- **Input Sanitization**: Clean user inputs before API calls
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Restrict origins in production
- **Content Security Policy**: Prevent XSS attacks

### **Error Handling Strategy**
```javascript
const ERROR_TYPES = {
  NETWORK_ERROR: 'Network connection failed',
  API_ERROR: 'Story generation service unavailable', 
  TIMEOUT_ERROR: 'Request timed out, please try again',
  RATE_LIMIT: 'Too many requests, please wait a moment',
  VALIDATION_ERROR: 'Please check your input and try again'
}
```

### **Graceful Degradation**
- **Offline Detection**: Show appropriate message when offline
- **Fallback States**: Default scenes if API fails
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Error Recovery**: Clear error states and retry options

---

## 🚀 **Deployment & Environment**

### **Environment Variables**
```bash
# Required for production
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
API_BASE_URL=https://your-domain.com/api

# Optional for development
DEBUG=true
RATE_LIMIT_DISABLED=false
```

### **Deployment Steps**
1. **Build Optimization**: Minify CSS/JS, optimize images
2. **Environment Setup**: Configure production environment variables
3. **API Deployment**: Deploy serverless functions
4. **Static Deployment**: Deploy frontend to CDN
5. **Testing**: Verify all functionality in production
6. **Monitoring**: Set up error tracking and analytics

### **Monitoring & Analytics**
- **Error Tracking**: Monitor API failures and user errors
- **Performance Monitoring**: Track page load times and API response times
- **Usage Analytics**: Track story generation success rates
- **User Experience**: Monitor completion rates and drop-off points

---

## 📊 **Success Metrics**

### **Technical KPIs**
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 5 seconds average
- **Error Rate**: < 5% of all requests
- **Completion Rate**: > 70% of users complete full flow

### **User Experience KPIs**
- **Time to First Story**: < 30 seconds
- **Scene Selection Rate**: > 80% use scene selection
- **Prompt Editing Rate**: > 40% edit image prompts
- **Retry Rate**: < 20% need to regenerate content

---

## 🔮 **Future Enhancements**

### **Phase 2 Features**
- **Style Mixing**: Combine multiple illustration styles
- **Character Consistency**: Maintain character appearance across scenes
- **Story Continuation**: Extend stories with additional chapters
- **Export Options**: Download story + image as PDF

### **Phase 3 Features**
- **Collaborative Stories**: Multi-user story creation
- **Template Library**: Pre-built story structures
- **Advanced Controls**: Fine-tune AI parameters
- **Community Gallery**: Optional story sharing

---

## 📝 **Development Guidelines**

### **Code Standards**
- **ES6+ JavaScript**: Use modern syntax and features
- **Semantic HTML**: Proper markup structure
- **Accessible Design**: WCAG 2.1 AA compliance
- **Mobile First**: Start with mobile design
- **Progressive Enhancement**: Layer functionality thoughtfully

### **Git Workflow**
```bash
main                 # Production-ready code
├── develop          # Integration branch
├── feature/*        # New features
├── fix/*           # Bug fixes
└── hotfix/*        # Production fixes
```

### **Testing Strategy**
- **Unit Tests**: Core functions and utilities
- **Integration Tests**: API endpoint functionality
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load testing on API endpoints
- **Browser Testing**: Cross-browser compatibility

This specification serves as the single source of truth for the StoryCanvas project, ensuring all team members understand the architecture, functionality, and implementation details.