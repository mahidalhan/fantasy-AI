/**
 * Main StoryCanvas Application
 */

import apiService from './api.js';
import uiManager from './ui.js';
import utils from './utils.js';

class StoryCanvas {
  constructor() {
    this.state = {
      currentStory: '',
      selectedScene: null,
      selectedStyle: '',
      generatedPrompt: '',
      generatedImage: null,
      scenes: []
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    uiManager.updateProgress(0, 'Ready to begin');
  }

  setupEventListeners() {
    // Story generation
    const generateBtn = document.getElementById('generate-story-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerateStory());
    }

    // Scene selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.scene-card')) {
        this.handleSceneSelection(e.target.closest('.scene-card'));
      }
    });

    // Style selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.style-card')) {
        this.handleStyleSelection(e.target.closest('.style-card'));
      }
    });

    // Navigation buttons
    this.setupNavigationButtons();

    // Error dismissal
    const dismissErrorBtn = document.getElementById('dismiss-error-btn');
    if (dismissErrorBtn) {
      dismissErrorBtn.addEventListener('click', () => uiManager.hideError());
    }
  }

  setupNavigationButtons() {
    // Continue to style selection
    const proceedToStyleBtn = document.getElementById('proceed-to-style-btn');
    if (proceedToStyleBtn) {
      proceedToStyleBtn.addEventListener('click', () => {
        uiManager.showSection('style-selection-section');
        uiManager.updateProgress(50, 'Choose your style');
      });
    }

    // Continue to prompt review
    const proceedToPromptBtn = document.getElementById('proceed-to-prompt-btn');
    if (proceedToPromptBtn) {
      proceedToPromptBtn.addEventListener('click', () => this.handleProceedToPrompt());
    }

    // Generate image
    const generateImageBtn = document.getElementById('generate-image-btn');
    if (generateImageBtn) {
      generateImageBtn.addEventListener('click', () => this.handleGenerateImage());
    }

    // Back buttons
    const backButtons = document.querySelectorAll('[id*="back-"]');
    backButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleBackNavigation(e.target.id));
    });

    // Reset/Create new
    const createNewBtn = document.getElementById('create-new-btn');
    if (createNewBtn) {
      createNewBtn.addEventListener('click', () => this.reset());
    }
  }

  async handleGenerateStory() {
    const promptInput = document.getElementById('story-prompt');
    const generateBtn = document.getElementById('generate-story-btn');
    
    if (!promptInput || !generateBtn) return;
    
    const prompt = promptInput.value.trim();
    
    if (!utils.validation.isValidPrompt(prompt)) {
      uiManager.showError('Please enter a story prompt between 10 and 1000 characters.');
      return;
    }

    try {
      uiManager.showLoading(generateBtn);
      uiManager.updateProgress(20, 'Creating your story...');
      
      const result = await apiService.generateStoryAndScenes(prompt);
      
      this.state.currentStory = result.story;
      this.state.scenes = result.scenes;
      
      uiManager.displayStory(result.story);
      uiManager.displayScenes(result.scenes);
      
      uiManager.showSection('story-display-section');
      uiManager.updateProgress(30, 'Choose your favorite scene');
      
    } catch (error) {
      uiManager.showError(utils.errors.getUserMessage(error));
      utils.errors.log(error);
    } finally {
      uiManager.hideLoading(generateBtn);
    }
  }

  handleSceneSelection(sceneCard) {
    // Remove selection from other cards
    document.querySelectorAll('.scene-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Select current card
    sceneCard.classList.add('selected');
    
    const sceneId = sceneCard.dataset.sceneId;
    this.state.selectedScene = this.state.scenes.find(scene => scene.id === sceneId);
    
    // Enable continue button
    const continueBtn = document.getElementById('proceed-to-style-btn');
    if (continueBtn) {
      continueBtn.disabled = false;
    }
  }

  handleStyleSelection(styleCard) {
    // Remove selection from other cards
    document.querySelectorAll('.style-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Select current card
    styleCard.classList.add('selected');
    
    this.state.selectedStyle = styleCard.dataset.style;
    
    // Enable continue button
    const continueBtn = document.getElementById('proceed-to-prompt-btn');
    if (continueBtn) {
      continueBtn.disabled = false;
    }
  }

  async handleProceedToPrompt() {
    if (!this.state.selectedScene || !this.state.selectedStyle) {
      uiManager.showError('Please select a scene and style first.');
      return;
    }

    try {
      uiManager.updateProgress(70, 'Generating image prompt...');
      
      const result = await apiService.generateImagePrompt(
        this.state.currentStory,
        this.state.selectedScene.text,
        this.state.selectedStyle
      );
      
      this.state.generatedPrompt = result.prompt;
      uiManager.displayImagePrompt(result.prompt);
      
      uiManager.showSection('prompt-review-section');
      uiManager.updateProgress(80, 'Review and generate image');
      
    } catch (error) {
      uiManager.showError(utils.errors.getUserMessage(error));
      utils.errors.log(error);
    }
  }

  async handleGenerateImage() {
    const promptInput = document.getElementById('image-prompt');
    const generateBtn = document.getElementById('generate-image-btn');
    
    if (!promptInput || !generateBtn) return;
    
    const prompt = promptInput.value.trim();
    
    if (!utils.validation.isValidImagePrompt(prompt)) {
      uiManager.showError('Please enter a valid image prompt.');
      return;
    }

    try {
      uiManager.showLoading(generateBtn);
      uiManager.updateProgress(90, 'Generating your image...');
      
      const result = await apiService.generateImage(prompt, this.state.selectedStyle);
      
      this.state.generatedImage = result;
      
      // Display final result
      uiManager.displayGeneratedImage(result.imageUrl);
      const finalStoryText = document.getElementById('final-story-text');
      if (finalStoryText) {
        finalStoryText.textContent = this.state.currentStory;
      }
      
      uiManager.showSection('result-section');
      uiManager.updateProgress(100, 'Complete!');
      
    } catch (error) {
      uiManager.showError(utils.errors.getUserMessage(error));
      utils.errors.log(error);
    } finally {
      uiManager.hideLoading(generateBtn);
    }
  }

  handleBackNavigation(buttonId) {
    switch (buttonId) {
      case 'back-to-input-btn':
        uiManager.showSection('story-input-section');
        uiManager.updateProgress(0, 'Ready to begin');
        break;
      case 'back-to-scenes-btn':
        uiManager.showSection('story-display-section');
        uiManager.updateProgress(30, 'Choose your favorite scene');
        break;
      case 'back-to-style-btn':
        uiManager.showSection('style-selection-section');
        uiManager.updateProgress(50, 'Choose your style');
        break;
    }
  }

  reset() {
    // Reset state
    this.state = {
      currentStory: '',
      selectedScene: null,
      selectedStyle: '',
      generatedPrompt: '',
      generatedImage: null,
      scenes: []
    };
    
    // Reset UI
    document.getElementById('story-prompt').value = '';
    document.getElementById('image-prompt').value = '';
    
    // Clear selections
    document.querySelectorAll('.scene-card, .style-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Show initial section
    uiManager.showSection('story-input-section');
    uiManager.updateProgress(0, 'Ready to begin');
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.storyCanvas = new StoryCanvas();
}); 