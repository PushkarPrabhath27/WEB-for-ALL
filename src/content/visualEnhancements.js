/**
 * Visual Enhancements Module
 * 
 * This module implements visual accessibility features including
 * high contrast mode, font adjustments, and focus highlighting.
 */

// Visual enhancement state
const visualEnhancementState = {
  enabled: false,
  highContrast: false,
  fontAdjustments: false,
  focusHighlight: false,
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0
};

/**
 * Initialize visual enhancements
 */
export function initializeVisualEnhancements() {
  // Create and inject styles
  createVisualStyles();
  
  // Set up mutation observer for dynamic content
  setupMutationObserver();
}

/**
 * Apply visual enhancements based on current state
 */
export function applyVisualEnhancements() {
  if (!visualEnhancementState.enabled) {
    removeVisualEnhancements();
    return;
  }

  // Add base class to body
  document.body.classList.add('accessibility-enhanced');

  // Apply high contrast if enabled
  if (visualEnhancementState.highContrast) {
    document.body.classList.add('high-contrast-mode');
  } else {
    document.body.classList.remove('high-contrast-mode');
  }

  // Apply font adjustments if enabled
  if (visualEnhancementState.fontAdjustments) {
    document.body.classList.add('font-adjusted');
    document.body.style.setProperty('--base-font-size', `${visualEnhancementState.fontSize}px`);
    document.body.style.setProperty('--base-line-height', visualEnhancementState.lineHeight);
    document.body.style.setProperty('--base-letter-spacing', `${visualEnhancementState.letterSpacing}px`);
  } else {
    document.body.classList.remove('font-adjusted');
    document.body.style.removeProperty('--base-font-size');
    document.body.style.removeProperty('--base-line-height');
    document.body.style.removeProperty('--base-letter-spacing');
  }

  // Apply focus highlighting if enabled
  if (visualEnhancementState.focusHighlight) {
    document.body.classList.add('focus-highlight');
  } else {
    document.body.classList.remove('focus-highlight');
  }
}

/**
 * Create and inject visual enhancement styles
 */
function createVisualStyles() {
  const styleElement = document.createElement('style');
  styleElement.id = 'visual-enhancement-styles';
  styleElement.textContent = `
    /* Base enhanced styles */
    .accessibility-enhanced {
      transition: all 0.3s ease;
    }

    /* High contrast mode */
    .high-contrast-mode {
      background-color: #000 !important;
      color: #fff !important;
    }

    .high-contrast-mode a {
      color: #ffff00 !important;
    }

    .high-contrast-mode button,
    .high-contrast-mode input,
    .high-contrast-mode select {
      background-color: #fff !important;
      color: #000 !important;
      border: 2px solid #fff !important;
    }

    /* Font adjustments */
    .font-adjusted {
      font-size: var(--base-font-size) !important;
      line-height: var(--base-line-height) !important;
      letter-spacing: var(--base-letter-spacing) !important;
      word-spacing: calc(var(--base-letter-spacing) * 2) !important;
    }

    .font-adjusted * {
      font-size: inherit !important;
      line-height: inherit !important;
      letter-spacing: inherit !important;
    }

    /* Focus highlighting */
    .focus-highlight *:focus {
      outline: 3px solid #4285f4 !important;
      outline-offset: 2px !important;
    }

    .focus-highlight *:focus-visible {
      outline: 3px solid #4285f4 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.4) !important;
    }
  `;

  document.head.appendChild(styleElement);
}

/**
 * Set up mutation observer for dynamic content
 */
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && visualEnhancementState.enabled) {
        // Reapply visual enhancements to new content
        applyVisualEnhancements();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Remove all visual enhancements
 */
export function removeVisualEnhancements() {
  document.body.classList.remove(
    'accessibility-enhanced',
    'high-contrast-mode',
    'font-adjusted',
    'focus-highlight'
  );

  document.body.style.removeProperty('--base-font-size');
  document.body.style.removeProperty('--base-line-height');
  document.body.style.removeProperty('--base-letter-spacing');
}

/**
 * Update visual enhancement settings
 * @param {Object} settings - New visual enhancement settings
 */
export function updateVisualEnhancements(settings) {
  Object.assign(visualEnhancementState, settings);
  applyVisualEnhancements();
}