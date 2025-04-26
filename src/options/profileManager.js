/**
 * Profile Manager Component for Options Page
 * 
 * Provides UI for managing accessibility profiles including:
 * - Creating new profiles
 * - Editing existing profiles
 * - Switching between profiles
 * - Importing/Exporting profiles
 */

// Profile list container element
let profileList = null;

// Initialize profile manager UI
export function initializeProfileManager() {
  // Create profile manager section
  const section = document.createElement('section');
  section.id = 'profile-manager';
  section.innerHTML = `
    <h2>Profile Management</h2>
    
    <div class="profile-actions">
      <button id="create-profile" class="primary-button">
        Create New Profile
      </button>
      <button id="import-profile" class="secondary-button">
        Import Profiles
      </button>
      <button id="export-profile" class="secondary-button">
        Export Profiles
      </button>
    </div>
    
    <div id="profile-list" class="profile-list">
      <!-- Profiles will be inserted here -->
    </div>
    
    <!-- Profile creation/edit modal -->
    <div id="profile-modal" class="modal" hidden>
      <div class="modal-content">
        <h3 id="modal-title">Create New Profile</h3>
        <form id="profile-form">
          <div class="form-group">
            <label for="profile-name">Profile Name</label>
            <input type="text" id="profile-name" required>
          </div>
          
          <div class="form-group">
            <label>Features</label>
            <div class="feature-toggles">
              <label class="toggle">
                <input type="checkbox" name="tts"> Text-to-Speech
              </label>
              <label class="toggle">
                <input type="checkbox" name="stt"> Speech-to-Text
              </label>
              <label class="toggle">
                <input type="checkbox" name="visualAssistance"> Visual Assistance
              </label>
              <label class="toggle">
                <input type="checkbox" name="imageDescription"> Image Descriptions
              </label>
              <label class="toggle">
                <input type="checkbox" name="readingAssistance"> Reading Assistance
              </label>
              <label class="toggle">
                <input type="checkbox" name="focusManagement"> Focus Management
              </label>
              <label class="toggle">
                <input type="checkbox" name="cognitiveSupport"> Cognitive Support
              </label>
              <label class="toggle">
                <input type="checkbox" name="videoAccessibility"> Video Accessibility
              </label>
              <label class="toggle">
                <input type="checkbox" name="crossDisabilitySupport"> Cross-Disability Support
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Preferences</label>
            <!-- TTS Preferences -->
            <div class="preference-section">
              <h4>Text-to-Speech</h4>
              <div class="preference-controls">
                <label>Rate
                  <input type="range" name="tts.rate" min="0.5" max="2" step="0.1" value="1">
                </label>
                <label>Pitch
                  <input type="range" name="tts.pitch" min="0.5" max="2" step="0.1" value="1">
                </label>
                <label>Volume
                  <input type="range" name="tts.volume" min="0" max="1" step="0.1" value="1">
                </label>
              </div>
            </div>
            
            <!-- Visual Preferences -->
            <div class="preference-section">
              <h4>Visual</h4>
              <div class="preference-controls">
                <label class="toggle">
                  <input type="checkbox" name="visual.highContrast"> High Contrast
                </label>
                <label>Font Size
                  <select name="visual.fontSize">
                    <option value="14px">Small</option>
                    <option value="16px">Medium</option>
                    <option value="18px">Large</option>
                    <option value="20px">Extra Large</option>
                  </select>
                </label>
                <label>Font Family
                  <select name="visual.fontFamily">
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                    <option value="OpenDyslexic, sans-serif">OpenDyslexic</option>
                  </select>
                </label>
              </div>
            </div>
            
            <!-- Video Preferences -->
            <div class="preference-section">
              <h4>Video</h4>
              <div class="preference-controls">
                <label class="toggle">
                  <input type="checkbox" name="video.customControls"> Custom Controls
                </label>
                <label class="toggle">
                  <input type="checkbox" name="video.captions"> Always Show Captions
                </label>
                <label class="toggle">
                  <input type="checkbox" name="video.audioDescription"> Audio Descriptions
                </label>
              </div>
            </div>
            
            <!-- Cognitive Preferences -->
            <div class="preference-section">
              <h4>Cognitive Support</h4>
              <div class="preference-controls">
                <label class="toggle">
                  <input type="checkbox" name="cognitive.simplifiedView"> Simplified View
                </label>
                <label class="toggle">
                  <input type="checkbox" name="cognitive.readingGuide"> Reading Guide
                </label>
                <label class="toggle">
                  <input type="checkbox" name="cognitive.focusMode"> Focus Mode
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="primary-button">Save Profile</button>
            <button type="button" class="secondary-button" id="cancel-profile">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add to options page
  document.querySelector('#options-container').appendChild(section);
  
  // Store references
  profileList = document.querySelector('#profile-list');
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial profiles
  loadProfiles();
}

// Set up event listeners for profile management
function setupEventListeners() {
  // Create profile button
  document.querySelector('#create-profile').addEventListener('click', () => {
    showProfileModal();
  });
  
  // Import profiles button
  document.querySelector('#import-profile').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = handleProfileImport;
    input.click();
  });
  
  // Export profiles button
  document.querySelector('#export-profile').addEventListener('click', exportProfiles);
  
  // Profile form submission
  document.querySelector('#profile-form').addEventListener('submit', handleProfileSubmit);
  
  // Cancel button
  document.querySelector('#cancel-profile').addEventListener('click', () => {
    document.querySelector('#profile-modal').hidden = true;
  });
}

// Load and display profiles
async function loadProfiles() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getState' });
    const { activeProfile, profiles } = response.state;
    
    // Clear existing profiles
    profileList.innerHTML = '';
    
    // Create profile cards
    profiles.forEach(profile => {
      const card = createProfileCard(profile, profile.id === activeProfile.id);
      profileList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading profiles:', error);
    showError('Failed to load profiles');
  }
}

// Create a profile card element
function createProfileCard(profile, isActive) {
  const card = document.createElement('div');
  card.className = `profile-card ${isActive ? 'active' : ''}`;
  card.dataset.profileId = profile.id;
  
  card.innerHTML = `
    <div class="profile-header">
      <h3>${profile.name}</h3>
      ${isActive ? '<span class="active-badge">Active</span>' : ''}
    </div>
    <div class="profile-info">
      <p>Last modified: ${new Date(profile.lastModified).toLocaleDateString()}</p>
      <p>${Object.entries(profile.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature)
        .join(', ')}</p>
    </div>
    <div class="profile-actions">
      ${!isActive ? `
        <button class="switch-profile" title="Switch to this profile">
          Activate
        </button>
      ` : ''}
      ${profile.id !== 'default' ? `
        <button class="edit-profile" title="Edit profile">
          Edit
        </button>
        <button class="delete-profile" title="Delete profile">
          Delete
        </button>
      ` : ''}
    </div>
  `;
  
  // Add event listeners
  const switchBtn = card.querySelector('.switch-profile');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => switchProfile(profile.id));
  }
  
  const editBtn = card.querySelector('.edit-profile');
  if (editBtn) {
    editBtn.addEventListener('click', () => showProfileModal(profile));
  }
  
  const deleteBtn = card.querySelector('.delete-profile');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => deleteProfile(profile.id));
  }
  
  return card;
}

// Show profile creation/edit modal
function showProfileModal(profile = null) {
  const modal = document.querySelector('#profile-modal');
  const form = document.querySelector('#profile-form');
  const title = document.querySelector('#modal-title');
  
  // Set modal title
  title.textContent = profile ? 'Edit Profile' : 'Create New Profile';
  
  // Reset form
  form.reset();
  
  // Fill form if editing
  if (profile) {
    form.dataset.profileId = profile.id;
    document.querySelector('#profile-name').value = profile.name;
    
    // Set feature toggles
    Object.entries(profile.features).forEach(([feature, enabled]) => {
      const toggle = form.querySelector(`[name="${feature}"]`);
      if (toggle) toggle.checked = enabled;
    });
    
    // Set preferences
    Object.entries(profile.preferences).forEach(([category, prefs]) => {
      Object.entries(prefs).forEach(([key, value]) => {
        const input = form.querySelector(`[name="${category}.${key}"]`);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = value;
          } else {
            input.value = value;
          }
        }
      });
    });
  }
  
  // Show modal
  modal.hidden = false;
}

// Handle profile form submission
async function handleProfileSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const profileId = form.dataset.profileId;
  
  // Build profile data
  const profileData = {
    name: formData.get('profile-name'),
    features: {},
    preferences: {
      tts: {},
      visual: {},
      video: {},
      cognitive: {}
    }
  };
  
  // Process form data
  for (const [key, value] of formData.entries()) {
    if (key.includes('.')) {
      // Handle preferences
      const [category, setting] = key.split('.');
      profileData.preferences[category][setting] = value;
    } else {
      // Handle features
      profileData.features[key] = true;
    }
  }
  
  try {
    if (profileId) {
      // Update existing profile
      await chrome.runtime.sendMessage({
        action: 'updateProfile',
        profileId,
        updates: profileData
      });
    } else {
      // Create new profile
      await chrome.runtime.sendMessage({
        action: 'createProfile',
        name: profileData.name,
        baseProfile: profileData
      });
    }
    
    // Reload profiles and hide modal
    await loadProfiles();
    document.querySelector('#profile-modal').hidden = true;
  } catch (error) {
    console.error('Error saving profile:', error);
    showError('Failed to save profile');
  }
}

// Switch to a different profile
async function switchProfile(profileId) {
  try {
    await chrome.runtime.sendMessage({
      action: 'switchProfile',
      profileId
    });
    
    // Reload profiles to update UI
    await loadProfiles();
  } catch (error) {
    console.error('Error switching profile:', error);
    showError('Failed to switch profile');
  }
}

// Delete a profile
async function deleteProfile(profileId) {
  if (!confirm('Are you sure you want to delete this profile?')) {
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({
      action: 'deleteProfile',
      profileId
    });
    
    // Reload profiles
    await loadProfiles();
  } catch (error) {
    console.error('Error deleting profile:', error);
    showError('Failed to delete profile');
  }
}

// Handle profile import
async function handleProfileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      await chrome.runtime.sendMessage({
        action: 'importProfiles',
        data: e.target.result
      });
      
      // Reload profiles
      await loadProfiles();
    } catch (error) {
      console.error('Error importing profiles:', error);
      showError('Failed to import profiles');
    }
  };
  reader.readAsText(file);
}

// Export profiles
async function exportProfiles() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'exportProfiles' });
    if (response.success) {
      // Create and download file
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'accessibility-profiles.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting profiles:', error);
    showError('Failed to export profiles');
  }
}

// Show error message
function showError(message) {
  // Implement error display logic
  alert(message);
}