/**
 * Content Script for Multimodal Accessibility Extension
 * 
 * This script is injected into web pages and implements the accessibility features
 * including text-to-speech, visual enhancements, and cognitive support.
 */

import { initCrossDisabilitySupport } from './crossDisabilitySupport.js';

import { 
  initializeVisualFeedback,
  updateReadingProgress,
  toggleProgressBar,
  highlightReadingNode,
  removeHighlight,
  updateVoiceStatus,
  cleanupVisualFeedback
} from './visualFeedback.js';

import {
  initializeVisualEnhancements,
  applyVisualEnhancements,
  removeVisualEnhancements,
  updateVisualEnhancements
} from './visualEnhancements.js';

// Import cognitive support cleanup
import { initializeCognitiveSupport, cleanupCognitiveFeatures } from './cognitiveSupport.js';

// Import DOMPurify for sanitizing content
import DOMPurify from 'dompurify';

// Extension state (will be updated from background script)
let extensionState = {
  enabled: true,
  readableNodes: [],
  currentNodeIndex: 0,
  activeFeatures: {
    tts: true,
    stt: false,
    visualAssistance: true,
    imageDescription: true,
    readingAssistance: false,
    focusManagement: false,
    crossDisabilitySupport: true
  },
  userPreferences: {}
};

// TTS state
const ttsState = {
  isReading: false,
  currentUtterance: null,
  currentNode: null,
  readingQueue: [],
  voices: [],
  selectedVoice: null,
  rate: 1,
  pitch: 1,
  volume: 1
};

// STT state
const sttState = {
  isListening: false,
  recognition: null,
  commandMode: false
};

// Visual assistance state
const visualState = {
  highContrastEnabled: false,
  fontAdjustmentsEnabled: false,
  focusHighlightEnabled: false
};

// Video state (missing in original, needed for cleanupEventListeners)
const videoState = {
  currentVideos: []
};

// Initialize the content script
function initialize() {
  console.log('Initializing accessibility content script');
  
  // Request current state from background script
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response && response.state) {
      extensionState = response.state;
      applySettings();
    }
  });
  
  // Set up message listener for background script communication
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Initialize TTS
  initializeTTS();
  
  // Initialize STT if enabled
  if (extensionState.activeFeatures.stt) {
    initializeSTT();
  }
  
  // Initialize and apply visual enhancements if enabled
  if (extensionState.activeFeatures.visualAssistance) {
    initializeVisualEnhancements();
    applyVisualEnhancements();
  }
  
  // Set up image processing if enabled
  if (extensionState.activeFeatures.imageDescription) {
    processImages();
  }

  // Initialize cognitive support features if enabled
  if (extensionState.activeFeatures.cognitiveSupport) {
    initializeCognitiveSupport();
  }

  // Initialize cross-disability support features if enabled
  if (extensionState.activeFeatures.crossDisabilitySupport) {
    initCrossDisabilitySupport();
  }
  
  // Create floating control panel
  createControlPanel();
  
  // Initialize keyboard shortcuts
  initializeKeyboardShortcuts();
}

// Handle messages from background script
function handleMessage(message, sender, sendResponse) {
  console.log('Content script received message:', message);
  
  switch (message.type) {
    case 'init':
      extensionState = message.state;
      applySettings();
      break;
      
    case 'extensionToggle':
      extensionState.enabled = message.enabled;
      applySettings();
      break;
      
    case 'featureUpdate':
      extensionState.activeFeatures[message.feature] = message.enabled;
      applySettings();
      break;
      
    case 'preferencesUpdate':
      extensionState.userPreferences = { ...extensionState.userPreferences, ...message.preferences };
      applySettings();
      break;
      
    case 'action':
      handleAction(message.action);
      break;
  }
  
  return true; // Keep the message channel open for async response
}

// Apply settings based on current state
// Clean up function to remove event listeners
function cleanupEventListeners() {
  // Clean up speech recognition listeners
  if (sttState.recognition) {
    sttState.recognition.onstart = null;
    sttState.recognition.onend = null;
    sttState.recognition.onerror = null;
    sttState.recognition.onresult = null;
    sttState.recognition.stop();
  }
  
  // Clean up speech synthesis listeners
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.removeEventListener('pause', updateControlPanel);
    window.speechSynthesis.removeEventListener('resume', updateControlPanel);
    window.speechSynthesis.removeEventListener('end', updateControlPanel);
  }

  // Clean up visual feedback
  cleanupVisualFeedback();
  
  // Clean up cognitive support features
  cleanupCognitiveFeatures();

  // Clean up DOM event listeners
  document.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('scroll', updateReadingProgress);
  document.removeEventListener('click', handleWordLookup);
  document.removeEventListener('keydown', handleKeyboardShortcuts);
  
  // Clean up video event listeners
  videoState.currentVideos.forEach(video => {
    video.removeEventListener('play', handleVideoPlay);
    video.removeEventListener('pause', handleVideoPause);
    video.removeEventListener('timeupdate', handleVideoTimeUpdate);
    video.removeEventListener('ratechange', handleVideoRateChange);
  });
  
  // Reset states
  ttsState.isReading = false;
  ttsState.currentUtterance = null;
  ttsState.currentNode = null;
  ttsState.readingQueue = [];
  
  sttState.isListening = false;
  sttState.commandMode = false;
  
  // Remove visual enhancements
  removeVisualEnhancements();
  removeHighlighting();
}

// Update applySettings function
function applySettings() {
  // Clean up existing event listeners and features
  cleanupEventListeners();
  
  if (!extensionState.enabled) {
    // Hide control panel when extension is disabled
    hideControlPanel();
    return;
  }
  
  // Set up base event listeners
  setupEventListeners();
  
  // Initialize and apply features based on state
  try {
    // Text-to-Speech
    if (extensionState.activeFeatures.tts) {
      initializeTTS();
    }
    
    // Speech-to-Text
    if (extensionState.activeFeatures.stt) {
      initializeSTT();
    }
    
    // Visual Assistance
    if (extensionState.activeFeatures.visualAssistance) {
      // Update the visual module's state first
      updateVisualEnhancements({
        enabled: true, // Assuming if visualAssistance is true, the module is enabled
        highContrast: extensionState.userPreferences?.visual?.highContrast || false,
        fontAdjustments: extensionState.userPreferences?.visual?.fontAdjustments || false,
        focusHighlight: extensionState.userPreferences?.visual?.focusHighlight || false,
        fontSize: extensionState.userPreferences?.visual?.fontSize || 16,
        lineHeight: extensionState.userPreferences?.visual?.lineHeight || 1.5,
        letterSpacing: extensionState.userPreferences?.visual?.letterSpacing || 0
      });
      // applyVisualEnhancements is called within updateVisualEnhancements
    } else {
      // Ensure enhancements are removed if the feature is disabled
      removeVisualEnhancements();
    }
    
    // Image Description
    if (extensionState.activeFeatures.imageDescription) {
      processImages();
    }
    
    // Cognitive Support
    if (extensionState.activeFeatures.cognitiveSupport) {
      // Pass the current state to the initialization function
      initializeCognitiveSupport(extensionState);
    } else {
      // Ensure cognitive features are cleaned up if disabled
      // (Assuming initializeCognitiveSupport handles cleanup if state indicates disabled)
      // Alternatively, add a specific cleanup function call here if needed.
    }
    
    // Cross-disability Support
    if (extensionState.activeFeatures.crossDisabilitySupport) {
      initCrossDisabilitySupport();
    }
    
    // Create and update control panel
    createControlPanel();
    updateControlPanel();
    
  } catch (error) {
    console.error('Error applying settings:', error);
    // Attempt to clean up on error
    cleanupEventListeners();
  }
}

// Handle specific actions
function handleAction(action) {
  switch (action) {
    case 'startTTS':
      startTTS();
      break;
      
    case 'pauseTTS':
      pauseTTS();
      break;
      
    case 'stopTTS':
      stopTTS();
      break;
      
    case 'startSTT':
      startSTT();
      break;
      
    case 'stopSTT':
      stopSTT();
      break;
  }
}

// ============================================================
// Text-to-Speech Implementation
// ============================================================

// Initialize TTS functionality
function initializeTTS() {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Initialize visual feedback system
  initializeVisualFeedback();
  
  // Get available voices
  ttsState.voices = window.speechSynthesis.getVoices();
  
  // If voices array is empty, wait for voiceschanged event
  if (ttsState.voices.length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      ttsState.voices = window.speechSynthesis.getVoices();
      selectDefaultVoice();
    });
  } else {
    selectDefaultVoice();
  }
  
  // Set up speech synthesis events
  setupSpeechEvents();
}

// Select default voice based on user preferences or browser language
function selectDefaultVoice() {
  if (ttsState.voices.length === 0) return;
  
  // Check if user has a preferred voice
  const preferredVoice = extensionState.userPreferences.preferredVoice;
  if (preferredVoice) {
    const voice = ttsState.voices.find(v => v.voiceURI === preferredVoice);
    if (voice) {
      ttsState.selectedVoice = voice;
      return;
    }
  }
  
  // Otherwise select a voice that matches the browser language
  const lang = navigator.language || 'en-US';
  const langVoice = ttsState.voices.find(v => v.lang === lang);
  if (langVoice) {
    ttsState.selectedVoice = langVoice;
    return;
  }
  
  // Fallback to first available voice
  ttsState.selectedVoice = ttsState.voices[0];
}

// Set up speech synthesis events
function setupSpeechEvents() {
  // Create a global event listener for speech events
  window.speechSynthesis.addEventListener('pause', () => {
    ttsState.isReading = false;
    updateControlPanel();
  });
  
  window.speechSynthesis.addEventListener('resume', () => {
    ttsState.isReading = true;
    updateControlPanel();
  });
  
  window.speechSynthesis.addEventListener('end', () => {
    ttsState.isReading = false;
    updateControlPanel();
    // Move to next item in queue if available
    if (ttsState.readingQueue.length > 0) {
      const nextNode = ttsState.readingQueue.shift();
      readNode(nextNode);
    }
  });
}

// Start reading the page content
function startTTS() {
  if (!extensionState.enabled || !extensionState.activeFeatures.tts) return;
  
  if (ttsState.isReading) {
    // Already reading, just resume if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    return;
  }
  
  // Get readable content from the page
  extensionState.readableNodes = getReadableContent();
  if (extensionState.readableNodes.length === 0) {
    speakText('No readable content found on this page.');
    return;
  }
  
  // Reset progress tracking
  extensionState.currentNodeIndex = 0;
  
  // Show progress bar
  toggleProgressBar(true);
  updateReadingProgress(0, extensionState.readableNodes.length);
  
  // Start reading from the first node
  ttsState.readingQueue = extensionState.readableNodes.slice(1); // Store the rest for later
  readNode(extensionState.readableNodes[0]);
}

// Pause the current reading
function pauseTTS() {
  if (ttsState.isReading && window.speechSynthesis) {
    window.speechSynthesis.pause();
    ttsState.isReading = false;
    updateControlPanel();
  }
}

// Stop the current reading
function stopTTS() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    ttsState.isReading = false;
    ttsState.currentUtterance = null;
    ttsState.currentNode = null;
    ttsState.readingQueue = [];
    updateControlPanel();
    removeHighlight();
    toggleProgressBar(false);
    
    // Reset progress tracking
    extensionState.currentNodeIndex = 0;
    extensionState.readableNodes = [];
  }
}

// Read a specific DOM node
function readNode(node) {
  if (!node) return;
  
  // Store current node
  ttsState.currentNode = node;

  // Update progress tracking
  extensionState.currentNodeIndex++;
  updateReadingProgress(extensionState.currentNodeIndex, extensionState.readableNodes.length);

  // Highlight the node being read
  highlightReadingNode(node);
  
  // Get the text content
  let text = node.textContent.trim();
  
  // If it's a heading, prepend the heading level
  if (node.tagName && node.tagName.match(/^H[1-6]$/)) {
    const level = node.tagName.substring(1);
    text = `Heading level ${level}: ${text}`;
  }
  
  // Speak the text
  speakText(text);
}

// Speak the given text
function speakText(text) {
  if (!window.speechSynthesis || !text) return;
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice and parameters
  if (ttsState.selectedVoice) {
    utterance.voice = ttsState.selectedVoice;
  }
  
  utterance.rate = ttsState.rate;
  utterance.pitch = ttsState.pitch;
  utterance.volume = ttsState.volume;
  
  // Set up events for this utterance
  utterance.onstart = () => {
    ttsState.isReading = true;
    updateControlPanel();
  };
  
  utterance.onend = () => {
    ttsState.isReading = false;
    ttsState.currentUtterance = null;
    updateControlPanel();
    removeHighlighting();
    
    // Move to next item in queue if available
    if (ttsState.readingQueue.length > 0) {
      const nextNode = ttsState.readingQueue.shift();
      readNode(nextNode);
    }
  };
  
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    ttsState.isReading = false;
    ttsState.currentUtterance = null;
    updateControlPanel();
    removeHighlighting();
  };
  
  // Store current utterance
  ttsState.currentUtterance = utterance;
  
  // Speak
  window.speechSynthesis.speak(utterance);
}

// Get readable content from the page
function getReadableContent() {
  // Main content selectors (common patterns for main content)
  const mainSelectors = [
    'main',
    'article',
    '#content',
    '.content',
    '.main',
    '.article'
  ];
  
  // Try to find main content container
  let mainContent = null;
  for (const selector of mainSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      mainContent = element;
      break;
    }
  }
  
  // If no main content found, use body
  if (!mainContent) {
    mainContent = document.body;
  }
  
  // Get all text nodes within the main content
  const textNodes = [];
  
  // First, get all headings as they're important for structure
  const headings = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    if (isNodeVisible(heading) && heading.textContent.trim()) {
      textNodes.push(heading);
    }
  });
  
  // Then get paragraphs and other text containers
  const textContainers = mainContent.querySelectorAll('p, li, td, th, figcaption, blockquote');
  textContainers.forEach(container => {
    if (isNodeVisible(container) && container.textContent.trim()) {
      textNodes.push(container);
    }
  });
  
  return textNodes;
}

// Check if a node is visible
function isNodeVisible(node) {
  const style = window.getComputedStyle(node);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         node.offsetWidth > 0 &&
         node.offsetHeight > 0;
}

// Highlight the node being read
function highlightNode(node) {
  // Remove any existing highlighting
  removeHighlighting();
  
  // Add highlighting class
  node.classList.add('accessibility-extension-highlight');
  
  // Create highlighting style if it doesn't exist
  if (!document.getElementById('accessibility-extension-styles')) {
    const style = document.createElement('style');
    style.id = 'accessibility-extension-styles';
    style.textContent = `
      .accessibility-extension-highlight {
        background-color: rgba(66, 133, 244, 0.2) !important;
        outline: 2px solid rgba(66, 133, 244, 0.8) !important;
        border-radius: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Scroll to the node if needed
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Remove highlighting from all nodes
function removeHighlighting() {
  const highlighted = document.querySelectorAll('.accessibility-extension-highlight');
  highlighted.forEach(node => {
    node.classList.remove('accessibility-extension-highlight');
  });
}

// ============================================================
// Speech-to-Text Implementation
// ============================================================

// Initialize STT functionality
function initializeSTT() {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    console.error('Speech recognition not supported');
    return;
  }
  
  // Create speech recognition object
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  sttState.recognition = new SpeechRecognition();
  
  // Configure recognition
  sttState.recognition.continuous = true;
  sttState.recognition.interimResults = true;
  sttState.recognition.lang = navigator.language || 'en-US';
  
  // Set up recognition events
  setupRecognitionEvents();
}

// Set up speech recognition events
function setupRecognitionEvents() {
  if (!sttState.recognition) return;
  
  sttState.recognition.onstart = () => {
    sttState.isListening = true;
    updateVoiceStatus(true);
    updateControlPanel();
  };
  
  sttState.recognition.onend = () => {
    sttState.isListening = false;
    updateVoiceStatus(false);
    updateControlPanel();
  };
  
  sttState.recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    sttState.isListening = false;
    updateVoiceStatus(false);
    updateControlPanel();
  };
  
  sttState.recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');
    
    // Check if this is a final result
    const isFinal = event.results[event.results.length - 1].isFinal;
    
    // Update voice status with current transcript
    updateVoiceStatus(true, transcript);
    
    if (isFinal) {
      processVoiceCommand(transcript);
    }
  };
}

// Start speech recognition
function startSTT() {
  if (!extensionState.enabled || !extensionState.activeFeatures.stt) return;
  
  if (sttState.isListening) return;
  
  if (!sttState.recognition) {
    initializeSTT();
  }
  
  try {
    sttState.recognition.start();
    sttState.commandMode = true; // Start in command mode
  } catch (error) {
    console.error('Error starting speech recognition:', error);
  }
}

// Stop speech recognition
function stopSTT() {
  if (sttState.isListening && sttState.recognition) {
    try {
      sttState.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
    sttState.isListening = false;
    sttState.commandMode = false;
    updateControlPanel();
  }
}

// Process voice commands
function processVoiceCommand(transcript) {
  // Convert to lowercase for easier matching
  const command = transcript.toLowerCase().trim();
  
  console.log('Processing voice command:', command);
  
  // Basic commands
  if (command.includes('stop reading') || command.includes('stop speaking')) {
    stopTTS();
    return;
  }
  
  if (command.includes('start reading') || command.includes('read page')) {
    startTTS();
    return;
  }
  
  if (command.includes('pause reading') || command.includes('pause speech')) {
    pauseTTS();
    return;
  }
  
  if (command.includes('resume reading') || command.includes('continue reading')) {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      startTTS();
    }
    return;
  }
  
  // Navigation commands
  if (command.includes('scroll down')) {
    window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
    return;
  }
  
  if (command.includes('scroll up')) {
    window.scrollBy({ top: -window.innerHeight / 2, behavior: 'smooth' });
    return;
  }
  
  if (command.includes('go back')) {
    window.history.back();
    return;
  }
  
  if (command.includes('go forward')) {
    window.history.forward();
    return;
  }
  
  // Click commands - find links or buttons with matching text
  if (command.includes('click')) {
    const target = command.replace('click', '').trim();
    if (target) {
      clickElementWithText(target);
    }
    return;
  }
  
  // Toggle features
  if (command.includes('enable high contrast') || command.includes('turn on high contrast')) {
    visualState.highContrastEnabled = true;
    applyVisualEnhancements();
    return;
  }
  
  if (command.includes('disable high contrast') || command.includes('turn off high contrast')) {
    visualState.highContrastEnabled = false;
    applyVisualEnhancements();
    return;
  }
  
  // If no command matched, provide feedback
  speakText('Command not recognized. Please try again.');
}

// Find and click an element with matching text
function clickElementWithText(text) {
  // Normalize the search text
  const searchText = text.toLowerCase();
  
  // Find all clickable elements
  const clickableElements = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
  
  // Try to find an element with matching text
  for (const element of clickableElements) {
    const elementText = element.textContent.toLowerCase();
    if (elementText.includes(searchText)) {
      element.click();
      speakText(`Clicked ${element.textContent.trim()}`);
      return;
    }
  }
  
  // If no exact match, try to find a partial match
  for (const element of clickableElements) {
    const elementText = element.textContent.toLowerCase();
    if (elementText.includes(searchText.split(' ')[0])) {
      element.click();
      speakText(`Clicked ${element.textContent.trim()}`);
      return;
    }
  }
  
  speakText(`Could not find element containing "${text}"`);
}

// ============================================================
// Visual Assistance Implementation
// ============================================================

// Apply visual enhancements based on settings
function applyVisualEnhancements() {
  if (!extensionState.enabled || !extensionState.activeFeatures.visualAssistance) {
    removeVisualEnhancements();
    return;
  }
  
  // Create or update styles
  let styleElement = document.getElementById('accessibility-extension-visual-styles');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'accessibility-extension-visual-styles';
    document.head.appendChild(styleElement);
  }
  
  // Build CSS based on enabled enhancements
  let css = '';
  
  // High contrast mode
  if (visualState.highContrastEnabled) {
    css += `
      body {
        background-color: #000000 !important;
        color: #FFFFFF !important;
      }
      a, button, input, select, textarea {
        background-color: #000000 !important;
        color: #FFFF00 !important;
        border-color: #FFFF00 !important;
      }
      a:hover, button:hover {
        background-color: #333333 !important;
      }
      img, video {
        filter: brightness(1.2) contrast(1.2) !important;
      }
    `;
  }
  
  // Font adjustments
  if (visualState.fontAdjustmentsEnabled) {
    const fontSize = extensionState.userPreferences.fontSize || '18px';
    const lineHeight = extensionState.userPreferences.lineHeight || '1.5';
    const fontFamily = extensionState.userPreferences.fontFamily || 'Arial, sans-serif';
    
    css += `
      body, p, div, span, li, td, th, input, textarea, button, select, option {
        font-size: ${fontSize} !important;
        line-height: ${lineHeight} !important;
        font-family: ${fontFamily} !important;
        letter-spacing: 0.5px !important;
      }
    `;
  }
  
  // Focus highlighting
  if (visualState.focusHighlightEnabled) {
    css += `
      :focus {
        outline: 3px solid #FF4500 !important;
        outline-offset: 2px !important;
      }
      a:focus, button:focus, input:focus, select:focus, textarea:focus {
        box-shadow: 0 0 0 3px #FF4500 !important;
      }
    `;
  }
  
  // Apply the CSS
  styleElement.textContent = css;
}

// Remove visual enhancements
function removeVisualEnhancements() {
  const styleElement = document.getElementById('accessibility-extension-visual-styles');
  if (styleElement) {
    styleElement.remove();
  }
}

// Process all images on the page
async function processImages() {
  const allImages = document.querySelectorAll('img:not([data-processed])');
  const processedImages = [];
  let processedCount = 0;

  // Create status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'accessibility-extension-status';
  statusIndicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(66, 133, 244, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  document.body.appendChild(statusIndicator);

  try {
    for (const img of allImages) {
      // Skip images that are too small or likely to be icons
      if (img.width < 50 || img.height < 50) {
        continue;
      }

      // Create processing indicator for this image
      const indicator = document.createElement('div');
      indicator.className = 'accessibility-extension-indicator';
      indicator.style.cssText = `
        position: absolute;
        top: ${img.offsetTop}px;
        left: ${img.offsetLeft}px;
        background: rgba(66, 133, 244, 0.1);
        color: #4285F4;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        border: 2px solid #4285F4;
      `;
      indicator.innerHTML = '🔄 Processing...';
      
      document.body.appendChild(indicator);
      
      // Update status indicator
      statusIndicator.innerHTML = `
        <div class="accessibility-extension-spinner" style="width: 12px; height: 12px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: accessibility-extension-spin 1s linear infinite;"></div>
        Processing images: ${processedCount}/${allImages.length}
      `;
      
      try {
        // Process this image
        const description = await processImage(img);
        img.setAttribute('alt', description);
        indicator.style.border = '2px solid #34A853';
        indicator.style.background = 'rgba(52, 168, 83, 0.1)';
        indicator.innerHTML = '✓ Described';
        
        // Remove the indicator after 3 seconds
        setTimeout(() => {
          indicator.remove();
        }, 3000);
        
        processedImages.push(img);
        processedCount++;
      } catch (error) {
        console.error('Error processing image:', error);
        img.setAttribute('alt', 'Image description failed');
        indicator.style.border = '2px solid #EA4335';
        indicator.style.background = 'rgba(234, 67, 53, 0.1)';
        indicator.innerHTML = '⚠️ Description failed';
        
        // Remove the error indicator after 5 seconds
        setTimeout(() => {
          indicator.remove();
        }, 5000);
      }
    }
    
    // Update final status and remove after 3 seconds
    statusIndicator.style.background = 'rgba(52, 168, 83, 0.9)';
    statusIndicator.innerHTML = `✓ Processed ${processedCount} images`;
    setTimeout(() => {
      statusIndicator.remove();
    }, 3000);
    
    // Add animation styles if not already present
    if (!document.getElementById('accessibility-extension-animations')) {
      const style = document.createElement('style');
      style.id = 'accessibility-extension-animations';
      style.textContent = `
        @keyframes accessibility-extension-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    console.log(`Successfully processed ${processedImages.length} images`);
    return processedImages.length;
  } catch (error) {
    console.error('Error in processImages:', error);
    return 0;
  }
}

// Process a single image to generate a description
async function processImage(img) {
  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'accessibility-extension-loading';
  loadingIndicator.textContent = '🔄 Processing...';
  loadingIndicator.style.cssText = `
    position: absolute;
    background: rgba(66, 133, 244, 0.1);
    color: #4285F4;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  `;

  try {
    // In a real implementation, we would use an image recognition API
    // For this demo, we'll just add a simple description after a delay
    const description = await new Promise(resolve => {
      setTimeout(() => {
        const url = img.src;
        const filename = url.substring(url.lastIndexOf('/') + 1);
        resolve(`Image: ${filename.split('.')[0].replace(/[-_]/g, ' ')}`);
      }, 1000);
    });

    // Set the alt text and mark as processed
    img.setAttribute('alt', description);
    img.setAttribute('data-processed', 'true');

    // Add hover effect and click-to-speak if TTS is enabled
    img.title = description;
    if (extensionState.activeFeatures.tts) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => speakText(description));
    }

    return description;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  } finally {
    loadingIndicator.remove();
  }
}

// Generate a mock description for testing
function generateMockDescription(img) {
  const aspectRatio = img.width / img.height;
  const size = `${img.width}x${img.height}`;
  let type = 'image';
  
  if (aspectRatio > 2) {
    type = 'landscape banner';
  } else if (aspectRatio < 0.5) {
    type = 'vertical banner';
  } else if (Math.abs(aspectRatio - 1) < 0.1) {
    type = 'square image';
  }
  
  // Extract filename from src
  const filename = img.src.split('/').pop().split('?')[0];
  
  return `A ${type} (${size}) - ${filename}`;
}

// Start the content script
initialize();

// Export functions for use in other modules
export {
  startTTS,
  pauseTTS,
  stopTTS,
  startSTT,
  stopSTT
};