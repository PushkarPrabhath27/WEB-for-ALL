/**
 * Control Panel Implementation for Multimodal Accessibility Extension
 * 
 * This file contains the implementation of the floating control panel and
 * related functionality for the accessibility extension.
 */

// Import from main content script
import { startTTS, pauseTTS, stopTTS, startSTT, stopSTT } from './index.js';

// Control panel state
let panelState = {
  isMinimized: false,
  isDragging: false,
  dragOffset: { x: 0, y: 0 }
};

// Reference to the control panel element
let controlPanel = null;

+// Helper function to create SVG icons
+function createIcon(svgString, classes = []) {
+  const span = document.createElement('span');
+  span.innerHTML = svgString;
+  span.classList.add('icon', ...classes);
+  span.setAttribute('aria-hidden', 'true');
+  return span;
+}
+
// Create floating control panel
export function createControlPanel() {
  if (document.getElementById('accessibility-extension-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'accessibility-extension-panel';
- panel.className = 'accessibility-extension-panel modern-ui';
+ panel.className = 'accessibility-extension-panel modern-ui card'; // Added card class
+ panel.setAttribute('role', 'dialog');
+ panel.setAttribute('aria-labelledby', 'accessibility-panel-title');

  // Panel header with icon and title
  const header = document.createElement('div');
  header.className = 'accessibility-extension-panel-header';

- const icon = document.createElement('span');
- icon.className = 'accessibility-panel-main-icon';
- icon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>';
+ const headerIcon = createIcon('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>', ['header-icon']);

  const title = document.createElement('h2');
- title.className = 'accessibility-extension-panel-title';
+ title.id = 'accessibility-panel-title'; // Use ID for aria-labelledby
+ title.className = 'accessibility-panel-title';
  title.textContent = 'Accessibility Tools';

  const controls = document.createElement('div');
  controls.className = 'accessibility-extension-panel-controls';

  const minimizeButton = document.createElement('button');
- minimizeButton.className = 'accessibility-extension-panel-button';
+ minimizeButton.className = 'panel-control-button minimize-button';
  minimizeButton.title = 'Minimize Panel';
+ minimizeButton.setAttribute('aria-label', 'Minimize Panel');
  minimizeButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  minimizeButton.addEventListener('click', togglePanelMinimize);

  const closeButton = document.createElement('button');
- closeButton.className = 'accessibility-extension-panel-button';
+ closeButton.className = 'panel-control-button close-button';
  closeButton.title = 'Close Panel';
+ closeButton.setAttribute('aria-label', 'Close Panel');
  closeButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeButton.addEventListener('click', hideControlPanel);

  controls.appendChild(minimizeButton);
  controls.appendChild(closeButton);

- header.appendChild(icon);
+ header.appendChild(headerIcon);
  header.appendChild(title);
  header.appendChild(controls);
  header.addEventListener('mousedown', startDragging);

  // Panel content
  const content = document.createElement('div');
  content.className = 'accessibility-extension-panel-content';

  // Helper for section divider
  function sectionDivider() {
    const divider = document.createElement('hr');
    divider.className = 'accessibility-panel-divider';
    return divider;
  }

  // TTS Section
  const ttsSection = createPanelSection('Text-to-Speech', [
    createFeatureToggle('TTS', 'tts', null, 'Enable text-to-speech for reading content aloud.'),
    createTTSControls()
  ], 'volume-up');

  // STT Section
  const sttSection = createPanelSection('Speech-to-Text', [
    createFeatureToggle('Voice Commands', 'stt', null, 'Control extension with your voice.'),
    createSTTControls()
  ], 'mic');

  // Visual Assistance Section
  const visualSection = createPanelSection('Visual Assistance', [
    createFeatureToggle('High Contrast', 'highContrast', toggleHighContrast, 'Improve contrast for readability.'),
    createFeatureToggle('Font Adjustments', 'fontAdjustments', toggleFontAdjustments, 'Adjust font size and style.'),
    createFeatureToggle('Focus Highlighting', 'focusHighlight', toggleFocusHighlight, 'Highlight focused elements.')
  ], 'eye');

  // Image Description Section
  const imageSection = createPanelSection('Image Assistance', [
    createFeatureToggle('Auto Image Description', 'imageDescription', null, 'Automatically describe images.'),
    createImageDescriptionControls()
  ], 'image');

  // Reading Assistance Section
  const readingSection = createPanelSection('Reading Assistance', [
    createFeatureToggle('Reading Mode', 'readingAssistance', null, 'Simplify page for easier reading.'),
    createFeatureToggle('Focus Management', 'focusManagement', null, 'Assist with focus navigation.')
  ], 'book');

  // Keyboard Shortcuts Info
  const shortcutsSection = document.createElement('div');
- shortcutsSection.className = 'accessibility-extension-shortcuts';
+ shortcutsSection.className = 'accessibility-panel-section accessibility-extension-shortcuts';
+ shortcutsSection.setAttribute('aria-labelledby', 'shortcuts-heading');
  shortcutsSection.innerHTML = `
-   <h3 class="accessibility-extension-panel-section-title">Keyboard Shortcuts</h3>
+   <h3 id="shortcuts-heading" class="accessibility-panel-section-title">Keyboard Shortcuts</h3>
    <ul class="accessibility-extension-shortcuts-list">
      <li><b>Alt+Shift+P</b>: Toggle Panel</li>
      <li><b>Alt+Shift+R</b>: Start/Stop Reading</li>
      <li><b>Alt+Shift+V</b>: Start/Stop Voice Commands</li>
    </ul>
  `;

  // Add sections to content with dividers
  content.appendChild(ttsSection);
  content.appendChild(sectionDivider());
  content.appendChild(sttSection);
  content.appendChild(sectionDivider());
  content.appendChild(visualSection);
  content.appendChild(sectionDivider());
  content.appendChild(imageSection);
  content.appendChild(sectionDivider());
  content.appendChild(readingSection);
  content.appendChild(sectionDivider());
  content.appendChild(shortcutsSection);

  panel.appendChild(header);
  panel.appendChild(content);
  document.body.appendChild(panel);
  controlPanel = panel;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDragging);
}

-// Enhanced createPanelSection with icon
-function createPanelSection(title, elements, iconName) {
+// Enhanced createPanelSection with ID, title, icon, and ARIA attributes
+function createPanelSection(id, title, elements, iconName) {
  const section = document.createElement('div');
- section.className = 'accessibility-extension-panel-section card';
+ section.id = id;
+ section.className = 'accessibility-panel-section';
+ section.setAttribute('role', 'group');
+ section.setAttribute('aria-labelledby', `${id}-heading`);
+
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'accessibility-panel-section-header';
  if (iconName) {
    const icon = document.createElement('span');
    icon.className = 'accessibility-panel-section-icon';
    icon.innerHTML = getSectionIcon(iconName);
    sectionHeader.appendChild(icon);
  }
  const sectionTitle = document.createElement('h3');
- sectionTitle.className = 'accessibility-extension-panel-section-title';
+ sectionTitle.id = `${id}-heading`;
+ sectionTitle.className = 'accessibility-panel-section-title';
  sectionTitle.textContent = title;
  sectionHeader.appendChild(sectionTitle);
  section.appendChild(sectionHeader);
  elements.forEach(element => section.appendChild(element));
  return section;
}

// Helper for section icons
function getSectionIcon(name) {
  switch(name) {
    case 'volume-up': return '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    case 'mic': return '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
-   case 'eye': return '<svg width="20" height="20" fill="none" stroke="#4285F4" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
-   case 'image': return '<svg width="20" height="20" fill="none" stroke="#4285F4" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
-   case 'book': return '<svg width="20" height="20" fill="none" stroke="#4285F4" stroke-width="2" viewBox="0 0 24 24"><path d="M2 7v13a2 2 0 0 0 2 2h14"/><path d="M22 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>';
+   case 'eye': return '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
+   case 'image': return '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
+   case 'book': return '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 7v13a2 2 0 0 0 2 2h14"/><path d="M22 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>';
    default: return '';
  }
}

-// Enhanced feature toggle with tooltip
-function createFeatureToggle(label, featureKey, onChange, tooltip) {
+// Enhanced feature toggle with ID, tooltip, and ARIA attributes
+function createFeatureToggle(id, label, featureKey, onChange, tooltip) {
  const row = document.createElement('div');
- row.className = 'accessibility-extension-panel-row';
+ row.className = 'accessibility-panel-row feature-toggle-row';
  const labelElement = document.createElement('span');
- labelElement.className = 'accessibility-extension-panel-label';
+ labelElement.className = 'accessibility-panel-label';
  labelElement.textContent = label;
+ labelElement.id = `${id}-label`;
+
  const controlsWrapper = document.createElement('div');
+ controlsWrapper.className = 'feature-controls';
+
  if (tooltip) {
    const help = document.createElement('span');
-   help.className = 'accessibility-panel-tooltip';
-   help.innerHTML = '<svg width="16" height="16" fill="none" stroke="#5F6368" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
+   help.className = 'tooltip-icon';
+   help.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    help.title = tooltip;
-   labelElement.appendChild(help);
+   help.setAttribute('aria-label', tooltip);
+   controlsWrapper.appendChild(help); // Add tooltip next to the toggle
  }
+
  const toggle = document.createElement('label');
- toggle.className = 'accessibility-extension-toggle';
+ toggle.className = 'toggle-switch small'; // Use popup's toggle style
+ toggle.setAttribute('aria-labelledby', `${id}-label`);
+
  const input = document.createElement('input');
+ input.id = id;
  input.type = 'checkbox';
  input.checked = getFeatureState(featureKey);
  input.addEventListener('change', (event) => {
    if (onChange) {
      onChange(event.target.checked);
    } else {
      updateFeatureState(featureKey, event.target.checked);
    }
  });
  const slider = document.createElement('span');
- slider.className = 'accessibility-extension-toggle-slider';
+ slider.className = 'slider round'; // Use popup's slider style
+ slider.setAttribute('aria-hidden', 'true');
+
  toggle.appendChild(input);
  toggle.appendChild(slider);
  row.appendChild(labelElement);
- row.appendChild(toggle);
+ controlsWrapper.appendChild(toggle);
+ row.appendChild(controlsWrapper);
  return row;
}

// Create TTS controls
function createTTSControls() {
  const controls = document.createElement('div');
  controls.className = 'accessibility-extension-tts-controls';
  
  const startButton = document.createElement('button');
  startButton.className = 'accessibility-extension-tts-button';
  startButton.textContent = 'Start';
  startButton.addEventListener('click', startTTS);
  
  const pauseButton = document.createElement('button');
  pauseButton.className = 'accessibility-extension-tts-button';
  pauseButton.textContent = 'Pause';
  pauseButton.addEventListener('click', pauseTTS);
  
  const stopButton = document.createElement('button');
  stopButton.className = 'accessibility-extension-tts-button';
  stopButton.textContent = 'Stop';
  stopButton.addEventListener('click', stopTTS);
  
  controls.appendChild(startButton);
  controls.appendChild(pauseButton);
  controls.appendChild(stopButton);
  
  return controls;
}

// Create STT controls
function createSTTControls() {
  const controls = document.createElement('div');
  controls.className = 'accessibility-extension-tts-controls';
  
  const startButton = document.createElement('button');
  startButton.className = 'accessibility-extension-tts-button';
  startButton.textContent = 'Start Listening';
  startButton.addEventListener('click', startSTT);
  
  const stopButton = document.createElement('button');
  stopButton.className = 'accessibility-extension-tts-button';
  stopButton.textContent = 'Stop Listening';
  stopButton.addEventListener('click', stopSTT);
  
  controls.appendChild(startButton);
  controls.appendChild(stopButton);
  
  return controls;
}

// Get feature state
function getFeatureState(featureKey) {
  switch (featureKey) {
    case 'tts':
      return extensionState.activeFeatures.tts;
    case 'stt':
      return extensionState.activeFeatures.stt;
    case 'highContrast':
      return visualState.highContrastEnabled;
    case 'fontAdjustments':
      return visualState.fontAdjustmentsEnabled;
    case 'focusHighlight':
      return visualState.focusHighlightEnabled;
    default:
      return false;
  }
}

// Update feature state
function updateFeatureState(featureKey, enabled) {
  switch (featureKey) {
    case 'tts':
    case 'stt':
      chrome.runtime.sendMessage({
        action: 'updateFeature',
        feature: featureKey,
        enabled: enabled
      });
      break;
    case 'highContrast':
      toggleHighContrast(enabled);
      break;
    case 'fontAdjustments':
      toggleFontAdjustments(enabled);
      break;
    case 'focusHighlight':
      toggleFocusHighlight(enabled);
      break;
  }
}

// Toggle high contrast mode
function toggleHighContrast(enabled) {
  visualState.highContrastEnabled = enabled;
  applyVisualEnhancements();
}

// Toggle font adjustments
function toggleFontAdjustments(enabled) {
  visualState.fontAdjustmentsEnabled = enabled;
  applyVisualEnhancements();
}

// Toggle focus highlighting
function toggleFocusHighlight(enabled) {
  visualState.focusHighlightEnabled = enabled;
  applyVisualEnhancements();
}

// Toggle panel minimize state
function togglePanelMinimize() {
  if (!controlPanel) return;
  
  panelState.isMinimized = !panelState.isMinimized;
  
  if (panelState.isMinimized) {
    controlPanel.classList.add('minimized');
  } else {
    controlPanel.classList.remove('minimized');
  }
}

// Hide control panel
export function hideControlPanel() {
  if (controlPanel) {
    controlPanel.style.display = 'none';
  }
}

// Show control panel
export function showControlPanel() {
  if (controlPanel) {
    controlPanel.style.display = 'block';
  } else {
    createControlPanel();
  }
}

// Update control panel state and UI
export function updateControlPanel(state) {
  if (!controlPanel) return;
  
  // Update feature toggles
  Object.entries(state.activeFeatures).forEach(([feature, enabled]) => {
    const toggle = controlPanel.querySelector(`#accessibility-${feature}-toggle`);
    if (toggle) {
      toggle.checked = enabled;
    }
  });
  
  // Update visual state
  const visualToggles = {
    'highContrast': state.visualState?.highContrastEnabled || false,
    'fontAdjustments': state.visualState?.fontAdjustmentsEnabled || false,
    'focusHighlight': state.visualState?.focusHighlightEnabled || false
  };
  
  Object.entries(visualToggles).forEach(([feature, enabled]) => {
    const toggle = controlPanel.querySelector(`#accessibility-${feature}-toggle`);
    if (toggle) {
      toggle.checked = enabled;
    }
  });
}

// Update visibility
controlPanel.style.display = extensionState.enabled ? 'block' : 'none';

// Update toggles
const toggles = controlPanel.querySelectorAll('input[type="checkbox"]');
toggles.forEach(toggle => {
  const row = toggle.closest('.accessibility-extension-panel-row');
  const label = row.querySelector('.accessibility-extension-panel-label').textContent;
  
  switch (label) {
    case 'TTS':
      toggle.checked = extensionState.activeFeatures.tts;
      break;
    case 'Voice Commands':
      toggle.checked = extensionState.activeFeatures.stt;
      break;
    case 'High Contrast':
      toggle.checked = visualState.highContrastEnabled;
      break;
    case 'Font Adjustments':
      toggle.checked = visualState.fontAdjustmentsEnabled;
      break;
    case 'Focus Highlighting':
      toggle.checked = visualState.focusHighlightEnabled;
      break;
  }
});

// Update TTS buttons based on reading state
const ttsButtons = controlPanel.querySelectorAll('.accessibility-extension-tts-controls button');
if (ttsButtons.length >= 3) {
  // Start button
  ttsButtons[0].disabled = ttsState.isReading;
  // Pause button
  ttsButtons[1].disabled = !ttsState.isReading;
  // Stop button
  ttsButtons[2].disabled = !ttsState.isReading;
}

// Update STT buttons based on listening state
const sttButtons = controlPanel.querySelectorAll('.accessibility-extension-tts-controls:nth-of-type(2) button');
if (sttButtons.length >= 2) {
  // Start button
  sttButtons[0].disabled = sttState.isListening;
  // Stop button
  sttButtons[1].disabled = !sttState.isListening;
}


// Dragging functionality
function startDragging(event) {
  if (!controlPanel) return;
  
  panelState.isDragging = true;
  
  const rect = controlPanel.getBoundingClientRect();
  panelState.dragOffset = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  
  // Prevent text selection during drag
  event.preventDefault();
}

function onDrag(event) {
  if (!panelState.isDragging || !controlPanel) return;
  
  const x = event.clientX - panelState.dragOffset.x;
  const y = event.clientY - panelState.dragOffset.y;
  
  // Keep panel within viewport bounds
  const maxX = window.innerWidth - controlPanel.offsetWidth;
  const maxY = window.innerHeight - controlPanel.offsetHeight;
  
  controlPanel.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
  controlPanel.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
  controlPanel.style.right = 'auto';
  controlPanel.style.bottom = 'auto';
}

function stopDragging() {
  panelState.isDragging = false;
}

// Create image description controls
function createImageDescriptionControls() {
  const controls = document.createElement('div');
  controls.className = 'accessibility-extension-image-controls';
  
  const refreshButton = document.createElement('button');
  refreshButton.className = 'accessibility-extension-tts-button';
  refreshButton.textContent = 'Refresh Descriptions';
  refreshButton.title = 'Scan page for images and generate descriptions';
  
  const statusText = document.createElement('div');
  statusText.className = 'accessibility-extension-status-text';
  statusText.style.fontSize = '12px';
  statusText.style.color = '#666';
  statusText.style.marginTop = '5px';
  statusText.textContent = 'Click to scan page for images without descriptions';
  
  refreshButton.addEventListener('click', async () => {
    refreshButton.disabled = true;
    refreshButton.textContent = 'Processing...';
    statusText.textContent = 'Scanning for images...';
    statusText.style.color = '#4285F4';
    
    try {
      const count = await processImages();
      refreshButton.disabled = false;
      refreshButton.textContent = 'Refresh Descriptions';
      
      if (count > 0) {
        statusText.textContent = `Processed ${count} image${count === 1 ? '' : 's'} successfully`;
        statusText.style.color = '#4CAF50';
      } else {
        statusText.textContent = 'No images found that need descriptions';
        statusText.style.color = '#666';
      }
    } catch (error) {
      console.error('Error processing images:', error);
      refreshButton.disabled = false;
      refreshButton.textContent = 'Refresh Descriptions';
      statusText.textContent = 'Error processing images. Please try again.';
      statusText.style.color = '#F44336';
    }
  });
  
  controls.appendChild(refreshButton);
  controls.appendChild(statusText);
  return controls;
}

// Keyboard shortcuts are now handled by the keyboardShortcuts module