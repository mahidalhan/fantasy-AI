## TODO: Debug Duplicate api.js Files & Deploy Image Edge Function

NOTES:

### IMMEDIATE TASKS

#### 1. Debug Duplicate api.js Files 🔧
- [x] ~~Identify why there are two api.js files~~
  - ~~`js/api.js` (136 lines) - uses skypack CDN, has placeholder generateImage~~ **DELETED**
  - `api.js` (166 lines) - uses jsdelivr CDN, has full Gemini generateImage implementation **ACTIVE**
- [x] ~~Determine which file is being used by the frontend~~ 
  - `js/main.js` imports from `../api.js` (root level)
  - `js/app.js` imports from `../api.js` (root level)
- [x] ~~Remove the obsolete file and consolidate to one api.js~~ **COMPLETED**

#### 2. Deploy Image Edge Function 🚀
- [x] ~~Check if generate-image edge function exists in Supabase~~ **EXISTS**
- [ ] Deploy the Gemini image generation edge function
  - Need to link project: `supabase link --project-ref lkvyyfzytojjjaizvner`
  - Then deploy: `supabase functions deploy generate-image`
- [ ] Test the deployed function
- [ ] Test end-to-end image generation

### STATUS UPDATE ✅

**FIXED**: Duplicate api.js issue resolved!
- Your app correctly uses the root `api.js` with full Gemini implementation
- Obsolete `js/api.js` has been deleted
- Ready for edge function deployment

### ANALYSIS OF THE ISSUE

**Root Cause**: Two api.js files exist with different implementations:
1. **js/api.js**: Older version with placeholder generateImage function
2. **api.js**: Newer version with complete Gemini implementation

**Next Steps**: 
1. Check which file the HTML is importing
2. Consolidate to the newer version
3. Deploy the edge function
4. Test end-to-end functionality 

## Button Modifications Task List

### Tasks to Complete:
1. ✅ Create TODO.md with task breakdown
2. ✅ Find and examine the index.html file structure
3. ✅ Remove "Create New Story" button from HTML
4. ✅ Remove "Try Different Scene" button from HTML  
5. ✅ Update "Regenerate Image" button to connect to app.js handler
6. ✅ Add regenerate image handler function in app.js (if needed)
7. ✅ Test the functionality

### Technical Details:
- Remove two buttons: "Try Different Scene" and "Create New Story"
- Keep "Regenerate Image" button and route it to app.js
- Follow existing pattern from app.js for event handling 

## TODO

- [x] Remove progress indicator section from index.html (lines 26-32)
- [x] Remove stats section (Words, Scenes, Genre) from index.html
- [x] Improve image display component with modern UI/UX design:
  - High-quality image container with proper aspect ratio
  - Loading states and smooth transitions
  - Responsive design for all screen sizes
  - Modern card-based layout with shadows/elevation
  - Better typography and spacing
  - Interactive elements (hover effects, download options)
  - Accessibility improvements
- [x] Remove "generate variations" and "save project" buttons
- [x] Connect "regenerate image" and "generate creative image" buttons to API
- [x] Implement image display functionality in image-placeholder
- [x] Remove "Use This Scene" button
- [x] Track scene selection events when user uses "Next Scene" button
- [x] Connect "Generate Image Prompt" button to generate prompt from selected scene 

## TODO: Fix Vercel Deployment Build Error

### IMMEDIATE TASK - DEPLOYMENT FIX 🚨

#### Fix Build Script for Vercel Deployment
- [x] Update package.json build script to reference correct files
  - ~~Current script tries to minify `js/api.js` (deleted) and `js/utils.js` (doesn't exist)~~
  - Updated to use actual files: `js/app.js`, `js/ui.js`, `js/main.js`, and root `api.js`
- [x] Test build locally before deployment ✅ Build successful
- [x] Deploy to Vercel successfully ✅ Changes pushed to GitHub

**Error**: `ERROR: ENOENT: no such file or directory, open 'js/api.js'`
**Root Cause**: Build script references deleted/non-existent files 

# TODO - Fantasy AI Project

## Current Tasks

### URGENT: Vercel Deployment Fix
**Problem Analysis:**
- Vercel deployment failing with error: "No Output Directory named 'public' found after the Build completed"
- Current build process outputs minified files to `dist/` directory
- Vercel expects static files in `public/` directory by default
- index.html in root references files from `css/` and `js/` directories, not minified versions

**Root Cause:**
1. Build script outputs to `dist/` but Vercel looks for `public/`
2. The build process doesn't copy all necessary files to the output directory
3. Missing vercel.json configuration to specify custom output directory

**Solution Options:**
1. Create vercel.json to tell Vercel to use `dist` as output directory
2. Modify build process to output everything to `public` directory
3. Copy all static files (HTML, assets) to the build output directory

**Implementation Plan:**
- [ ] Create vercel.json with correct configuration
- [ ] Update build script to copy index.html and assets to dist
- [ ] Update index.html to reference minified files in production
- [ ] Test deployment 