/**
 * UI Manager for StoryCanvas
 */

class UIManager {
  constructor() {
    this.currentSection = 'story-input-section';
    this.progress = 0;
  }

  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
      section.classList.add('hidden');
      section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      targetSection.classList.add('active');
      this.currentSection = sectionId;
    }
  }

  hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('hidden');
      section.classList.remove('active');
    }
  }

  updateProgress(percentage, text) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText && text) {
      progressText.textContent = text;
    }
    
    this.progress = percentage;
  }

  showLoading(element, text = 'Loading...') {
    if (!element) return;
    
    const btnText = element.querySelector('.btn-text');
    const btnLoading = element.querySelector('.btn-loading');
    
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) {
      btnLoading.classList.remove('hidden');
      btnLoading.style.display = 'flex';
    }
    
    element.disabled = true;
  }

  hideLoading(element) {
    if (!element) return;
    
    const btnText = element.querySelector('.btn-text');
    const btnLoading = element.querySelector('.btn-loading');
    
    if (btnText) btnText.style.display = 'block';
    if (btnLoading) {
      btnLoading.classList.add('hidden');
      btnLoading.style.display = 'none';
    }
    
    element.disabled = false;
  }

  displayStory(story) {
    const storyElement = document.getElementById('story-text');
    if (storyElement) {
      storyElement.textContent = story;
    }
  }

  displayScenes(scenes) {
    const container = document.getElementById('scenes-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    scenes.forEach((scene, index) => {
      const sceneCard = document.createElement('div');
      sceneCard.className = 'scene-card';
      sceneCard.dataset.sceneId = scene.id;
      
      sceneCard.innerHTML = `
        <div class="scene-number">${index + 1}</div>
        <div class="scene-text">${scene.text}</div>
      `;
      
      container.appendChild(sceneCard);
    });
  }

  displayImagePrompt(prompt) {
    const promptElement = document.getElementById('image-prompt');
    if (promptElement) {
      promptElement.value = prompt;
    }
  }

  displayGeneratedImage(imageUrl) {
    const imageElement = document.getElementById('generated-image');
    if (imageElement) {
      imageElement.src = imageUrl;
      imageElement.classList.add('image-fade-in');
      imageElement.onload = () => {
        imageElement.classList.add('loaded');
      };
    }
  }

  showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    if (errorContainer && errorMessage) {
      errorMessage.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  }

  hideError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.classList.add('hidden');
    }
  }
}

export default new UIManager(); 