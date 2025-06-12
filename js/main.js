/**
 * StoryCanvas Main Application Logic
 * Handles user interactions and API calls
 */

import { generateStoryAndScenes } from '../api.js';

class StoryCanvasApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCharacterCounter();
    }

    setupEventListeners() {
        // Get DOM elements
        const promptInput = document.querySelector('.prompt-input');
        const generateButton = document.querySelector('.btn');
        
        // Character counter
        if (promptInput) {
            promptInput.addEventListener('input', () => this.updateCharacterCounter());
        }

        // Generate story button
        if (generateButton) {
            generateButton.addEventListener('click', (e) => this.handleGenerateStory(e));
        }
    }

    updateCharacterCounter() {
        // Future: Add character counter if needed
        // const promptInput = document.querySelector('.prompt-input');
        // const counter = document.querySelector('.char-counter');
        // if (promptInput && counter) {
        //     counter.textContent = `${promptInput.value.length}/500 characters`;
        // }
    }

    async handleGenerateStory(event) {
        event.preventDefault();
        
        const promptInput = document.querySelector('.prompt-input');
        const generateButton = event.target.closest('.btn');
        
        if (!promptInput || !generateButton) {
            console.error('Required elements not found');
            return;
        }

        // Get user prompt
        const userPrompt = promptInput.value.trim();
        
        // Validate prompt
        if (!userPrompt) {
            this.showError('Please enter a story idea first!');
            return;
        }

        if (userPrompt.length > 500) {
            this.showError('Prompt must be 500 characters or less');
            return;
        }

        try {
            // Show loading state
            this.setLoadingState(generateButton, true);
            this.updateProgress(1); // Step 2: Generate Story
            
            console.log('Generating story with prompt:', userPrompt);
            
            // Call the API
            const result = await generateStoryAndScenes(userPrompt);
            
            if (result.success) {
                // Display the generated story and scenes
                this.displayStoryResult(result.data);
                this.updateProgress(2); // Step 3: Scene Selection
                
                // Auto-advance to scene selection after 2 seconds
                setTimeout(() => {
                    this.showSceneSelection(result.data.scenes);
                }, 2000);
                
            } else {
                this.showError('Error generating story: ' + result.error);
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.showError('Failed to generate story. Please try again.');
        } finally {
            this.setLoadingState(generateButton, false);
        }
    }

    displayStoryResult(data) {
        // Update story content
        const storyContent = document.querySelector('.story-content');
        if (storyContent && data.story) {
            storyContent.textContent = data.story;
        }

        // Update stats
        if (data.story) {
            const wordCount = data.story.split(' ').length;
            const statValue = document.querySelector('.stat-value');
            if (statValue) {
                statValue.textContent = wordCount;
            }
        }

        // Store scenes data for later use
        window.storyCanvasData = {
            story: data.story,
            scenes: data.scenes
        };
    }

    showSceneSelection(scenes) {
        if (!scenes || scenes.length === 0) return;

        // Find the best scene (rank 5)
        const bestScene = scenes.find(scene => scene.rank === 5) || scenes[0];
        
        if (bestScene) {
            // Update scene display
            const sceneText = document.querySelector('.scene-text');
            const sceneRank = document.querySelector('.scene-rank');
            
            if (sceneText) {
                sceneText.textContent = bestScene.scene_description;
            }
            
            if (sceneRank) {
                sceneRank.textContent = `🏆 Best Scene (Rank ${bestScene.rank})`;
            }

            // Update image prompt
            const promptText = document.querySelector('.prompt-text');
            if (promptText && bestScene.image_gen_prompt) {
                promptText.textContent = bestScene.image_gen_prompt;
            }
            
            // Store current scene
            window.storyCanvasData.currentScene = bestScene;
        }

        this.updateProgress(3); // Step 4: Image Prompt
    }

    updateProgress(step) {
        // Update progress indicators
        const progressSteps = document.querySelectorAll('.progress-step');
        
        progressSteps.forEach((stepElement, index) => {
            stepElement.classList.remove('active', 'completed');
            
            if (index < step) {
                stepElement.classList.add('completed');
            } else if (index === step) {
                stepElement.classList.add('active');
            }
        });
    }

    setLoadingState(button, isLoading) {
        if (!button) return;

        const spinner = button.querySelector('.spinner');
        const buttonText = button.querySelector('.loading');
        
        if (isLoading) {
            button.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';
            if (buttonText) buttonText.textContent = 'Generating...';
        } else {
            button.disabled = false;
            if (spinner) spinner.style.display = 'none';
            if (buttonText) buttonText.textContent = 'Generated';
        }
    }

    showError(message) {
        // Simple alert for now - could be enhanced with a toast notification
        alert(message);
        console.error('StoryCanvas Error:', message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoryCanvasApp();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new StoryCanvasApp());
} else {
    new StoryCanvasApp();
} 