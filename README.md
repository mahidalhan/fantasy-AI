# StoryCanvas - AI Story & Image Generator

An AI-powered interactive platform that creates captivating stories with stunning visual illustrations.

## Features

- **AI Story Generation**: Create unique stories from simple prompts
- **Scene Selection**: Choose your favorite scene from generated options
- **Multiple Art Styles**: Fantasy, Cyberpunk, Anime, and Photorealistic styles
- **Image Generation**: AI-generated illustrations for your stories
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5
- **Backend**: Serverless Functions (Vercel/Netlify)
- **AI Services**: Google Gemini API
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Build Tools**: Native ES6 modules, no build step required

## Quick Start

### Prerequisites

- Node.js 18+ (for development server)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd storycanvas-fantasy-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
storycanvas-fantasy-ai/
├── index.html              # Main HTML file
├── package.json            # Project dependencies
├── README.md              # Project documentation  
├── .gitignore            # Git ignore rules
├── css/                  # Stylesheets
│   ├── main.css         # Core layout and typography
│   ├── components.css   # Reusable UI components
│   └── animations.css   # Loading states and transitions
├── js/                   # JavaScript modules
│   ├── app.js           # Main application logic
│   ├── api.js           # API service layer
│   ├── ui.js            # UI management
│   └── utils.js         # Utility functions
├── api/                  # Serverless functions
│   ├── generate-story-scenes.js
│   ├── generate-image-prompt.js
│   └── generate-image.js
└── assets/              # Static assets
    ├── icons/           # Icon files
    └── placeholders/    # Placeholder images
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to production

### API Endpoints

- `POST /api/generate-story-scenes` - Generate story and scene options
- `POST /api/generate-image-prompt` - Generate image prompt from story/scene
- `POST /api/generate-image` - Generate image from prompt

### Environment Variables

Create a `.env.local` file with:

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
NODE_ENV=development
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Set environment variables in Vercel dashboard

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Set environment variables in Netlify dashboard

## Usage

1. **Enter Story Prompt**: Describe the story you want to create
2. **Select Scene**: Choose your favorite scene from generated options
3. **Pick Art Style**: Select from Fantasy, Cyberpunk, Anime, or Realistic
4. **Review Prompt**: Edit the generated image prompt if needed
5. **Generate Image**: Create your unique story illustration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for AI story and image generation
- Inter font family for typography
- Modern CSS techniques for responsive design 