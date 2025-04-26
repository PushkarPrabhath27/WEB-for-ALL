/**
 * Keyboard Shortcuts Module for Multimodal Accessibility Extension
 * 
 * This module manages keyboard shortcuts and hotkeys for controlling
 * the extension's features and accessibility functions.
 */

// Import necessary state and functions
import { extensionState } from './index';
import { startTTS, stopTTS, pauseTTS } from './index';
import { startSTT, stopSTT } from './index';
import { showControlPanel, hideControlPanel } from './controlPanel';

// Keyboard shortcuts configuration
const defaultShortcuts = {
  togglePanel: { key: 'P', altKey: true, shiftKey: true, description: 'Toggle control panel' },
  toggleReading: { key: 'R', altKey: true, shiftKey: true, description: 'Start/Stop reading' },
  toggleVoice: { key: 'V', altKey: true, shiftKey: true, description: 'Start/Stop voice commands' },
  pauseReading: { key: 'Space', altKey: true, description: 'Pause/Resume reading' },
  increaseSpeed: { key: 'ArrowUp', altKey: true, description: 'Increase reading speed' },
  decreaseSpeed: { key: 'ArrowDown', altKey: true, description: 'Decrease reading speed' },
  skipForward: { key: 'ArrowRight', altKey: true, description: 'Skip to next section' },
  skipBackward: { key: 'ArrowLeft', altKey: true, description: 'Skip to previous section' },
  toggleHighContrast: { key: 'H', altKey: true, shiftKey: true, description: 'Toggle high contrast' },
  toggleFocus: { key: 'F', altKey: true, shiftKey: true, description: 'Toggle focus mode' },
  emergencyStop: { key: 'Escape', description: 'Stop all active features' }
};

// Current shortcuts configuration (can be customized)
let activeShortcuts = { ...defaultShortcuts };

/**
 * Initialize keyboard shortcuts
 */
export function initializeKeyboardShortcuts() {
  // Load custom shortcuts if available
  loadCustomShortcuts();
  
  // Set up keyboard event listener
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
  if (!extensionState.enabled) {
    // Allow only the extension toggle shortcut when disabled
    if (event.altKey && event.shiftKey && event.key.toUpperCase() === 'X') {
      chrome.runtime.sendMessage({ action: 'toggleExtension', enabled: true });
      event.preventDefault();
    }
    return;
  }
  
  // Emergency stop - always active
  if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.shiftKey) {
    emergencyStop();
    event.preventDefault();
    return;
  }
  
  // Check for matching shortcuts
  for (const [action, shortcut] of Object.entries(activeShortcuts)) {
    if (isShortcutMatch(event, shortcut)) {
      executeShortcut(action);
      event.preventDefault();
      return;
    }
  }
}

/**
 * Check if an event matches a shortcut configuration
 */
function isShortcutMatch(event, shortcut) {
  return event.key.toUpperCase() === shortcut.key.toUpperCase() &&
         event.altKey === !!shortcut.altKey &&
         event.ctrlKey === !!shortcut.ctrlKey &&
         event.shiftKey === !!shortcut.shiftKey;
}

/**
 * Execute the action for a given shortcut
 */
function executeShortcut(action) {
  switch (action) {
    case 'togglePanel':
      if (typeof controlPanel !== 'undefined' && controlPanel.style.display !== 'none') {
        hideControlPanel();
      } else {
        showControlPanel();
      }
      break;
      
    case 'toggleReading':
      if (extensionState.activeFeatures.tts) {
        if (ttsState.isReading) {
          stopTTS();
        } else {
          startTTS();
        }
      }
      break;
      
    case 'toggleVoice':
      if (extensionState.activeFeatures.stt) {
        if (sttState.isListening) {
          stopSTT();
        } else {
          startSTT();
        }
      }
      break;
      
    case 'pauseReading':
      if (extensionState.activeFeatures.tts && ttsState.isReading) {
        pauseTTS();
      }
      break;
      
    case 'increaseSpeed':
      if (extensionState.activeFeatures.tts) {
        adjustReadingSpeed(0.1);
      }
      break;
      
    case 'decreaseSpeed':
      if (extensionState.activeFeatures.tts) {
        adjustReadingSpeed(-0.1);
      }
      break;
      
    case 'skipForward':
      if (extensionState.activeFeatures.tts && ttsState.isReading) {
        skipToNextSection();
      }
      break;
      
    case 'skipBackward':
      if (extensionState.activeFeatures.tts && ttsState.isReading) {
        skipToPreviousSection();
      }
      break;
      
    case 'toggleHighContrast':
      if (extensionState.activeFeatures.visualAssistance) {
        toggleHighContrast();
      }
      break;
      
    case 'toggleFocus':
      if (extensionState.activeFeatures.focusManagement) {
        toggleFocusMode();
      }
      break;
  }
}

/**
 * Emergency stop - stops all active features
 */
function emergencyStop() {
  if (ttsState.isReading) {
    stopTTS();
  }
  
  if (sttState.isListening) {
    stopSTT();
  }
  
  hideControlPanel();
  
  // Show feedback to user
  const feedback = document.createElement('div');
  feedback.textContent = 'All features stopped';
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(244, 67, 54, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 10000;
  `;
  
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

/**
 * Load custom shortcuts from user preferences
 */
function loadCustomShortcuts() {
  if (extensionState.userPreferences.keyboardShortcuts) {
    activeShortcuts = {
      ...defaultShortcuts,
      ...extensionState.userPreferences.keyboardShortcuts
    };
  }
}

/**
 * Update keyboard shortcuts configuration
 */
export function updateShortcuts(newShortcuts) {
  activeShortcuts = { ...defaultShortcuts, ...newShortcuts };
  
  // Save to user preferences
  chrome.runtime.sendMessage({
    action: 'updatePreferences',
    preferences: {
      keyboardShortcuts: newShortcuts
    }
  });
}

/**
 * Get current keyboard shortcuts configuration
 */
export function getShortcuts() {
  return { ...activeShortcuts };
}

/**
 * Reset keyboard shortcuts to defaults
 */
export function resetShortcuts() {
  activeShortcuts = { ...defaultShortcuts };
  
  // Save to user preferences
  chrome.runtime.sendMessage({
    action: 'updatePreferences',
    preferences: {
      keyboardShortcuts: defaultShortcuts
    }
  });
}