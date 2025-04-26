/**
 * Popup Output Module for Multimodal Accessibility Extension
 * 
 * This module handles displaying output messages in the popup UI
 * to provide feedback when features are toggled or actions are performed.
 */

// Import the CSS file to ensure it's processed by webpack
import './popup-output.css';

// Maximum number of messages to display
const MAX_MESSAGES = 5;

// Message display duration in milliseconds
const MESSAGE_DURATION = 5000;

/**
 * Add a message to the output container
 * @param {string} message - The message text to display
 * @param {string} type - Message type (info, success, warning, error)
 */
export function addOutputMessage(message, type = 'info') {
  const outputContainer = document.getElementById('output-messages');
  
  if (!outputContainer) {
    console.error('Output messages container not found');
    return;
  }
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `output-message ${type}`;
  messageElement.textContent = message;
  
  // Add to container
  outputContainer.appendChild(messageElement);
  
  // Limit number of messages
  const messages = outputContainer.querySelectorAll('.output-message');
  if (messages.length > MAX_MESSAGES) {
    outputContainer.removeChild(messages[0]);
  }
  
  // Auto-remove after duration
  setTimeout(() => {
    if (messageElement.parentNode === outputContainer) {
      messageElement.classList.add('fade-out');
      setTimeout(() => {
        if (messageElement.parentNode === outputContainer) {
          outputContainer.removeChild(messageElement);
        }
      }, 500); // Wait for fade animation
    }
  }, MESSAGE_DURATION);
  
  return messageElement;
}

/**
 * Clear all messages from the output container
 */
export function clearOutputMessages() {
  const outputContainer = document.getElementById('output-messages');
  
  if (outputContainer) {
    outputContainer.innerHTML = '';
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'status') {
      addOutputMessage(message.content, message.status);
    }
  });
});