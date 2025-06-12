/**
 * API Service for StoryCanvas
 * Handles all backend communication with error handling and retry logic
 */

import { errors, time } from './utils.js';

class APIService {
  constructor() {
    this.baseURL = '/api';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(endpoint, options = {}) {
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw errors.create(
            `HTTP Error: ${response.status} ${response.statusText}`,
            this.getErrorCode(response.status),
            { status: response.status, endpoint }
          );
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except rate limiting
        if (error.code === 'VALIDATION_ERROR') {
          throw error;
        }
        
        // Log attempt
        console.warn(`API request attempt ${attempt} failed:`, error.message);
        
        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries) {
          await time.delay(this.retryDelay * Math.pow(2, attempt - 1));
        }
      }
    }
    
    // All attempts failed
    errors.log(lastError, { endpoint, attempts: this.maxRetries });
    throw lastError;
  }

  /**
   * Get error code from HTTP status
   */
  getErrorCode(status) {
    if (status >= 400 && status < 500) {
      if (status === 429) return 'RATE_LIMIT_ERROR';
      return 'VALIDATION_ERROR';
    }
    if (status >= 500) return 'API_ERROR';
    return 'NETWORK_ERROR';
  }

  /**
   * Generate story and scenes from user prompt
   */
  async generateStoryAndScenes(prompt) {
    // API call implementation
    return { story: '', scenes: [] };
  }

  /**
   * Generate image prompt from story, scene, and style
   */
  async generateImagePrompt(story, scene, style) {
    // API call implementation
    return { prompt: '' };
  }

  /**
   * Generate image from prompt
   */
  async generateImage(prompt, style) {
    // API call implementation
    return { imageUrl: '' };
  }

  /**
   * Health check for API services
   */
  async healthCheck() {
    try {
      const response = await this.makeRequest('/health', {
        method: 'GET',
        timeout: 5000
      });
      
      return {
        status: 'healthy',
        timestamp: Date.now(),
        services: response.services || {}
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: error.message
      };
    }
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService; 