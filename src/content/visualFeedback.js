/**
 * Visual Feedback Implementation for Accessibility Features
 * 
 * This module provides visual feedback and progress indicators for
 * text-to-speech and speech-to-text features.
 */

// State for visual feedback
const visualFeedbackState = {
  highlightedElement: null,
  progressBar: null,
  voiceIndicator: null,
  statusIndicator: null,
  readingProgress: 0,
  totalNodes: 0,
  currentNodeIndex: 0,
  activeFeatures: {}
};

// Styles for visual elements
const styles = {
  highlight: {
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    outline: '2px solid rgba(255, 165, 0, 0.5)',
    borderRadius: '3px',
    transition: 'all 0.3s ease'
  },
  progressBar: {
    container: {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '300px',
      height: '30px',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '15px',
      zIndex: 999999,
      padding: '3px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    progress: {
      width: '0%',
      height: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: '15px',
      transition: 'width 0.3s ease'
    },
    text: {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      color: '#000',
      lineHeight: '24px',
      fontSize: '12px',
      fontWeight: 'bold',
      textShadow: '0 0 2px rgba(255,255,255,0.8)'
    }
  },
  voiceIndicator: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    borderRadius: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: '14px',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  }
};

// Initialize visual feedback elements
export function initializeVisualFeedback() {
  createProgressBar();
  createVoiceIndicator();
  createStatusIndicator();
}

// Create progress bar element
function createProgressBar() {
  const container = document.createElement('div');
  Object.assign(container.style, styles.progressBar.container);
  container.style.display = 'none';

  const progress = document.createElement('div');
  Object.assign(progress.style, styles.progressBar.progress);

  const text = document.createElement('div');
  Object.assign(text.style, styles.progressBar.text);

  container.appendChild(progress);
  container.appendChild(text);
  document.body.appendChild(container);

  visualFeedbackState.progressBar = {
    container,
    progress,
    text
  };
}

// Create voice indicator element
function createVoiceIndicator() {
  const indicator = document.createElement('div');
  Object.assign(indicator.style, styles.voiceIndicator);

  const icon = document.createElement('span');
  icon.innerHTML = '🎤';

  const text = document.createElement('span');
  text.textContent = 'Listening...';

  indicator.appendChild(icon);
  indicator.appendChild(text);
  document.body.appendChild(indicator);

  visualFeedbackState.voiceIndicator = {
    container: indicator,
    text
  };
}

// Update reading progress
export function updateReadingProgress(currentNode, totalNodes) {
  if (!visualFeedbackState.progressBar) return;

  visualFeedbackState.totalNodes = totalNodes;
  visualFeedbackState.currentNodeIndex = currentNode;

  const progress = (currentNode / totalNodes) * 100;
  visualFeedbackState.readingProgress = progress;

  visualFeedbackState.progressBar.progress.style.width = `${progress}%`;
  visualFeedbackState.progressBar.text.textContent = 
    `Reading: ${Math.round(progress)}% (${currentNode}/${totalNodes})`;
}

// Show/hide progress bar
export function toggleProgressBar(show) {
  if (!visualFeedbackState.progressBar) return;
  visualFeedbackState.progressBar.container.style.display = show ? 'block' : 'none';
}

// Highlight current reading node
export function highlightReadingNode(node) {
  // Remove previous highlight
  removeHighlight();

  if (!node) return;

  // Store reference to highlighted element
  visualFeedbackState.highlightedElement = node;

  // Apply highlight styles
  const originalStyles = {
    backgroundColor: node.style.backgroundColor,
    outline: node.style.outline,
    borderRadius: node.style.borderRadius,
    transition: node.style.transition
  };

  Object.assign(node.style, styles.highlight);

  // Scroll element into view if needed
  const rect = node.getBoundingClientRect();
  const isInViewport = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );

  if (!isInViewport) {
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return originalStyles;
}

// Remove highlight from current node
export function removeHighlight() {
  const node = visualFeedbackState.highlightedElement;
  if (!node) return;

  // Reset styles
  node.style.backgroundColor = '';
  node.style.outline = '';
  node.style.borderRadius = '';
  node.style.transition = '';

  visualFeedbackState.highlightedElement = null;
}

// Update voice recognition status
export function updateVoiceStatus(isListening, transcript = '') {
  if (!visualFeedbackState.voiceIndicator) return;

  const indicator = visualFeedbackState.voiceIndicator;

  if (isListening) {
    indicator.container.style.opacity = '1';
    indicator.text.textContent = transcript || 'Listening...';
  } else {
    indicator.container.style.opacity = '0';
  }
}

/**
 * Create status indicator to show active features
 */
function createStatusIndicator() {
  // Create container
  const container = document.createElement('div');
  Object.assign(container.style, styles.statusIndicator.container);
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('role', 'status');
  container.id = 'accessibility-status-indicator';
  container.style.display = 'none';
  
  // Add title
  const title = document.createElement('div');
  title.textContent = 'Active Features';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  container.appendChild(title);
  
  // Create content container
  const content = document.createElement('div');
  content.id = 'accessibility-features-list';
  container.appendChild(content);
  
  // Add to page
  document.body.appendChild(container);
  visualFeedbackState.statusIndicator = container;
}

/**
 * Show status indicator
 */
export function showStatusIndicator() {
  if (visualFeedbackState.statusIndicator) {
    visualFeedbackState.statusIndicator.style.display = 'block';
  }
}

/**
 * Hide status indicator
 */
export function hideStatusIndicator() {
  if (visualFeedbackState.statusIndicator) {
    visualFeedbackState.statusIndicator.style.display = 'none';
  }
}

/**
 * Update active features in the status indicator
 * @param {Object} features - Object with feature names as keys and boolean status as values
 */
export function updateActiveFeatures(features) {
  visualFeedbackState.activeFeatures = { ...visualFeedbackState.activeFeatures, ...features };
  
  // Show indicator if any feature is active
  const hasActiveFeatures = Object.values(visualFeedbackState.activeFeatures).some(status => status);
  
  if (hasActiveFeatures) {
    showStatusIndicator();
    renderActiveFeatures();
  } else {
    hideStatusIndicator();
  }
}

/**
 * Render the active features in the status indicator
 */
function renderActiveFeatures() {
  if (!visualFeedbackState.statusIndicator) return;
  
  const content = document.getElementById('accessibility-features-list');
  if (!content) return;
  
  // Clear existing content
  content.innerHTML = '';
  
  // Add each feature
  Object.entries(visualFeedbackState.activeFeatures).forEach(([feature, isActive]) => {
    const item = document.createElement('div');
    Object.assign(item.style, styles.statusIndicator.item);
    
    // Create status icon
    const icon = document.createElement('span');
    Object.assign(icon.style, styles.statusIndicator.icon);
    Object.assign(icon.style, isActive ? styles.statusIndicator.active : styles.statusIndicator.inactive);
    
    // Create label
    const label = document.createElement('span');
    label.textContent = formatFeatureName(feature);
    
    // Create status text
    const status = document.createElement('span');
    status.textContent = isActive ? 'On' : 'Off';
    status.style.marginLeft = 'auto';
    status.style.fontWeight = isActive ? 'bold' : 'normal';
    
    // Assemble item
    item.appendChild(icon);
    item.appendChild(label);
    item.appendChild(status);
    content.appendChild(item);
  });
}

/**
 * Format feature name for display
 * @param {string} name - Feature name in camelCase or with underscores
 * @returns {string} - Formatted name
 */
function formatFeatureName(name) {
  // Convert camelCase or snake_case to Title Case With Spaces
  return name
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

// Clean up visual feedback elements
export function cleanupVisualFeedback() {
  // Remove progress bar
  if (visualFeedbackState.progressBar) {
    visualFeedbackState.progressBar.container.remove();
    visualFeedbackState.progressBar = null;
  }

  // Remove voice indicator
  if (visualFeedbackState.voiceIndicator) {
    visualFeedbackState.voiceIndicator.container.remove();
    visualFeedbackState.voiceIndicator = null;
  }

  // Remove status indicator
  if (visualFeedbackState.statusIndicator) {
    visualFeedbackState.statusIndicator.remove();
    visualFeedbackState.statusIndicator = null;
  }

  // Remove any remaining highlights
  removeHighlight();
}