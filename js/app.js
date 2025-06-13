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

// Handle "Use This Scene" button click
function handleUseScene() {
  if (!appState.selectedScene) {
    appState.error = 'No scene selected. Please select a scene first.';
    updateUI();
    return;
  }

  // Extract the image generation prompt from the selected scene
  const imagePrompt = appState.selectedScene.image_gen_prompt;
  
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
  
  console.log('Image prompt generated:', imagePrompt);
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

// Update the image generation UI
function updateImageGenerationUI() {
  const generateImageBtn = document.getElementById('generate-creative-image-btn');
  const imageContainer = document.querySelector('.generated-image');
  
  if (!generateImageBtn || !imageContainer) {
    console.error('Could not find image generation UI elements');
    return;
  }

  // Handle loading state for image generation button
  if (appState.isGeneratingImage) {
    generateImageBtn.innerHTML = `
      <span class="loading" style="display: inline-flex;">
        <span class="spinner"></span>
        Generating Image...
      </span>
    `;
    generateImageBtn.disabled = true;
  } else {
    generateImageBtn.innerHTML = 'Generate Creative Image';
    generateImageBtn.disabled = false;
  }

  // Handle image display
  if (appState.generatedImage && appState.generatedImage.imageData) {
    const imageUrl = `data:${appState.generatedImage.mimeType};base64,${appState.generatedImage.imageData}`;
    imageContainer.innerHTML = `
      <img src="${imageUrl}" alt="Generated Story Illustration" style="width: 100%; max-width: 512px; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
    `;
    console.log('Image displayed successfully');
  } else if (!appState.isGeneratingImage) {
    // Reset to placeholder when not generating
    imageContainer.innerHTML = `
      <div class="image-placeholder">
        🎨 Your AI-generated illustration will appear here
        <br><br>
        <small style="opacity: 0.8;">High-resolution artwork based on your story and scene</small>
      </div>
    `;
  }
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
  const useSceneBtn = document.getElementById('use-scene-btn');
  const generateImageBtn = document.getElementById('generate-creative-image-btn');

  if (generateCreativeSceneBtn) {
    generateCreativeSceneBtn.addEventListener('click', handleGenerateCreativeScene);
    console.log('Generate Creative Scene button listener added');
  }

  if (nextSceneBtn) {
    nextSceneBtn.addEventListener('click', handleNextScene);
    console.log('Next Scene button listener added');
  }

  if (editSceneBtn) {
    editSceneBtn.addEventListener('click', handleEditScene);
    console.log('Edit Scene button listener added');
  }

  if (useSceneBtn) {
    useSceneBtn.addEventListener('click', handleUseScene);
    console.log('Use Scene button listener added');
  }

  if (generateImageBtn) {
    generateImageBtn.addEventListener('click', handleGenerateImage);
    console.log('Generate Image button listener added');
  }

  // Initial UI update
  updateUI();
}); 