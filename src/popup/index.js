/**
 * Popup Script for Multimodal Accessibility Extension
 * 
 * This script handles the popup interface functionality, including
 * toggling features, updating settings, and communicating with the background script.
 */

// Import the output message functionality
import { addOutputMessage } from './popup-output.js';

// State to track UI elements
const uiState = {
  extensionEnabled: true,
  features: {
    tts: true,
    stt: false,
    visual: true,
    image: true,
    reading: false,
    focus: false
  }
};

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  // Get current state from background script
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response && response.state) {
      updateUIFromState(response.state);
    }
  });
  
  // Set up event listeners
  setupEventListeners();
});

// Update UI based on extension state
function updateUIFromState(state) {
  // Update main toggle
  const extensionToggle = document.getElementById('extension-toggle');
  if (extensionToggle) {
    extensionToggle.checked = state.enabled;
    uiState.extensionEnabled = state.enabled;
  }
  
  // Update feature toggles
  if (state.activeFeatures) {
    // TTS
    const ttsToggle = document.getElementById('tts-toggle');
    if (ttsToggle) {
      ttsToggle.checked = state.activeFeatures.tts;
      uiState.features.tts = state.activeFeatures.tts;
    }
    
    // STT
    const sttToggle = document.getElementById('stt-toggle');
    if (sttToggle) {
      sttToggle.checked = state.activeFeatures.stt;
      uiState.features.stt = state.activeFeatures.stt;
    }
    
    // Visual Assistance
    const visualToggle = document.getElementById('visual-toggle');
    if (visualToggle) {
      visualToggle.checked = state.activeFeatures.visualAssistance;
      uiState.features.visual = state.activeFeatures.visualAssistance;
    }
    
    // Image Descriptions
    const imageToggle = document.getElementById('image-toggle');
    if (imageToggle) {
      imageToggle.checked = state.activeFeatures.imageDescription;
      uiState.features.image = state.activeFeatures.imageDescription;
    }
    
    // Reading Assistance
    const readingToggle = document.getElementById('reading-toggle');
    if (readingToggle) {
      readingToggle.checked = state.activeFeatures.readingAssistance;
      uiState.features.reading = state.activeFeatures.readingAssistance;
    }
    
    // Focus Management
    const focusToggle = document.getElementById('focus-toggle');
    if (focusToggle) {
      focusToggle.checked = state.activeFeatures.focusManagement;
      uiState.features.focus = state.activeFeatures.focusManagement;
    }
  }
  
  // Update button states based on extension enabled state
  updateButtonStates();
}

// Set up event listeners for UI elements
function setupEventListeners() {
  // Main extension toggle
  const extensionToggle = document.getElementById('extension-toggle');
  if (extensionToggle) {
    extensionToggle.addEventListener('change', (event) => {
      const enabled = event.target.checked;
      uiState.extensionEnabled = enabled;
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'toggleExtension',
        enabled: enabled
      });
      
      // Update UI
      updateButtonStates();
      
      // Display output message
      const status = enabled ? 'success' : 'warning';
      const message = enabled ? 'Extension enabled' : 'Extension disabled';
      addOutputMessage(message, status);
    });
  }
  
  // Feature toggles
  setupFeatureToggle('tts-toggle', 'tts');
  setupFeatureToggle('stt-toggle', 'stt');
  setupFeatureToggle('visual-toggle', 'visualAssistance');
  setupFeatureToggle('image-toggle', 'imageDescription');
  setupFeatureToggle('reading-toggle', 'readingAssistance');
  setupFeatureToggle('focus-toggle', 'focusManagement');
  
  // Action buttons
  const ttsStartButton = document.getElementById('tts-start');
  if (ttsStartButton) {
    ttsStartButton.addEventListener('click', () => {
      // Send message to active tab
      sendMessageToActiveTab({ type: 'action', action: 'startTTS' });
      
      // Display output message
      addOutputMessage('Starting Text-to-Speech...', 'info');
    });
  }
  
  const sttStartButton = document.getElementById('stt-start');
  if (sttStartButton) {
    sttStartButton.addEventListener('click', () => {
      // Send message to active tab
      sendMessageToActiveTab({ type: 'action', action: 'startSTT' });
      
      // Display output message
      addOutputMessage('Starting Speech-to-Text...', 'info');
    });
  }
  
  // Settings button
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      // Open options page
      chrome.runtime.openOptionsPage();
    });
  }
}

// Set up a feature toggle
function setupFeatureToggle(elementId, featureKey) {
  const toggle = document.getElementById(elementId);
  if (toggle) {
    toggle.addEventListener('change', (event) => {
      const enabled = event.target.checked;
      
      // Update local state
      if (featureKey === 'tts') uiState.features.tts = enabled;
      else if (featureKey === 'stt') uiState.features.stt = enabled;
      else if (featureKey === 'visualAssistance') uiState.features.visual = enabled;
      else if (featureKey === 'imageDescription') uiState.features.image = enabled;
      else if (featureKey === 'readingAssistance') uiState.features.reading = enabled;
      else if (featureKey === 'focusManagement') uiState.features.focus = enabled;
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'updateFeature',
        feature: featureKey,
        enabled: enabled
      });
      
      // Display output message
      const featureName = getFeatureName(featureKey);
      const status = enabled ? 'success' : 'info';
      const message = enabled ? `${featureName} enabled` : `${featureName} disabled`;
      addOutputMessage(message, status);
    });
  }
}

// Get user-friendly feature name from feature key
function getFeatureName(featureKey) {
  switch(featureKey) {
    case 'tts': return 'Text-to-Speech';
    case 'stt': return 'Speech-to-Text';
    case 'visualAssistance': return 'Visual Enhancements';
    case 'imageDescription': return 'Image Descriptions';
    case 'readingAssistance': return 'Reading Assistance';
    case 'focusManagement': return 'Focus Management';
    default: return featureKey;
  }
}

// Update button states based on extension enabled state
function updateButtonStates() {
  const buttons = document.querySelectorAll('.action-button');
  buttons.forEach(button => {
    button.disabled = !uiState.extensionEnabled;
  });
  
  // Select the input elements within the toggle switches
  const featureToggles = document.querySelectorAll('.toggle-switch input');
  featureToggles.forEach(toggle => {
    if (toggle.id !== 'extension-toggle') { // Exclude the main extension toggle
      toggle.disabled = !uiState.extensionEnabled;
      // Optionally disable the label/switch visually too
      const switchLabel = toggle.closest('.toggle-switch');
      if (switchLabel) {
        switchLabel.style.opacity = uiState.extensionEnabled ? '1' : '0.6';
        switchLabel.style.cursor = uiState.extensionEnabled ? 'pointer' : 'not-allowed';
      }
    }
  });
}

// Send message to the active tab
function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, message).catch(err => {
        console.error('Error sending message to tab:', err);
      });
    }
  });
}