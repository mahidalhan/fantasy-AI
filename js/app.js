// Import API service
import { generateStoryAndScenes, generateImage } from '../api.js'

// The "Single Source of Truth" for our entire application
const appState = {
  isLoading: false,
  error: null, // Will hold error messages, e.g., "Prompt is too long."
  storyData: null, // Will hold the entire JSON response from your API
  selectedScene: null, // Will hold the scene object the user clicks on
  currentSceneIndex: 0, // Track which scene is currently displayed
  isEditingScene: false, // Track if user is editing a scene
  generatedImagePrompt: null, // Will hold the generated image prompt for Step 4
  isGeneratingImage: false, // Track if image generation is in progress
  generatedImage: null, // Will hold the generated image data
}; 

// Get a random scene from the available scenes
function getRandomScene() {
  console.log('getRandomScene called');
  console.log('appState.storyData:', appState.storyData);
  
  if (!appState.storyData) {
    console.error('No storyData available');
    return null;
  }
  
  // Check different possible scene locations in the response
  let scenes = null;
  if (appState.storyData.scenes) {
    scenes = appState.storyData.scenes;
  } else if (appState.storyData.data && appState.storyData.data.scenes) {
    scenes = appState.storyData.data.scenes;
  } else {
    console.error('No scenes found in storyData. Available keys:', Object.keys(appState.storyData));
    console.error('Full storyData structure:', JSON.stringify(appState.storyData, null, 2));
    return null;
  }
  
  if (!scenes || scenes.length === 0) {
    console.error('Scenes array is empty or invalid:', scenes);
    return null;
  }
  
  console.log('Found scenes:', scenes.length);
  const randomIndex = Math.floor(Math.random() * scenes.length);
  appState.currentSceneIndex = randomIndex;
  console.log('Selected scene index:', randomIndex);
  console.log('Selected scene:', scenes[randomIndex]);
  return scenes[randomIndex];
}

// Get the next scene in sequence (or random if at end)
function getNextScene() {
  console.log('getNextScene called');
  
  if (!appState.storyData) {
    console.error('No storyData available');
    return null;
  }
  
  // Check different possible scene locations in the response
  let scenes = null;
  if (appState.storyData.scenes) {
    scenes = appState.storyData.scenes;
  } else if (appState.storyData.data && appState.storyData.data.scenes) {
    scenes = appState.storyData.data.scenes;
  } else {
    console.error('No scenes found in storyData');
    return null;
  }
  
  if (!scenes || scenes.length === 0) {
    console.error('Scenes array is empty or invalid:', scenes);
    return null;
  }
  
  // Move to next scene, or wrap around to random scene
  appState.currentSceneIndex = (appState.currentSceneIndex + 1) % scenes.length;
  console.log('Next scene index:', appState.currentSceneIndex);
  return scenes[appState.currentSceneIndex];
}

// Handle "Generate Creative Scene" button click
function handleGenerateCreativeScene() {
  const scene = getRandomScene();
  if (scene) {
    appState.selectedScene = scene;
    updateSceneDisplay();
    
    // Record scene selection event
    console.log('Creative scene generated and selected:', appState.currentSceneIndex + 1, scene);
  } else {
    appState.error = 'Please generate a story first';
    updateUI();
  }
}

// Handle "Next Scene" button click
function handleNextScene() {
  const scene = getNextScene();
  if (scene) {
    appState.selectedScene = scene;
    appState.isEditingScene = false; // Exit edit mode when switching scenes
    updateSceneDisplay();
    
    // Record scene selection event
    console.log('Scene selected:', appState.currentSceneIndex + 1, scene);
  }
}

// Handle "Edit Scene" button click
function handleEditScene() {
  if (!appState.selectedScene) {
    appState.error = 'No scene selected to edit';
    updateUI();
    return;
  }
  
  appState.isEditingScene = true;
  updateSceneDisplay();
}

// Handle saving edited scene
function handleSaveScene(newSceneText) {
  if (!appState.selectedScene) {
    return;
  }
  
  // Update the scene text in our state - use scene_description as primary property
  appState.selectedScene.scene_description = newSceneText.trim();
  // Also update text property if it exists for backward compatibility
  if (appState.selectedScene.text !== undefined) {
    appState.selectedScene.text = newSceneText.trim();
  }
  appState.isEditingScene = false;
  updateSceneDisplay();
}

// Handle canceling scene edit
function handleCancelEdit() {
  appState.isEditingScene = false;
  updateSceneDisplay();
}

// Update the scene display section
function updateSceneDisplay() {
  const sceneTextDiv = document.querySelector('.scene-text');
  const sceneRankDiv = document.querySelector('.scene-rank');
  const editSceneBtn = document.querySelector('.btn-secondary:nth-child(2)'); // Edit Scene button
  
  if (!appState.selectedScene) {
    return;
  }
  
  if (appState.isEditingScene) {
    // Show textarea for editing - get the current scene text
    const currentSceneText = appState.selectedScene.scene_description || appState.selectedScene.text || '';
    sceneTextDiv.innerHTML = `
      <textarea class="scene-edit-textarea" style="width: 100%; min-height: 100px; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; font-size: inherit; line-height: 1.6; resize: vertical;">${currentSceneText}</textarea>
      <div style="margin-top: 1rem;">
        <button class="btn btn-primary save-scene-btn" style="margin-right: 0.5rem;">Save Changes</button>
        <button class="btn btn-secondary cancel-edit-btn">Cancel</button>
      </div>
    `;
    
    // Add event listeners for save/cancel
    const saveBtn = sceneTextDiv.querySelector('.save-scene-btn');
    const cancelBtn = sceneTextDiv.querySelector('.cancel-edit-btn');
    const textarea = sceneTextDiv.querySelector('.scene-edit-textarea');
    
    saveBtn.addEventListener('click', () => {
      handleSaveScene(textarea.value);
    });
    
    cancelBtn.addEventListener('click', handleCancelEdit);
    
    // Focus the textarea and move cursor to end
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    
  } else {
    // Show normal scene text - check both possible property names
    const sceneText = appState.selectedScene.scene_description || appState.selectedScene.text || 'No scene description available';
    sceneTextDiv.textContent = sceneText;
  }
  
  // Update scene rank display
  if (sceneRankDiv && appState.storyData) {
    // Check different possible scene locations
    let scenes = null;
    if (appState.storyData.scenes) {
      scenes = appState.storyData.scenes;
    } else if (appState.storyData.data && appState.storyData.data.scenes) {
      scenes = appState.storyData.data.scenes;
    }
    
    if (scenes && scenes.length > 0) {
      sceneRankDiv.textContent = `🏆 Scene ${appState.currentSceneIndex + 1} of ${scenes.length}`;
    }
  }
}

// This function is triggered when the user clicks "Generate Story"
async function handleGenerateStory(prompt) {
  // 1. Update state to show we're busy
  appState.isLoading = true;
  appState.error = null;
  appState.storyData = null; // Clear previous story
  appState.selectedScene = null; // Clear selected scene
  appState.currentSceneIndex = 0; // Reset scene index
  appState.generatedImagePrompt = null; // Clear image prompt
  appState.generatedImage = null; // Clear generated image
  updateUI(); // Tell the View to re-render based on the new state

  try {
    // 2. Call your API using the existing api.js function
    console.log('Calling generateStoryAndScenes with prompt:', prompt);
    const response = await generateStoryAndScenes(prompt);

    // 3. Check if the API call was successful
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate story');
    }

    // 4. Success! Update state with the new data
    console.log('API Response:', response);
    appState.storyData = response.data;
  } catch (err) {
    // 5. Oh no! Update state with the error
    console.error('Error in handleGenerateStory:', err);
    appState.error = err.message;
  } finally {
    // 6. All done, loading is finished
    appState.isLoading = false;
    updateUI(); // Tell the View to re-render with the final data or error
  }
}

// This function is triggered when a user clicks on a scene
function handleSelectScene(rank) {
  // Find the scene in our state
  const scene = appState.storyData.scenes.find(s => s.rank === rank);
  appState.selectedScene = scene;
  updateUI(); // Tell the View to show the details of the selected scene
}

// UI Update function - syncs the HTML with the current appState
function updateUI() {
  const { isLoading, error, storyData } = appState;

  // Get DOM elements
  const generateBtn = document.getElementById('generate-btn');
  const btnText = document.getElementById('btn-text');
  const loadingSpinner = document.getElementById('loading-spinner');
  const errorMessage = document.getElementById('error-message');
  const storyContent = document.getElementById('story-content');

  // Handle loading state
  if (isLoading) {
    btnText.style.display = 'none';
    loadingSpinner.style.display = 'inline-flex';
    generateBtn.disabled = true;
  } else {
    btnText.style.display = 'inline';
    loadingSpinner.style.display = 'none';
    generateBtn.disabled = false;
  }

  // Handle error display
  if (error) {
    errorMessage.textContent = error;
    errorMessage.style.display = 'block';
  } else {
    errorMessage.style.display = 'none';
  }

  // Handle story display
  if (storyData && storyData.story) {
    storyContent.textContent = storyData.story;
    console.log('Story updated in UI:', storyData.story.substring(0, 100) + '...');
  }
}

// Handle "Generate Image Prompt" button click
function handleGenerateImagePrompt() {
  if (!appState.selectedScene) {
    appState.error = 'No scene selected. Please navigate through scenes using "Next Scene" button first.';
    updateUI();
    return;
  }

  // Extract the image generation prompt from the selected scene
  const imagePrompt = appState.selectedScene.image_gen_prompt || appState.selectedScene.scene_description || appState.selectedScene.text;
  
  if (!imagePrompt) {
    appState.error = 'No image prompt available for this scene.';
    updateUI();
    return;
  }

  // Store the image prompt in state
  appState.generatedImagePrompt = imagePrompt;
  
  // Update the prompt text display
  updateImagePromptDisplay();
  
  // Clear any errors
  appState.error = null;
  updateUI();
  
  console.log('Image prompt generated from selected scene:', imagePrompt);
}

// Update the image prompt display in Step 4
function updateImagePromptDisplay() {
  const promptTextDiv = document.querySelector('.prompt-text');
  
  if (!promptTextDiv) {
    console.error('Could not find .prompt-text element');
    return;
  }
  
  if (appState.generatedImagePrompt) {
    promptTextDiv.textContent = appState.generatedImagePrompt;
    console.log('Updated prompt text display with:', appState.generatedImagePrompt.substring(0, 50) + '...');
  }
}

// Handle "Generate Creative Image" button click
async function handleGenerateImage() {
  if (!appState.generatedImagePrompt) {
    appState.error = 'No image prompt available. Please select a scene and generate an image prompt first.';
    updateUI();
    return;
  }

  // Update state to show image generation in progress
  appState.isGeneratingImage = true;
  appState.error = null;
  appState.generatedImage = null;
  updateImageGenerationUI();

  try {
    console.log('Generating image with prompt:', appState.generatedImagePrompt.substring(0, 100) + '...');
    
    // Call the image generation API
    const response = await generateImage(appState.generatedImagePrompt);

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate image');
    }

    // Success! Store the generated image
    appState.generatedImage = response.data;
    console.log('Image generated successfully');
    
  } catch (err) {
    console.error('Error generating image:', err);
    appState.error = err.message;
  } finally {
    appState.isGeneratingImage = false;
    updateImageGenerationUI();
    updateUI();
  }
}

// Handle "Regenerate Image" button click
async function handleRegenerateImage() {
  if (!appState.generatedImagePrompt) {
    appState.error = 'No image prompt available. Please generate an image first.';
    updateUI();
    return;
  }

  // Update state to show image generation in progress
  appState.isGeneratingImage = true;
  appState.error = null;
  updateImageGenerationUI();

  try {
    console.log('Regenerating image with prompt:', appState.generatedImagePrompt.substring(0, 100) + '...');
    
    // Call the image generation API
    const response = await generateImage(appState.generatedImagePrompt);

    if (!response.success) {
      throw new Error(response.error || 'Failed to regenerate image');
    }

    // Success! Store the newly generated image
    appState.generatedImage = response.data;
    console.log('Image regenerated successfully');
    
  } catch (err) {
    console.error('Error regenerating image:', err);
    appState.error = err.message;
  } finally {
    appState.isGeneratingImage = false;
    updateImageGenerationUI();
    updateUI();
  }
}

// Update the image generation UI
function updateImageGenerationUI() {
  const creativeImageBtn = document.getElementById('creative-image-btn');
  const imageLoadingDiv = document.getElementById('image-loading');
  const imagePlaceholderDiv = document.getElementById('image-placeholder');
  const imageDisplayDiv = document.getElementById('generated-image-display');
  const imageErrorDiv = document.getElementById('image-error');
  const masterpieceImg = document.getElementById('masterpiece-image');
  
  // Handle button state
  if (creativeImageBtn) {
    if (appState.isGeneratingImage) {
      creativeImageBtn.innerHTML = `
        <span class="loading-spinner"></span>
        Your Creative Image is Coming...
      `;
      creativeImageBtn.disabled = true;
    } else if (appState.generatedImage && appState.generatedImage.imageData) {
      creativeImageBtn.innerHTML = `
        <span class="btn-icon">🔄</span>
        Regenerate Image
      `;
      creativeImageBtn.disabled = false;
    } else {
      creativeImageBtn.innerHTML = `
        <span class="btn-icon">✨</span>
        Generate Creative Image
      `;
      creativeImageBtn.disabled = false;
    }
  }

  // Handle display states
  if (appState.isGeneratingImage) {
    // Show loading state
    if (imageLoadingDiv) imageLoadingDiv.style.display = 'flex';
    if (imagePlaceholderDiv) imagePlaceholderDiv.style.display = 'none';
    if (imageDisplayDiv) imageDisplayDiv.style.display = 'none';
    if (imageErrorDiv) imageErrorDiv.style.display = 'none';
    
  } else if (appState.generatedImage && appState.generatedImage.imageData) {
    // Show generated image
    if (imageLoadingDiv) imageLoadingDiv.style.display = 'none';
    if (imagePlaceholderDiv) imagePlaceholderDiv.style.display = 'none';
    if (imageDisplayDiv) imageDisplayDiv.style.display = 'block';
    if (imageErrorDiv) imageErrorDiv.style.display = 'none';
    
    // Set image source
    if (masterpieceImg) {
      const imageUrl = `data:${appState.generatedImage.mimeType || 'image/png'};base64,${appState.generatedImage.imageData}`;
      masterpieceImg.src = imageUrl;
      masterpieceImg.alt = 'AI-generated illustration based on your story';
    }
    
  } else if (appState.error) {
    // Show error state
    if (imageLoadingDiv) imageLoadingDiv.style.display = 'none';
    if (imagePlaceholderDiv) imagePlaceholderDiv.style.display = 'none';
    if (imageDisplayDiv) imageDisplayDiv.style.display = 'none';
    if (imageErrorDiv) imageErrorDiv.style.display = 'flex';
    
  } else {
    // Show placeholder state
    if (imageLoadingDiv) imageLoadingDiv.style.display = 'none';
    if (imagePlaceholderDiv) imagePlaceholderDiv.style.display = 'flex';
    if (imageDisplayDiv) imageDisplayDiv.style.display = 'none';
    if (imageErrorDiv) imageErrorDiv.style.display = 'none';
  }
}

// Handle fullscreen image view
function handleFullscreenImage() {
  if (!appState.generatedImage || !appState.generatedImage.imageData) {
    console.error('No image available for fullscreen');
    return;
  }

  const imageUrl = `data:${appState.generatedImage.mimeType || 'image/png'};base64,${appState.generatedImage.imageData}`;
  
  // Create fullscreen overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
  `;
  
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  
  // Close on click
  overlay.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  console.log('Image opened in fullscreen');
}

// Handle image download
function handleDownloadImage() {
  if (!appState.generatedImage || !appState.generatedImage.imageData) {
    console.error('No image available for download');
    return;
  }

  const imageUrl = `data:${appState.generatedImage.mimeType || 'image/png'};base64,${appState.generatedImage.imageData}`;
  
  // Create download link
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `story-illustration-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('Image download initiated');
}

// Handle image sharing
function handleShareImage() {
  if (!appState.generatedImage || !appState.generatedImage.imageData) {
    console.error('No image available for sharing');
    return;
  }

  const imageUrl = `data:${appState.generatedImage.mimeType || 'image/png'};base64,${appState.generatedImage.imageData}`;
  
  // Try to use Web Share API if available
  if (navigator.share) {
    // Convert base64 to blob for sharing
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'story-illustration.png', { type: 'image/png' });
        return navigator.share({
          title: 'My AI Story Illustration',
          text: 'Check out this AI-generated illustration from my story!',
          files: [file]
        });
      })
      .then(() => console.log('Image shared successfully'))
      .catch(err => {
        console.error('Error sharing image:', err);
        // Fallback to copy link
        copyImageToClipboard(imageUrl);
      });
  } else {
    // Fallback for browsers without Web Share API
    copyImageToClipboard(imageUrl);
  }
}

// Helper function to copy image to clipboard
function copyImageToClipboard(imageUrl) {
  // Copy the image data URL to clipboard
  navigator.clipboard.writeText(imageUrl)
    .then(() => {
      alert('Image data copied to clipboard!');
      console.log('Image data copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy image to clipboard:', err);
      alert('Could not copy image. Please try right-clicking and saving the image.');
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  
  // Get the generate button and add event listener
  const generateBtn = document.getElementById('generate-btn');
  const promptTextarea = document.getElementById('story-prompt');

  if (generateBtn && promptTextarea) {
    generateBtn.addEventListener('click', function() {
      const prompt = promptTextarea.value.trim();
      
      if (!prompt) {
        appState.error = 'Please enter a story prompt';
        updateUI();
        return;
      }

      console.log('Generate button clicked with prompt:', prompt);
      handleGenerateStory(prompt);
    });

    console.log('Event listeners added successfully');
  } else {
    console.error('Could not find required DOM elements');
  }

  // Add event listeners for scene-related buttons
  const generateCreativeSceneBtn = document.getElementById('generate-creative-scene-btn');
  const nextSceneBtn = document.getElementById('next-scene-btn');
  const editSceneBtn = document.getElementById('edit-scene-btn');
  const generateImagePromptBtn = document.getElementById('generate-image-prompt-btn');
  const creativeImageBtn = document.getElementById('creative-image-btn');

  if (generateCreativeSceneBtn) {
    generateCreativeSceneBtn.addEventListener('click', handleGenerateCreativeScene);
  }

  if (nextSceneBtn) {
    nextSceneBtn.addEventListener('click', handleNextScene);
  }

  if (editSceneBtn) {
    editSceneBtn.addEventListener('click', handleEditScene);
  }

  if (generateImagePromptBtn) {
    generateImagePromptBtn.addEventListener('click', handleGenerateImagePrompt);
  }

  if (creativeImageBtn) {
    creativeImageBtn.addEventListener('click', () => {
      if (appState.generatedImage && appState.generatedImage.imageData) {
        handleRegenerateImage();
      } else {
        handleGenerateImage();
      }
    });
  }

  // Add event listeners for image action buttons
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');
  const retryImageBtn = document.getElementById('retry-image-btn');

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', handleFullscreenImage);
    console.log('Fullscreen button listener added');
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownloadImage);
    console.log('Download button listener added');
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', handleShareImage);
    console.log('Share button listener added');
  }

  if (retryImageBtn) {
    retryImageBtn.addEventListener('click', handleRegenerateImage);
    console.log('Retry image button listener added');
  }

  // Initial UI update
  updateUI();
}); 