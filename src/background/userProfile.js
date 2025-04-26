/**
 * User Profile Management Module
 * 
 * Handles user profile creation, storage, switching, and synchronization
 * for the Multimodal Accessibility Extension.
 */

// Default profile template
const DEFAULT_PROFILE = {
  id: 'default',
  name: 'Default Profile',
  features: {
    tts: true,
    stt: false,
    visualAssistance: true,
    imageDescription: true,
    readingAssistance: false,
    focusManagement: false,
    cognitiveSupport: false,
    videoAccessibility: false,
    crossDisabilitySupport: true
  },
  preferences: {
    tts: {
      voice: null,
      rate: 1,
      pitch: 1,
      volume: 1
    },
    visual: {
      highContrast: false,
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.5',
      colorFilters: 'none'
    },
    video: {
      customControls: true,
      captions: true,
      audioDescription: false,
      playbackRate: 1.0
    },
    cognitive: {
      simplifiedView: false,
      readingGuide: false,
      focusMode: false
    }
  },
  lastModified: Date.now()
};

// Profile management state
const profileState = {
  profiles: new Map(),
  activeProfileId: 'default',
  isLoading: false
};

/**
 * Initialize the profile management system
 */
export async function initializeProfiles() {
  profileState.isLoading = true;
  
  try {
    // Load profiles from storage
    const stored = await chrome.storage.local.get(['profiles', 'activeProfileId']);
    
    if (stored.profiles) {
      // Convert stored profiles back to Map
      profileState.profiles = new Map(Object.entries(stored.profiles));
    } else {
      // Create default profile if no profiles exist
      profileState.profiles.set('default', DEFAULT_PROFILE);
    }
    
    // Set active profile
    profileState.activeProfileId = stored.activeProfileId || 'default';
    
    // Ensure default profile exists
    if (!profileState.profiles.has('default')) {
      profileState.profiles.set('default', DEFAULT_PROFILE);
    }
    
    return getActiveProfile();
  } catch (error) {
    console.error('Error initializing profiles:', error);
    // Fallback to default profile
    profileState.profiles.set('default', DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  } finally {
    profileState.isLoading = false;
  }
}

/**
 * Get the currently active profile
 */
export function getActiveProfile() {
  return profileState.profiles.get(profileState.activeProfileId) || DEFAULT_PROFILE;
}

/**
 * Create a new profile
 */
export async function createProfile(name, baseProfile = null) {
  const id = generateProfileId();
  const profile = {
    ...DEFAULT_PROFILE,
    ...(baseProfile || {}),
    id,
    name,
    lastModified: Date.now()
  };
  
  profileState.profiles.set(id, profile);
  await saveProfiles();
  return profile;
}

/**
 * Update an existing profile
 */
export async function updateProfile(id, updates) {
  if (!profileState.profiles.has(id)) {
    throw new Error(`Profile ${id} not found`);
  }
  
  const profile = profileState.profiles.get(id);
  const updatedProfile = {
    ...profile,
    ...updates,
    lastModified: Date.now()
  };
  
  profileState.profiles.set(id, updatedProfile);
  await saveProfiles();
  return updatedProfile;
}

/**
 * Delete a profile
 */
export async function deleteProfile(id) {
  if (id === 'default') {
    throw new Error('Cannot delete default profile');
  }
  
  if (!profileState.profiles.has(id)) {
    throw new Error(`Profile ${id} not found`);
  }
  
  profileState.profiles.delete(id);
  
  // Switch to default profile if deleting active profile
  if (profileState.activeProfileId === id) {
    profileState.activeProfileId = 'default';
  }
  
  await saveProfiles();
}

/**
 * Switch to a different profile
 */
export async function switchProfile(id) {
  if (!profileState.profiles.has(id)) {
    throw new Error(`Profile ${id} not found`);
  }
  
  profileState.activeProfileId = id;
  await chrome.storage.local.set({ activeProfileId: id });
  
  return getActiveProfile();
}

/**
 * Export profiles to JSON
 */
export function exportProfiles() {
  const profiles = Array.from(profileState.profiles.values());
  return JSON.stringify({
    profiles,
    activeProfileId: profileState.activeProfileId
  });
}

/**
 * Import profiles from JSON
 */
export async function importProfiles(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.profiles || !Array.isArray(data.profiles)) {
      throw new Error('Invalid profile data format');
    }
    
    // Clear existing profiles except default
    profileState.profiles.clear();
    profileState.profiles.set('default', DEFAULT_PROFILE);
    
    // Import new profiles
    data.profiles.forEach(profile => {
      if (profile.id !== 'default') {
        profileState.profiles.set(profile.id, {
          ...profile,
          lastModified: Date.now()
        });
      }
    });
    
    // Set active profile if valid
    if (data.activeProfileId && profileState.profiles.has(data.activeProfileId)) {
      profileState.activeProfileId = data.activeProfileId;
    }
    
    await saveProfiles();
    return getActiveProfile();
  } catch (error) {
    console.error('Error importing profiles:', error);
    throw new Error('Failed to import profiles');
  }
}

// Helper function to save profiles to storage
async function saveProfiles() {
  try {
    // Convert Map to object for storage
    const profilesObj = Object.fromEntries(profileState.profiles);
    await chrome.storage.local.set({
      profiles: profilesObj,
      activeProfileId: profileState.activeProfileId
    });
  } catch (error) {
    console.error('Error saving profiles:', error);
    throw new Error('Failed to save profiles');
  }
}

// Helper function to generate unique profile ID
function generateProfileId() {
  return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}