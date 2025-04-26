/**
 * Focus Management Module
 * 
 * This module implements advanced focus management features to help users
 * maintain attention and reduce distractions while reading or interacting
 * with web content.
 */

// Focus management states and configurations
const focusState = {
  enabled: false,
  mode: 'reading', // reading, interaction, or presentation
  timeout: 25, // seconds
  highlightColor: 'rgba(255, 255, 0, 0.2)',
  dimColor: 'rgba(0, 0, 0, 0.7)',
  activeElement: null,
  focusArea: null,
  timer: null,
  distractionElements: []
};

/**
 * Initialize focus management system
 * @param {Object} config - Configuration options
 */
export function initializeFocusManagement(config = {}) {
  // Update configuration
  updateConfig(config);
  
  // Create focus overlay
  createFocusOverlay();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize distraction reduction if enabled
  if (config.distractionReduction) {
    initializeDistractionReduction();
  }
}

/**
 * Update focus management configuration
 * @param {Object} config - New configuration options
 */
function updateConfig(config) {
  focusState.enabled = config.enabled ?? focusState.enabled;
  focusState.mode = config.mode ?? focusState.mode;
  focusState.timeout = config.timeout ?? focusState.timeout;
  focusState.highlightColor = config.highlightColor ?? focusState.highlightColor;
  focusState.dimColor = config.dimColor ?? focusState.dimColor;
}

/**
 * Create focus overlay elements
 */
function createFocusOverlay() {
  // Remove existing overlay if present
  const existingOverlay = document.getElementById('focus-management-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create new overlay
  const overlay = document.createElement('div');
  overlay.id = 'focus-management-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999999;
    transition: all 0.3s ease;
  `;
  
  // Create focus area
  const focusArea = document.createElement('div');
  focusArea.id = 'focus-area';
  focusArea.style.cssText = `
    position: absolute;
    border-radius: 10px;
    box-shadow: 0 0 0 9999px ${focusState.dimColor};
    transition: all 0.3s ease;
  `;
  
  overlay.appendChild(focusArea);
  document.body.appendChild(overlay);
  
  focusState.focusArea = focusArea;
}

/**
 * Set up event listeners for focus management
 */
function setupEventListeners() {
  // Mouse movement
  document.addEventListener('mousemove', handleMouseMove);
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Focus changes
  document.addEventListener('focusin', handleFocusChange);
  
  // Scroll events
  window.addEventListener('scroll', handleScroll);
  
  // Click events
  document.addEventListener('click', handleClick);
}

/**
 * Handle mouse movement
 * @param {MouseEvent} event - Mouse event
 */
function handleMouseMove(event) {
  if (!focusState.enabled) return;
  
  // Clear existing timeout
  if (focusState.timer) {
    clearTimeout(focusState.timer);
  }
  
  // Update focus area position
  updateFocusArea(event.clientX, event.clientY);
  
  // Set timeout to dim focus if mouse stops moving
  focusState.timer = setTimeout(() => {
    dimFocusArea();
  }, focusState.timeout * 1000);
}

/**
 * Update focus area position and size
 * @param {number} x - Mouse X position
 * @param {number} y - Mouse Y position
 */
function updateFocusArea(x, y) {
  if (!focusState.focusArea) return;
  
  let size = 200; // Default size
  
  // Adjust size based on mode
  if (focusState.mode === 'reading') {
    size = 150;
  } else if (focusState.mode === 'interaction') {
    size = 300;
  }
  
  // Calculate position
  const left = Math.max(0, x - size / 2);
  const top = Math.max(0, y - size / 2);
  
  // Update focus area style
  focusState.focusArea.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    width: ${size}px;
    height: ${size}px;
    border-radius: 10px;
    box-shadow: 0 0 0 9999px ${focusState.dimColor};
    background: ${focusState.highlightColor};
    transition: all 0.3s ease;
  `;
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardNavigation(event) {
  if (!focusState.enabled) return;
  
  // Get currently focused element
  const focused = document.activeElement;
  
  // Update focus area to focused element
  if (focused && focused !== document.body) {
    const rect = focused.getBoundingClientRect();
    updateFocusArea(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
}

/**
 * Handle focus changes
 * @param {FocusEvent} event - Focus event
 */
function handleFocusChange(event) {
  if (!focusState.enabled) return;
  
  focusState.activeElement = event.target;
  
  // Update focus area to new focused element
  const rect = event.target.getBoundingClientRect();
  updateFocusArea(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

/**
 * Handle scroll events
 */
function handleScroll() {
  if (!focusState.enabled || !focusState.activeElement) return;
  
  // Update focus area position after scroll
  const rect = focusState.activeElement.getBoundingClientRect();
  updateFocusArea(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

/**
 * Handle click events
 * @param {MouseEvent} event - Click event
 */
function handleClick(event) {
  if (!focusState.enabled) return;
  
  // Update focus area to clicked element
  updateFocusArea(event.clientX, event.clientY);
}

/**
 * Dim the focus area
 */
function dimFocusArea() {
  if (!focusState.focusArea) return;
  
  focusState.focusArea.style.boxShadow = `0 0 0 9999px ${focusState.dimColor}`;
  focusState.focusArea.style.background = 'transparent';
}

/**
 * Initialize distraction reduction
 */
function initializeDistractionReduction() {
  // Find potentially distracting elements
  const distractions = findDistractions();
  
  // Store original styles
  distractions.forEach(element => {
    focusState.distractionElements.push({
      element,
      originalStyle: element.style.cssText
    });
  });
  
  // Apply initial reduction
  updateDistractionReduction(true);
}

/**
 * Find potentially distracting elements
 * @returns {Array} Array of distracting elements
 */
function findDistractions() {
  return Array.from(document.querySelectorAll(
    'animation, video, iframe, .ad, [class*="banner"], [class*="popup"], [class*="notification"]'
  ));
}

/**
 * Update distraction reduction state
 * @param {boolean} reduce - Whether to reduce or restore distractions
 */
function updateDistractionReduction(reduce) {
  focusState.distractionElements.forEach(({ element, originalStyle }) => {
    if (reduce) {
      element.style.cssText = `
        opacity: 0.1;
        filter: grayscale(100%);
        transition: all 0.3s ease;
        pointer-events: none;
      `;
    } else {
      element.style.cssText = originalStyle;
    }
  });
}

/**
 * Clean up focus management
 */
export function cleanupFocusManagement() {
  // Remove overlay
  const overlay = document.getElementById('focus-management-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Clear timeout
  if (focusState.timer) {
    clearTimeout(focusState.timer);
  }
  
  // Restore distracting elements
  updateDistractionReduction(false);
  
  // Remove event listeners
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('keydown', handleKeyboardNavigation);
  document.removeEventListener('focusin', handleFocusChange);
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClick);
}