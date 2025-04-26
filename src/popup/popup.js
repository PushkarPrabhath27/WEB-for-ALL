document.addEventListener('DOMContentLoaded', () => {
  const extensionToggle = document.getElementById('extension-toggle');
  const ttsStartButton = document.getElementById('tts-start');
  const sttStartButton = document.getElementById('stt-start');
  const settingsButton = document.getElementById('settings-button');
  const outputMessages = document.getElementById('output-messages');

  // Initialize the UI state
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

  // Load saved state from storage
  loadSavedState();

  // Function to update the output container with messages
  function updateOutput(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'output-message';
    messageElement.textContent = message;
    outputMessages.appendChild(messageElement);
    
    // Auto-remove messages after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.classList.add('fade-out');
        setTimeout(() => {
          if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
          }
        }, 500);
      }
    }, 5000);
  }

  // Function to send a message to the background script
  function sendMessageToBackground(action, data = {}) {
    try {
      chrome.runtime.sendMessage({ action, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
          updateOutput(`Error: ${chrome.runtime.lastError.message || 'Could not communicate with extension background'}`);
          return;
        }
        
        if (response && response.message) {
          updateOutput(response.message);
        }
        
        // Update visual feedback in content script
        if (action === 'updateFeature' || action === 'toggleExtension') {
          updateContentVisualFeedback();
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      updateOutput(`Error: ${error.message || 'Communication error'}`);
    }
  }
  
  // Function to update visual feedback in content script
  function updateContentVisualFeedback() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateVisualFeedback',
          features: uiState.features,
          enabled: uiState.extensionEnabled
        }, (response) => {
          // Handle potential errors silently
          if (chrome.runtime.lastError) {
            console.log('Content script may not be ready:', chrome.runtime.lastError);
          }
        });
      }
    });
  }
  
  // Function to save state to storage
  function saveState() {
    chrome.storage.local.set({ uiState }, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error saving state:', chrome.runtime.lastError);
      }
    });
  }
  
  // Function to load saved state
  function loadSavedState() {
    chrome.storage.local.get('uiState', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading state:', chrome.runtime.lastError);
        return;
      }
      
      if (result.uiState) {
        // Update UI state with saved values
        Object.assign(uiState, result.uiState);
        
        // Update UI elements to reflect saved state
        extensionToggle.checked = uiState.extensionEnabled;
        
        // Update feature toggles
        Object.entries(uiState.features).forEach(([key, value]) => {
          const toggle = document.getElementById(`${key}-toggle`);
          if (toggle) {
            toggle.checked = value;
          }
        });
        
        // Update button states
        updateButtonStates();
        
        // Update content script visual feedback
        updateContentVisualFeedback();
      }
    });
  }

  // Set up the main extension toggle
  extensionToggle.addEventListener('change', (event) => {
    const enabled = event.target.checked;
    uiState.extensionEnabled = enabled;
    sendMessageToBackground('toggleExtension', { enabled });
    updateButtonStates();
    saveState();
  });

  // Set up the feature toggles
  function setupFeatureToggle(elementId, featureKey) {
    const toggle = document.getElementById(elementId);
    if (toggle) {
      toggle.addEventListener('change', (event) => {
        const enabled = event.target.checked;
        uiState.features[featureKey] = enabled;
        sendMessageToBackground('updateFeature', { feature: featureKey, enabled });
        saveState();
        
        // Show feedback message
        updateOutput(`${featureKey.charAt(0).toUpperCase() + featureKey.slice(1)} ${enabled ? 'enabled' : 'disabled'}`);
      });
    }
  }

  setupFeatureToggle('tts-toggle', 'tts');
  setupFeatureToggle('stt-toggle', 'stt');
  setupFeatureToggle('visual-toggle', 'visual');
  setupFeatureToggle('image-toggle', 'image');
  setupFeatureToggle('reading-toggle', 'reading');
  setupFeatureToggle('focus-toggle', 'focus');

  // Set up the action buttons
  ttsStartButton.addEventListener('click', () => {
    sendMessageToBackground('startTTS');
  });

  sttStartButton.addEventListener('click', () => {
    sendMessageToBackground('startSTT');
  });

  // Set up the settings button
  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Update button states based on extension enabled state
  function updateButtonStates() {
    const buttons = document.querySelectorAll('.action-button');
    buttons.forEach(button => {
      button.disabled = !uiState.extensionEnabled;
    });

    const featureToggles = document.querySelectorAll('.toggle-switch input');
    featureToggles.forEach(toggle => {
      if (toggle.id !== 'extension-toggle') { // Exclude the main extension toggle
        toggle.disabled = !uiState.extensionEnabled;
        const switchLabel = toggle.closest('.toggle-switch');
        if (switchLabel) {
          switchLabel.style.opacity = uiState.extensionEnabled ? '1' : '0.6';
          switchLabel.style.cursor = uiState.extensionEnabled ? 'pointer' : 'not-allowed';
        }
      }
    });
  }

  // Initialize the UI
  updateButtonStates();
});
