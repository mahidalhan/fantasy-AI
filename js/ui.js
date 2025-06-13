// This is the master function that syncs the HTML with the appState
function updateUI() {
  const { isLoading, error, storyData, selectedScene } = appState; // Get current state

  // Handle loading state
  const loadingSpinner = document.getElementById('loading-spinner');
  loadingSpinner.style.display = isLoading ? 'block' : 'none';

  // Display errors
  const errorContainer = document.getElementById('error-message');
  errorContainer.textContent = error ? error : '';
  errorContainer.style.display = error ? 'block' : 'none';

  // Display the main story text
  const storyContainer = document.getElementById('story-display');
  storyContainer.innerHTML = '';
  if (storyData) {
    const storyParagraph = document.createElement('p');
    storyParagraph.textContent = storyData.story;
    storyContainer.appendChild(storyParagraph);
  }
  
  // Display the scene selection buttons
  const scenesContainer = document.getElementById('scene-selector');
  scenesContainer.innerHTML = '';
  if (storyData) {
    storyData.scenes.forEach(scene => {
      const sceneButton = document.createElement('button');
      sceneButton.className = 'scene-button';
      sceneButton.textContent = `Scene (Rank ${scene.rank})`;
      
      // When a button is clicked, it calls the LOGIC function
      sceneButton.onclick = () => handleSelectScene(scene.rank);
      
      scenesContainer.appendChild(sceneButton);
    });
  }

  // Display the details of the currently selected scene
  const sceneDetailsContainer = document.getElementById('scene-details');
  sceneDetailsContainer.innerHTML = '';
  if (selectedScene) {
    const description = document.createElement('p');
    description.innerHTML = `<b>Description:</b> ${selectedScene.scene_description}`;
    
    const imagePrompt = document.createElement('p');
    imagePrompt.innerHTML = `<b>Image Prompt:</b> ${selectedScene.image_gen_prompt}`;
    
    sceneDetailsContainer.appendChild(description);
    sceneDetailsContainer.appendChild(imagePrompt);
  }
} 