/**
 * Options Page Script for Multimodal Accessibility Extension
 * 
 * This script handles the options page functionality, including
 * tab navigation, saving user preferences, and updating the UI.
 */

// State to track user preferences
let userPreferences = {
  general: {
    autoStart: false,
    showPanel: true,
    siteSpecific: false,
    localProcessing: true,
    usageStats: false
  },
  tts: {
    voice: 'default',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoStartReading: false,
    highlightText: true,
    skipElements: [],
    languageDetection: false
  },
  stt: {
    language: 'en-US',
    continuousRecognition: true,
    recognitionTimeout: 30,
    triggerPhrase: '',
    commandFeedback: true
  },
  visual: {
    highContrastMode: false,
    contrastScheme: 'dark',
    fontSize: 100,
    fontFamily: 'default',
    lineSpacing: 1.5,
    letterSpacing: 0.5,
    imageDescriptions: true,
    customColors: {
      textColor: '#ffffff',
      backgroundColor: '#000000',
      linkColor: '#ffff00'
    }
  },
  cognitive: {
    simplifyPage: false,
    highlightLinks: false,
    readingGuide: false,
    focusMode: false,
    simplificationLevel: 'moderate',
    dictionaryLookup: true,
    distractionReduction: false,
    readingMask: false,
    focusTimeout: 25,
    autoBookmarking: true,
    noteTaking: false
  },
  video: {
    automaticCaptions: true,
    captionSize: 100,
    captionPosition: 'bottom',
    playbackRate: 1.0,
    captionBackground: true,
    customControls: true,
    brightness: 100,
    contrast: 100,
    reduceMotion: false
  },
  profiles: {
    active: 'default',
    profiles: {
      default: {
        name: 'Default Profile',
        description: ''
      }
    }
  },
  keyboard: {
    customShortcuts: {}
  }
};

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
  // Load saved preferences
  loadSavedPreferences();
  
  // Set up tab navigation
  setupTabNavigation();
  
  // Set up form controls
  setupFormControls();
  
  // Set up import/export functionality
  setupDataManagement();
});

// Load saved preferences from storage
function loadSavedPreferences() {
  chrome.storage.local.get(['userPreferences'], (result) => {
    if (result.userPreferences) {
      userPreferences = { ...userPreferences, ...result.userPreferences };
      updateUIFromPreferences();
    }
  });
}

// Update UI based on loaded preferences
function updateUIFromPreferences() {
  // General settings
  setCheckboxValue('auto-start', userPreferences.general.autoStart);
  setCheckboxValue('show-panel', userPreferences.general.showPanel);
  setCheckboxValue('site-specific', userPreferences.general.siteSpecific);
  setCheckboxValue('local-processing', userPreferences.general.localProcessing);
  setCheckboxValue('usage-stats', userPreferences.general.usageStats);
  
  // TTS settings
  setSelectValue('voice-select', userPreferences.tts.voice);
  setRangeValue('rate-range', userPreferences.tts.rate);
  setRangeValue('pitch-range', userPreferences.tts.pitch);
  setRangeValue('volume-range', userPreferences.tts.volume);
  setCheckboxValue('auto-start-reading', userPreferences.tts.autoStartReading);
  setCheckboxValue('highlight-text', userPreferences.tts.highlightText);
  setMultiSelectValue('skip-elements', userPreferences.tts.skipElements);
  setCheckboxValue('language-detection', userPreferences.tts.languageDetection);
  
  // STT settings
  setSelectValue('language-select', userPreferences.stt.language);
  setCheckboxValue('continuous-recognition', userPreferences.stt.continuousRecognition);
  setNumberValue('recognition-timeout', userPreferences.stt.recognitionTimeout);
  setTextValue('trigger-phrase', userPreferences.stt.triggerPhrase);
  setCheckboxValue('command-feedback', userPreferences.stt.commandFeedback);
  
  // Visual settings
  setCheckboxValue('high-contrast-mode', userPreferences.visual.highContrastMode);
  setSelectValue('contrast-scheme', userPreferences.visual.contrastScheme);
  setRangeValue('font-size', userPreferences.visual.fontSize);
  setSelectValue('font-family', userPreferences.visual.fontFamily);
  setRangeValue('line-spacing', userPreferences.visual.lineSpacing);
  setRangeValue('letter-spacing', userPreferences.visual.letterSpacing);
  setCheckboxValue('image-descriptions', userPreferences.visual.imageDescriptions);
  
  // Update custom colors
  document.getElementById('text-color').value = userPreferences.visual.customColors.textColor;
  document.getElementById('bg-color').value = userPreferences.visual.customColors.backgroundColor;
  document.getElementById('link-color').value = userPreferences.visual.customColors.linkColor;
  
  // Show/hide custom colors section based on contrast scheme
  toggleCustomColorsVisibility();
  
  // Cognitive settings
  setCheckboxValue('simplify-page', userPreferences.cognitive.simplifyPage);
  setCheckboxValue('highlight-links', userPreferences.cognitive.highlightLinks);
  setCheckboxValue('reading-guide', userPreferences.cognitive.readingGuide);
  setCheckboxValue('focus-mode', userPreferences.cognitive.focusMode);
  setSelectValue('simplification-level', userPreferences.cognitive.simplificationLevel || 'moderate');
  setCheckboxValue('dictionary-lookup', userPreferences.cognitive.dictionaryLookup);
  setCheckboxValue('distraction-reduction', userPreferences.cognitive.distractionReduction);
  setCheckboxValue('reading-mask', userPreferences.cognitive.readingMask);
  setNumberValue('focus-timeout', userPreferences.cognitive.focusTimeout || 25);
  setCheckboxValue('auto-bookmarking', userPreferences.cognitive.autoBookmarking);
  setCheckboxValue('note-taking', userPreferences.cognitive.noteTaking);
  
  // Video settings
  setCheckboxValue('auto-caption', userPreferences.video.automaticCaptions);
  setRangeValue('caption-font-size', userPreferences.video.captionSize || 100);
  setCheckboxValue('caption-background', userPreferences.video.captionBackground);
  setCheckboxValue('custom-video-controls', userPreferences.video.customControls);
  setRangeValue('playback-rate', userPreferences.video.playbackRate);
  setRangeValue('video-brightness', userPreferences.video.brightness || 100);
  setRangeValue('video-contrast', userPreferences.video.contrast || 100);
  setCheckboxValue('reduce-motion', userPreferences.video.reduceMotion);
  
  // User profiles
  updateProfilesDropdown();
  updateProfileFields();
}

// Set up tab navigation
function setupTabNavigation() {
  const navLinks = document.querySelectorAll('.options-nav a');
  const panels = document.querySelectorAll('.options-panel');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and panels
      navLinks.forEach(l => l.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked link and corresponding panel
      link.classList.add('active');
      const targetPanel = document.querySelector(link.getAttribute('href'));
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// Set up form controls
function setupFormControls() {
  // General settings
  setupCheckbox('auto-start', value => {
    userPreferences.general.autoStart = value;
    savePreferences();
  });
  
  setupCheckbox('show-panel', value => {
    userPreferences.general.showPanel = value;
    savePreferences();
  });
  
  setupCheckbox('site-specific', value => {
    userPreferences.general.siteSpecific = value;
    savePreferences();
  });
  
  setupCheckbox('local-processing', value => {
    userPreferences.general.localProcessing = value;
    savePreferences();
  });
  
  setupCheckbox('usage-stats', value => {
    userPreferences.general.usageStats = value;
    savePreferences();
  });
  
  // TTS settings
  setupSelect('voice-select', value => {
    userPreferences.tts.voice = value;
    savePreferences();
  });
  
  setupRange('rate-range', value => {
    userPreferences.tts.rate = parseFloat(value);
    savePreferences();
  });
  
  setupRange('pitch-range', value => {
    userPreferences.tts.pitch = parseFloat(value);
    savePreferences();
  });
  
  setupRange('volume-range', value => {
    userPreferences.tts.volume = parseFloat(value);
    savePreferences();
  });
  
  setupCheckbox('auto-start-reading', value => {
    userPreferences.tts.autoStartReading = value;
    savePreferences();
  });
  
  setupCheckbox('highlight-text', value => {
    userPreferences.tts.highlightText = value;
    savePreferences();
  });
  
  setupMultiSelect('skip-elements', values => {
    userPreferences.tts.skipElements = values;
    savePreferences();
  });
  
  setupCheckbox('language-detection', value => {
    userPreferences.tts.languageDetection = value;
    savePreferences();
  });
  
  // STT settings
  setupSelect('language-select', value => {
    userPreferences.stt.language = value;
    savePreferences();
  });
  
  setupCheckbox('continuous-recognition', value => {
    userPreferences.stt.continuousRecognition = value;
    savePreferences();
  });
  
  setupNumber('recognition-timeout', value => {
    userPreferences.stt.recognitionTimeout = parseInt(value, 10);
    savePreferences();
  });
  
  setupText('trigger-phrase', value => {
    userPreferences.stt.triggerPhrase = value;
    savePreferences();
  });
  
  setupCheckbox('command-feedback', value => {
    userPreferences.stt.commandFeedback = value;
    savePreferences();
  });
  
  // Visual settings
  setupCheckbox('high-contrast-mode', value => {
    userPreferences.visual.highContrastMode = value;
    savePreferences();
  });
  
  setupSelect('contrast-scheme', value => {
    userPreferences.visual.contrastScheme = value;
    toggleCustomColorsVisibility();
    savePreferences();
  });
  
  setupRange('font-size', value => {
    userPreferences.visual.fontSize = parseInt(value, 10);
    savePreferences();
  });
  
  setupSelect('font-family', value => {
    userPreferences.visual.fontFamily = value;
    savePreferences();
  });
  
  setupRange('line-spacing', value => {
    userPreferences.visual.lineSpacing = parseFloat(value);
    savePreferences();
  });
  
  setupRange('letter-spacing', value => {
    userPreferences.visual.letterSpacing = parseFloat(value);
    savePreferences();
  });
  
  setupCheckbox('image-descriptions', value => {
    userPreferences.visual.imageDescriptions = value;
    savePreferences();
  });
  
  // Custom colors
  setupColorPicker('text-color', value => {
    userPreferences.visual.customColors.textColor = value;
    savePreferences();
  });
  
  setupColorPicker('bg-color', value => {
    userPreferences.visual.customColors.backgroundColor = value;
    savePreferences();
  });
  
  setupColorPicker('link-color', value => {
    userPreferences.visual.customColors.linkColor = value;
    savePreferences();
  });
  
  // Cognitive settings
  setupCheckbox('simplify-page', value => {
    userPreferences.cognitive.simplifyPage = value;
    savePreferences();
  });
  
  setupCheckbox('highlight-links', value => {
    userPreferences.cognitive.highlightLinks = value;
    savePreferences();
  });
  
  setupCheckbox('reading-guide', value => {
    userPreferences.cognitive.readingGuide = value;
    savePreferences();
  });
  
  setupCheckbox('focus-mode', value => {
    userPreferences.cognitive.focusMode = value;
    savePreferences();
  });
  
  setupSelect('simplification-level', value => {
    userPreferences.cognitive.simplificationLevel = value;
    savePreferences();
  });
  
  setupCheckbox('dictionary-lookup', value => {
    userPreferences.cognitive.dictionaryLookup = value;
    savePreferences();
  });
  
  setupCheckbox('distraction-reduction', value => {
    userPreferences.cognitive.distractionReduction = value;
    savePreferences();
  });
  
  setupCheckbox('reading-mask', value => {
    userPreferences.cognitive.readingMask = value;
    savePreferences();
  });
  
  setupNumber('focus-timeout', value => {
    userPreferences.cognitive.focusTimeout = parseInt(value, 10);
    savePreferences();
  });
  
  setupCheckbox('auto-bookmarking', value => {
    userPreferences.cognitive.autoBookmarking = value;
    savePreferences();
  });
  
  setupCheckbox('note-taking', value => {
    userPreferences.cognitive.noteTaking = value;
    savePreferences();
  });
  
  // Video settings
  setupCheckbox('auto-caption', value => {
    userPreferences.video.automaticCaptions = value;
    savePreferences();
  });
  
  setupRange('caption-font-size', value => {
    userPreferences.video.captionSize = parseInt(value, 10);
    savePreferences();
  });
  
  setupCheckbox('caption-background', value => {
    userPreferences.video.captionBackground = value;
    savePreferences();
  });
  
  setupCheckbox('custom-video-controls', value => {
    userPreferences.video.customControls = value;
    savePreferences();
  });
  
  setupRange('playback-rate', value => {
    userPreferences.video.playbackRate = parseFloat(value);
    savePreferences();
  });
  
  setupRange('video-brightness', value => {
    userPreferences.video.brightness = parseInt(value, 10);
    savePreferences();
  });
  
  setupRange('video-contrast', value => {
    userPreferences.video.contrast = parseInt(value, 10);
    savePreferences();
  });
  
  setupCheckbox('reduce-motion', value => {
    userPreferences.video.reduceMotion = value;
    savePreferences();
  });
  
  // User profiles
  setupSelect('active-profile', value => {
    userPreferences.profiles.active = value;
    loadProfileSettings(value);
    savePreferences();
  });
  
  setupText('profile-name', value => {
    if (userPreferences.profiles.active && userPreferences.profiles.profiles[userPreferences.profiles.active]) {
      userPreferences.profiles.profiles[userPreferences.profiles.active].name = value;
      savePreferences();
    }
  });
  
  setupText('profile-description', value => {
    if (userPreferences.profiles.active && userPreferences.profiles.profiles[userPreferences.profiles.active]) {
      userPreferences.profiles.profiles[userPreferences.profiles.active].description = value;
      savePreferences();
    }
  });
  
  // Set up profile buttons
  const newProfileButton = document.getElementById('new-profile');
  if (newProfileButton) {
    newProfileButton.addEventListener('click', () => {
      const profileId = 'profile_' + Date.now();
      userPreferences.profiles.profiles[profileId] = {
        name: 'New Profile',
        description: ''
      };
      userPreferences.profiles.active = profileId;
      savePreferences();
      updateProfilesDropdown();
      updateProfileFields();
    });
  }
  
  const deleteProfileButton = document.getElementById('delete-profile');
  if (deleteProfileButton) {
    deleteProfileButton.addEventListener('click', () => {
      const activeProfile = userPreferences.profiles.active;
      if (activeProfile === 'default') {
        alert('Cannot delete the default profile.');
        return;
      }
      
      if (confirm('Are you sure you want to delete this profile?')) {
        delete userPreferences.profiles.profiles[activeProfile];
        userPreferences.profiles.active = 'default';
        savePreferences();
        updateProfilesDropdown();
        updateProfileFields();
      }
    });
  }
  
  // Custom shortcuts button
  const customShortcutsButton = document.getElementById('custom-shortcuts');
  if (customShortcutsButton) {
    customShortcutsButton.addEventListener('click', openShortcutsEditor);
  }
  
  // Populate TTS voices
  populateTTSVoices();
}

// Set up data management (import/export/reset)
function setupDataManagement() {
  // Export settings
  const exportButton = document.getElementById('export-settings');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      const dataStr = JSON.stringify(userPreferences, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'accessibility-settings.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    });
  }
  
  // Import settings
  const importButton = document.getElementById('import-settings');
  if (importButton) {
    importButton.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
          try {
            const importedPreferences = JSON.parse(event.target.result);
            userPreferences = { ...userPreferences, ...importedPreferences };
            savePreferences();
            updateUIFromPreferences();
            alert('Settings imported successfully!');
          } catch (error) {
            alert('Error importing settings: ' + error.message);
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    });
  }
  
  // Reset settings
  const resetButton = document.getElementById('reset-settings');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all settings to their default values?')) {
        // Reset to default preferences
        chrome.storage.local.remove('userPreferences', () => {
          // Reload the page to reset all UI elements
          window.location.reload();
        });
      }
    });
  }
}

// Save preferences to storage
function savePreferences() {
  chrome.storage.local.set({ userPreferences: userPreferences }, () => {
    // Notify background script about the change
    chrome.runtime.sendMessage({
      action: 'updatePreferences',
      preferences: userPreferences
    });
  });
}

// Helper function to populate TTS voices
function populateTTSVoices() {
  const voiceSelect = document.getElementById('voice-select');
  if (!voiceSelect) return;
  
  // Clear existing options except the default
  while (voiceSelect.options.length > 1) {
    voiceSelect.remove(1);
  }
  
  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // If voices aren't loaded yet, wait for them
    window.speechSynthesis.onvoiceschanged = () => {
      populateTTSVoices();
    };
    return;
  }
  
  // Add voices to select
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
  
  // Set selected voice if saved
  if (userPreferences.tts.voice !== 'default') {
    setSelectValue('voice-select', userPreferences.tts.voice);
  }
}

// Helper function to toggle custom colors visibility
function toggleCustomColorsVisibility() {
  const customColorsContainer = document.getElementById('custom-colors');
  if (customColorsContainer) {
    customColorsContainer.style.display = 
      document.getElementById('contrast-scheme').value === 'custom' ? 'flex' : 'none';
  }
}

// Function to update the profiles dropdown
function updateProfilesDropdown() {
  const profileSelect = document.getElementById('active-profile');
  if (!profileSelect) return;
  
  // Clear existing options
  while (profileSelect.options.length > 0) {
    profileSelect.remove(0);
  }
  
  // Add profiles to select
  Object.keys(userPreferences.profiles.profiles).forEach(profileId => {
    const profile = userPreferences.profiles.profiles[profileId];
    const option = document.createElement('option');
    option.value = profileId;
    option.textContent = profile.name;
    profileSelect.appendChild(option);
  });
  
  // Set selected profile
  profileSelect.value = userPreferences.profiles.active;
}

// Function to update profile fields
function updateProfileFields() {
  const activeProfile = userPreferences.profiles.active;
  const profile = userPreferences.profiles.profiles[activeProfile];
  
  if (profile) {
    setTextValue('profile-name', profile.name);
    setTextValue('profile-description', profile.description);
  }
}

// Function to load settings from a specific profile
function loadProfileSettings(profileId) {
  // This would be implemented to switch between different profiles
  // For now, we just update the UI fields
  updateProfileFields();
}

// Function to open the shortcuts editor
function openShortcutsEditor() {
  alert('Custom shortcuts editor would open here. This feature is coming soon!');
  // This would open a modal dialog to edit custom shortcuts
}

// Helper functions for setting up form controls
function setupCheckbox(id, onChange) {
  const checkbox = document.getElementById(id);
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      onChange(checkbox.checked);
    });
  }
}

function setupSelect(id, onChange) {
  const select = document.getElementById(id);
  if (select) {
    select.addEventListener('change', () => {
      onChange(select.value);
    });
  }
}

function setupMultiSelect(id, onChange) {
  const select = document.getElementById(id);
  if (select) {
    select.addEventListener('change', () => {
      const selectedValues = Array.from(select.selectedOptions).map(option => option.value);
      onChange(selectedValues);
    });
  }
}

function setupRange(id, onChange) {
  const range = document.getElementById(id);
  if (range) {
    const valueDisplay = range.parentElement.querySelector('.range-value');
    
    range.addEventListener('input', () => {
      if (valueDisplay) {
        // Update display value
        let displayValue = range.value;
        if (id === 'font-size') {
          displayValue += '%';
        } else if (id === 'letter-spacing') {
          displayValue += 'px';
        }
        valueDisplay.textContent = displayValue;
      }
      
      onChange(range.value);
    });
  }
}

function setupNumber(id, onChange) {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('change', () => {
      onChange(input.value);
    });
  }
}

function setupText(id, onChange) {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('change', () => {
      onChange(input.value);
    });
  }
}

function setupColorPicker(id, onChange) {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('change', () => {
      onChange(input.value);
    });
  }
}

// Helper functions for setting form values
function setCheckboxValue(id, value) {
  const checkbox = document.getElementById(id);
  if (checkbox) {
    checkbox.checked = value;
  }
}

function setSelectValue(id, value) {
  const select = document.getElementById(id);
  if (select) {
    select.value = value;
  }
}

function setMultiSelectValue(id, values) {
  const select = document.getElementById(id);
  if (select) {
    Array.from(select.options).forEach(option => {
      option.selected = values.includes(option.value);
    });
  }
}

function setRangeValue(id, value) {
  const range = document.getElementById(id);
  if (range) {
    range.value = value;
    
    // Update display value
    const valueDisplay = range.parentElement.querySelector('.range-value');
    if (valueDisplay) {
      let displayValue = value;
      if (id === 'font-size') {
        displayValue += '%';
      } else if (id === 'letter-spacing') {
        displayValue += 'px';
      }
      valueDisplay.textContent = displayValue;
    }
  }
}

function setNumberValue(id, value) {
  const input = document.getElementById(id);
  if (input) {
    input.value = value;
  }
}

function setTextValue(id, value) {
  const input = document.getElementById(id);
  if (input) {
    input.value = value;
  }
}