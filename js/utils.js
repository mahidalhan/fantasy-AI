/**
 * Utility functions for StoryCanvas
 */

// DOM utilities
export const dom = {
  /**
   * Get element by ID with error handling
   */
  get: (id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id '${id}' not found`);
    }
    return element;
  },

  /**
   * Create element with attributes and content
   */
  create: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  },

  /**
   * Show element with animation
   */
  show: (element, animationClass = 'animate-fade-in') => {
    if (!element) return;
    element.classList.remove('hidden');
    element.classList.add(animationClass);
  },

  /**
   * Hide element with animation
   */
  hide: (element, animationClass = 'animate-fade-out') => {
    if (!element) return;
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.add('hidden');
      element.classList.remove(animationClass);
    }, 300);
  }
};

// String utilities
export const strings = {
  /**
   * Truncate text to specified length
   */
  truncate: (text, maxLength, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + suffix;
  },

  /**
   * Capitalize first letter of each word
   */
  titleCase: (text) => {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  /**
   * Generate random ID
   */
  generateId: (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitize: (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
};

// Validation utilities
export const validation = {
  /**
   * Validate story prompt
   */
  isValidPrompt: (prompt) => {
    if (!prompt || typeof prompt !== 'string') return false;
    const trimmed = prompt.trim();
    return trimmed.length >= 10 && trimmed.length <= 1000;
  },

  /**
   * Validate image prompt
   */
  isValidImagePrompt: (prompt) => {
    if (!prompt || typeof prompt !== 'string') return false;
    const trimmed = prompt.trim();
    return trimmed.length >= 5 && trimmed.length <= 500;
  }
};

// Local storage utilities
export const storage = {
  /**
   * Save data to localStorage
   */
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },

  /**
   * Load data from localStorage
   */
  load: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all app data from localStorage
   */
  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('storycanvas_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
};

// Time utilities
export const time = {
  /**
   * Add delay
   */
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Format timestamp
   */
  formatTimestamp: (timestamp) => {
    return new Date(timestamp).toLocaleString();
  },

  /**
   * Get relative time
   */
  getRelativeTime: (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Error handling utilities
export const errors = {
  /**
   * Create error object with context
   */
  create: (message, code = 'UNKNOWN_ERROR', context = {}) => {
    const error = new Error(message);
    error.code = code;
    error.context = context;
    error.timestamp = Date.now();
    return error;
  },

  /**
   * Log error with context
   */
  log: (error, context = {}) => {
    console.error('StoryCanvas Error:', {
      message: error.message,
      code: error.code || 'UNKNOWN',
      context: { ...error.context, ...context },
      timestamp: error.timestamp || Date.now(),
      stack: error.stack
    });
  },

  /**
   * Get user-friendly error message
   */
  getUserMessage: (error) => {
    const errorMessages = {
      'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
      'API_ERROR': 'Service temporarily unavailable. Please try again later.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment before trying again.',
      'UNKNOWN_ERROR': 'Something went wrong. Please try again.'
    };

    return errorMessages[error.code] || errorMessages['UNKNOWN_ERROR'];
  }
};

// Performance utilities
export const perf = {
  /**
   * Measure function execution time
   */
  measure: async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  /**
   * Debounce function calls
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// URL utilities
export const url = {
  /**
   * Get URL parameters
   */
  getParams: () => {
    return new URLSearchParams(window.location.search);
  },

  /**
   * Set URL parameter
   */
  setParam: (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  },

  /**
   * Remove URL parameter
   */
  removeParam: (key) => {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
  }
};

// Export all utilities as default
const utils = {
  dom,
  strings,
  validation,
  storage,
  time,
  errors,
  perf,
  url
};

export default utils; 