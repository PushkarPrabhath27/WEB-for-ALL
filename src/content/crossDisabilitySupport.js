/**
 * Cross-disability support module for handling combined modality interactions
 * Provides synchronized text-speech presentation and multimodal notifications
 */

import { videoState } from './videoAccessibility';

// State management for cross-disability features
const crossDisabilityState = {
  // Text-to-speech synchronization
  speechSyncEnabled: false,
  currentSpeakingElement: null,
  
  // Gesture control state
  gestureMode: false,
  gestureHistory: [],
  
  // Notification preferences
  notificationPreferences: {
    visual: true,
    audio: true,
    haptic: false
  }
};

/**
 * Initialize cross-disability support features
 */
export function initCrossDisabilitySupport() {
  // Set up gesture recognition
  setupGestureRecognition();
  
  // Initialize synchronized text-speech
  setupSynchronizedPresentation();
  
  // Set up multimodal notification system
  setupNotificationSystem();
  
  // Set up message listener for popup communication
  setupMessageListener();
  
  console.log('Cross-disability support features initialized');
}

/**
 * Set up message listener for communication with popup
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle visual feedback updates
    if (message.action === 'updateVisualFeedback') {
      // Import dynamically to avoid circular dependencies
      import('./visualFeedback.js').then(module => {
        // Update the visual feedback with active features
        module.updateActiveFeatures(message.features);
        
        // Send response back to popup
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Failed to import visualFeedback module:', error);
        sendResponse({ success: false, error: error.message });
      });
      
      // Return true to indicate we'll send a response asynchronously
      return true;
    }
  });
}

/**
 * Set up gesture recognition system
 */
function setupGestureRecognition() {
  document.addEventListener('touchstart', handleGestureStart);
  document.addEventListener('touchmove', handleGestureMove);
  document.addEventListener('touchend', handleGestureEnd);
  
  // Add keyboard gesture alternatives for accessibility
  document.addEventListener('keydown', handleKeyboardGesture);
}

/**
 * Handle gesture start event
 * @param {TouchEvent} event - Touch event object
 */
function handleGestureStart(event) {
  if (!crossDisabilityState.gestureMode) return;
  
  crossDisabilityState.gestureHistory = [];
  const touch = event.touches[0];
  crossDisabilityState.gestureHistory.push({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  });
}

/**
 * Handle gesture movement
 * @param {TouchEvent} event - Touch event object
 */
function handleGestureMove(event) {
  if (!crossDisabilityState.gestureMode) return;
  
  const touch = event.touches[0];
  crossDisabilityState.gestureHistory.push({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  });
}

/**
 * Handle gesture end and trigger appropriate action
 * @param {TouchEvent} event - Touch event object
 */
function handleGestureEnd(event) {
  if (!crossDisabilityState.gestureMode) return;
  
  const gesture = interpretGesture(crossDisabilityState.gestureHistory);
  if (gesture) {
    executeGestureAction(gesture);
  }
  
  crossDisabilityState.gestureHistory = [];
}

/**
 * Handle keyboard alternatives for gestures
 * @param {KeyboardEvent} event - Keyboard event object
 */
function handleKeyboardGesture(event) {
  if (!crossDisabilityState.gestureMode) return;
  
  // Map keyboard shortcuts to gesture actions
  const keyMappings = {
    'ArrowUp': 'swipe-up',
    'ArrowDown': 'swipe-down',
    'ArrowLeft': 'swipe-left',
    'ArrowRight': 'swipe-right'
  };
  
  const gesture = keyMappings[event.key];
  if (gesture) {
    event.preventDefault();
    executeGestureAction(gesture);
  }
}

/**
 * Interpret recorded gesture points into a named gesture
 * @param {Array} gestureHistory - Array of gesture points
 * @returns {string|null} - Named gesture or null if not recognized
 */
function interpretGesture(gestureHistory) {
  if (gestureHistory.length < 2) return null;
  
  const start = gestureHistory[0];
  const end = gestureHistory[gestureHistory.length - 1];
  
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Minimum distance threshold for gesture recognition
  if (distance < 50) return null;
  
  // Determine primary direction
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'swipe-right' : 'swipe-left';
  } else {
    return deltaY > 0 ? 'swipe-down' : 'swipe-up';
  }
}

/**
 * Execute action based on recognized gesture
 * @param {string} gesture - Named gesture to execute
 */
function executeGestureAction(gesture) {
  // Map gestures to video control actions
  const gestureActions = {
    'swipe-right': () => {
      const video = document.querySelector('video');
      if (video) video.currentTime += 10;
    },
    'swipe-left': () => {
      const video = document.querySelector('video');
      if (video) video.currentTime -= 10;
    },
    'swipe-up': () => {
      const video = document.querySelector('video');
      if (video) video.volume = Math.min(1, video.volume + 0.1);
    },
    'swipe-down': () => {
      const video = document.querySelector('video');
      if (video) video.volume = Math.max(0, video.volume - 0.1);
    }
  };
  
  const action = gestureActions[gesture];
  if (action) {
    action();
    // Provide feedback through multiple modalities
    showMultimodalFeedback(gesture);
  }
}

/**
 * Set up synchronized text and speech presentation
 */
function setupSynchronizedPresentation() {
  // Monitor video playback for caption sync
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('timeupdate', () => {
      if (crossDisabilityState.speechSyncEnabled && videoState.captionsEnabled) {
        synchronizeCaptionsWithSpeech(video);
      }
    });
  });
}

/**
 * Synchronize captions with speech output
 * @param {HTMLVideoElement} video - Video element to synchronize
 */
function synchronizeCaptionsWithSpeech(video) {
  const activeCue = videoState.activeCues[video.id];
  if (activeCue && activeCue !== crossDisabilityState.currentSpeakingElement) {
    crossDisabilityState.currentSpeakingElement = activeCue;
    
    // Use Web Speech API for synchronized speech
    const utterance = new SpeechSynthesisUtterance(activeCue.text);
    speechSynthesis.speak(utterance);
  }
}

/**
 * Set up multimodal notification system
 */
function setupNotificationSystem() {
  // Initialize notification observers
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            checkForNotificationContent(node);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Check element for notification-worthy content
 * @param {Element} element - DOM element to check
 */
function checkForNotificationContent(element) {
  // Check for common notification patterns
  if (element.matches('[role="alert"], [aria-live]') ||
      element.classList.contains('notification')) {
    showMultimodalNotification(element);
  }
}

/**
 * Display notification through multiple modalities
 * @param {Element} element - Element containing notification content
 */
function showMultimodalNotification(element) {
  const content = element.textContent;
  
  // Visual notification
  if (crossDisabilityState.notificationPreferences.visual) {
    showVisualNotification(content);
  }
  
  // Audio notification
  if (crossDisabilityState.notificationPreferences.audio) {
    speakNotification(content);
  }
  
  // Haptic feedback (if supported)
  if (crossDisabilityState.notificationPreferences.haptic && navigator.vibrate) {
    navigator.vibrate(200);
  }
}

/**
 * Show visual feedback for gesture recognition
 * @param {string} gesture - Recognized gesture
 */
function showMultimodalFeedback(gesture) {
  // Visual feedback
  const feedback = document.createElement('div');
  feedback.className = 'gesture-feedback';
  feedback.textContent = gesture;
  document.body.appendChild(feedback);
  
  // Remove feedback after animation
  setTimeout(() => {
    feedback.remove();
  }, 1000);
  
  // Audio feedback
  if (crossDisabilityState.notificationPreferences.audio) {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA');
    audio.play();
  }
  
  // Haptic feedback
  if (crossDisabilityState.notificationPreferences.haptic && navigator.vibrate) {
    navigator.vibrate(50);
  }
}

/**
 * Display visual notification
 * @param {string} content - Notification content
 */
function showVisualNotification(content) {
  const notification = document.createElement('div');
  notification.className = 'visual-notification';
  notification.setAttribute('role', 'alert');
  notification.textContent = content;
  
  document.body.appendChild(notification);
  
  // Remove notification after display
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Speak notification content
 * @param {string} content - Content to speak
 */
function speakNotification(content) {
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.volume = 0.8;
  utterance.rate = 1.1;
  speechSynthesis.speak(utterance);
}