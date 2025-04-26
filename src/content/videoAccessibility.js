/**
 * Video Accessibility Module for Multimodal Accessibility Extension
 * 
 * This module implements video accessibility features including:
 * - Custom accessible video controls overlay
 * - Caption generation and customization
 * - Audio description injection
 * - Video enhancement options
 */

// Import DOMPurify for sanitizing content
import DOMPurify from 'dompurify';

// Import video controls
import { createVideoControls } from './videoControls';

// State for video accessibility features
const videoState = {
  customControlsEnabled: false,
  captionsEnabled: false,
  audioDescriptionEnabled: false,
  videoEnhancementEnabled: false,
  captionStyle: {
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    background: 'rgba(0, 0, 0, 0.75)',
    position: 'bottom' // 'bottom', 'top', 'overlay'
  },
  playbackRate: 1.0,
  videoContrast: 100,
  videoBrightness: 100,
  videoZoom: 100,
  motionReduction: false,
  videoStabilization: false,
  currentVideos: [],
  controlsOverlays: {},
  captionsOverlays: {},
  descriptionAudio: {}
};

/**
 * Initialize video accessibility features
 */
export function initializeVideoAccessibility(state) {
  console.log('Initializing video accessibility features');
  
  // Update state from user preferences
  updateVideoState(state);
  
  // Set up mutation observer to detect new videos
  setupVideoObserver();
  
  // Process existing videos on the page
  processExistingVideos();
  
  // Initialize features based on enabled state
  if (videoState.customControlsEnabled) {
    initializeCustomControls();
  }
  
  if (videoState.captionsEnabled) {
    initializeCaptionSystem();
  }
  
  if (videoState.audioDescriptionEnabled) {
    initializeAudioDescription();
  }
  
  if (videoState.videoEnhancementEnabled) {
    initializeVideoEnhancement();
  }
}

/**
 * Update video state from extension state
 */
function updateVideoState(state) {
  if (state && state.userPreferences && state.userPreferences.video) {
    const prefs = state.userPreferences.video;
    
    videoState.customControlsEnabled = prefs.customControls || false;
    videoState.captionsEnabled = prefs.captions || false;
    videoState.audioDescriptionEnabled = prefs.audioDescription || false;
    videoState.videoEnhancementEnabled = prefs.videoEnhancement || false;
    
    // Update caption style if provided
    if (prefs.captionStyle) {
      videoState.captionStyle = { ...videoState.captionStyle, ...prefs.captionStyle };
    }
    
    // Update video enhancement settings if provided
    if (prefs.videoEnhancement) {
      videoState.playbackRate = prefs.playbackRate || 1.0;
      videoState.videoContrast = prefs.videoContrast || 100;
      videoState.videoBrightness = prefs.videoBrightness || 100;
      videoState.videoZoom = prefs.videoZoom || 100;
      videoState.motionReduction = prefs.motionReduction || false;
      videoState.videoStabilization = prefs.videoStabilization || false;
    }
  }
}

/**
 * Set up mutation observer to detect new videos added to the page
 */
function setupVideoObserver() {
  const observer = new MutationObserver((mutations) => {
    let newVideosAdded = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Check if the added node is a video or contains videos
          if (node.nodeName === 'VIDEO') {
            processVideo(node);
            newVideosAdded = true;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const videos = node.querySelectorAll('video');
            if (videos.length > 0) {
              videos.forEach(video => {
                processVideo(video);
                newVideosAdded = true;
              });
            }
          }
        });
        
        // Check for removed videos to clean up
        mutation.removedNodes.forEach(node => {
          if (node.nodeName === 'VIDEO') {
            removeVideoProcessing(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const videos = node.querySelectorAll('video');
            videos.forEach(video => removeVideoProcessing(video));
          }
        });
      }
    });
    
    // If new videos were added, refresh the features
    if (newVideosAdded) {
      refreshVideoFeatures();
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Process existing videos on the page
 */
function processExistingVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    processVideo(video);
  });
  
  if (videos.length > 0) {
    refreshVideoFeatures();
  }
}

/**
 * Process a single video element
 */
function processVideo(video) {
  // Skip if already processed
  if (videoState.currentVideos.includes(video)) {
    return;
  }
  
  // Add to tracked videos
  videoState.currentVideos.push(video);
  
  // Create and attach custom controls if enabled
  if (videoState.customControlsEnabled) {
    const controls = createVideoControls(video);
    videoState.controlsOverlays[video.id] = controls;
  }
  
  // Add event listeners for video events
  video.addEventListener('play', handleVideoPlay);
  video.addEventListener('pause', handleVideoPause);
  video.addEventListener('timeupdate', handleVideoTimeUpdate);
  video.addEventListener('ratechange', handleVideoRateChange);
  
  // Set initial playback rate if different from default
  if (videoState.playbackRate !== 1.0) {
    video.playbackRate = videoState.playbackRate;
  }
  
  // Apply video enhancements if enabled
  if (videoState.videoEnhancementEnabled) {
    applyVideoEnhancements(video);
  }
  
  console.log('Video processed:', video.src || 'embedded video');
}

/**
 * Remove processing for a video that was removed from the DOM
 */
function removeVideoProcessing(video) {
  // Remove from tracked videos
  const index = videoState.currentVideos.indexOf(video);
  if (index !== -1) {
    videoState.currentVideos.splice(index, 1);
  }
  
  // Remove any associated overlays
  if (videoState.controlsOverlays[video.id]) {
    const overlay = videoState.controlsOverlays[video.id];
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    delete videoState.controlsOverlays[video.id];
  }
  
  if (videoState.captionsOverlays[video.id]) {
    const captionOverlay = videoState.captionsOverlays[video.id];
    if (captionOverlay.parentNode) {
      captionOverlay.parentNode.removeChild(captionOverlay);
    }
    delete videoState.captionsOverlays[video.id];
  }
  
  // Remove any audio description elements
  if (videoState.descriptionAudio[video.id]) {
    const descAudio = videoState.descriptionAudio[video.id];
    if (descAudio.parentNode) {
      descAudio.parentNode.removeChild(descAudio);
    }
    delete videoState.descriptionAudio[video.id];
  }
  
  console.log('Video processing removed:', video.src || 'embedded video');
}

/**
 * Refresh video features when new videos are added
 */
function refreshVideoFeatures() {
  if (videoState.customControlsEnabled) {
    refreshCustomControls();
  }
  
  if (videoState.captionsEnabled) {
    refreshCaptionSystem();
  }
  
  if (videoState.audioDescriptionEnabled) {
    refreshAudioDescription();
  }
  
  if (videoState.videoEnhancementEnabled) {
    refreshVideoEnhancement();
  }
}

/**
 * Handle video play event
 */
function handleVideoPlay(event) {
  const video = event.target;
  console.log('Video play:', video.src || 'embedded video');
  
  // Update custom controls if enabled
  if (videoState.customControlsEnabled && videoState.controlsOverlays[video.id]) {
    const playButton = videoState.controlsOverlays[video.id].querySelector('.accessibility-play-pause');
    if (playButton) {
      playButton.textContent = '⏸️';
      playButton.setAttribute('aria-label', 'Pause');
    }
  }
}

/**
 * Handle video pause event
 */
function handleVideoPause(event) {
  const video = event.target;
  console.log('Video pause:', video.src || 'embedded video');
  
  // Update custom controls if enabled
  if (videoState.customControlsEnabled && videoState.controlsOverlays[video.id]) {
    const playButton = videoState.controlsOverlays[video.id].querySelector('.accessibility-play-pause');
    if (playButton) {
      playButton.textContent = '▶️';
      playButton.setAttribute('aria-label', 'Play');
    }
  }
}

/**
 * Handle video time update event
 */
function handleVideoTimeUpdate(event) {
  const video = event.target;
  
  // Update custom controls progress if enabled
  if (videoState.customControlsEnabled && videoState.controlsOverlays[video.id]) {
    const progressBar = videoState.controlsOverlays[video.id].querySelector('.accessibility-progress');
    if (progressBar) {
      const progress = (video.currentTime / video.duration) * 100;
      progressBar.style.width = `${progress}%`;
    }
    
    const timeDisplay = videoState.controlsOverlays[video.id].querySelector('.accessibility-time');
    if (timeDisplay) {
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    }
  }
  
  // Update captions if enabled
  if (videoState.captionsEnabled && videoState.captionsOverlays[video.id]) {
    updateCaptions(video);
  }
  
  // Check for audio description cues
  if (videoState.audioDescriptionEnabled && videoState.descriptionAudio[video.id]) {
    checkAudioDescriptionCues(video);
  }
}

/**
 * Handle video rate change event
 */
function handleVideoRateChange(event) {
  const video = event.target;
  console.log('Video rate change:', video.playbackRate);
  
  // Update custom controls if enabled
  if (videoState.customControlsEnabled && videoState.controlsOverlays[video.id]) {
    const rateDisplay = videoState.controlsOverlays[video.id].querySelector('.accessibility-rate');
    if (rateDisplay) {
      rateDisplay.textContent = `${video.playbackRate}x`;
    }
  }
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Initialize custom video controls
 */
function initializeCustomControls() {
  console.log('Initializing custom video controls');
  
  // Process all tracked videos
  videoState.currentVideos.forEach(video => {
    createCustomControls(video);
  });
}

/**
 * Create custom controls for a video
 */
function createCustomControls(video) {
  // Skip if already has custom controls
  if (videoState.controlsOverlays[video.id]) {
    return;
  }
  
  // Generate unique ID if needed
  if (!video.id) {
    video.id = 'accessibility-video-' + Math.random().toString(36).substr(2, 9);
  }
  
  // Create controls container
  const controls = document.createElement('div');
  controls.className = 'accessibility-video-controls';
  controls.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
    font-family: Arial, sans-serif;
    font-size: 16px;
  `;
  
  // Create play/pause button
  const playButton = document.createElement('button');
  playButton.className = 'accessibility-play-pause';
  playButton.textContent = video.paused ? '▶️' : '⏸️';
  playButton.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
  playButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 5px 10px;
  `;
  playButton.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
  
  // Create progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'accessibility-progress-container';
  progressContainer.style.cssText = `
    flex-grow: 1;
    height: 10px;
    background-color: #444;
    margin: 0 10px;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  `;
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'accessibility-progress';
  progressBar.style.cssText = `
    height: 100%;
    background-color: #4285F4;
    width: 0%;
    transition: width 0.1s;
  `;
  
  // Add click handler to seek
  progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  });
  
  progressContainer.appendChild(progressBar);
  
  // Create time display
  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'accessibility-time';
  timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
  timeDisplay.style.cssText = `
    margin: 0 10px;
    min-width: 100px;
    text-align: center;
  `;
  
  // Create playback rate control
  const rateControl = document.createElement('div');
  rateControl.className = 'accessibility-rate-control';
  rateControl.style.cssText = `
    display: flex;
    align-items: center;
  `;
  
  const decreaseRate = document.createElement('button');
  decreaseRate.textContent = '-';
  decreaseRate.setAttribute('aria-label', 'Decrease playback rate');
  decreaseRate.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 5px;
  `;
  decreaseRate.addEventListener('click', () => {
    video.playbackRate = Math.max(0.25, video.playbackRate - 0.25);
  });
  
  const rateDisplay = document.createElement('span');
  rateDisplay.className = 'accessibility-rate';
  rateDisplay.textContent = `${video.playbackRate}x`;
  rateDisplay.style.cssText = `
    margin: 0 5px;
    min-width: 40px;
    text-align: center;
  `;
  
  const increaseRate = document.createElement('button');
  increaseRate.textContent = '+';
  increaseRate.setAttribute('aria-label', 'Increase playback rate');
  increaseRate.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 5px;
  `;
  increaseRate.addEventListener('click', () => {
    video.playbackRate = Math.min(4, video.playbackRate + 0.25);
  });
  
  rateControl.appendChild(decreaseRate);
  rateControl.appendChild(rateDisplay);
  rateControl.appendChild(increaseRate);
  
  // Create caption toggle button
  const captionButton = document.createElement('button');
  captionButton.className = 'accessibility-caption-toggle';
  captionButton.textContent = 'CC';
  captionButton.setAttribute('aria-label', videoState.captionsEnabled ? 'Disable captions' : 'Enable captions');
  captionButton.style.cssText = `
    background: ${videoState.captionsEnabled ? '#4285F4' : 'none'};
    border: 1px solid white;
    color: white;
    font-size: 14px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 3px;
    margin-left: 10px;
  `;
  captionButton.addEventListener('click', () => {
    toggleCaptions(video);
    captionButton.style.background = videoState.captionsEnabled ? '#4285F4' : 'none';
  });
  
  // Assemble controls
  controls.appendChild(playButton);
  controls.appendChild(progressContainer);
  controls.appendChild(timeDisplay);
  controls.appendChild(rateControl);
  controls.appendChild(captionButton);
  
  // Position the controls relative to the video
  const videoContainer = video.parentElement;
  videoContainer.style.position = 'relative';
  videoContainer.appendChild(controls);
  
  // Store reference to controls
  videoState.controlsOverlays[video.id] = controls;
  
  // Hide native controls
  video.controls = false;
  
  console.log('Custom controls created for video:', video.src || 'embedded video');
}

/**
 * Refresh custom controls for all videos
 */
function refreshCustomControls() {
  videoState.currentVideos.forEach(video => {
    if (!videoState.controlsOverlays[video.id]) {
      createCustomControls(video);
    }
  });
}

/**
 * Initialize caption system
 */
function initializeCaptionSystem() {
  console.log('Initializing caption system');
  
  // Process all tracked videos
  videoState.currentVideos.forEach(video => {
    createCaptionOverlay(video);
  });
}

/**
 * Create caption overlay for a video
 */
function createCaptionOverlay(video) {
  // Skip if already has caption overlay
  if (videoState.captionsOverlays[video.id]) {
    return;
  }
  
  // Generate unique ID if needed
  if (!video.id) {
    video.id = 'accessibility-video-' + Math.random().toString(36).substr(2, 9);
  }
  
  // Create caption container
  const captionContainer = document.createElement('div');
  captionContainer.className = 'accessibility-caption-container';
  captionContainer.style.cssText = `
    position: absolute;
    ${videoState.captionStyle.position === 'bottom' ? 'bottom: 60px;' : 'top: 20px;'}
    left: 10%;
    width: 80%;
    text-align: center;
    color: ${videoState.captionStyle.color};
    background-color: ${videoState.captionStyle.background};
    padding: 5px 10px;
    border-radius: 5px;
    font-family: ${videoState.captionStyle.fontFamily};
    font-size: ${videoState.captionStyle.fontSize};
    z-index: 9;
    display: ${videoState.captionsEnabled ? 'block' : 'none'};
  `;
  
  // Position the caption container relative to the video
  const videoContainer = video.parentElement;
  videoContainer.style.position = 'relative';
  videoContainer.appendChild(captionContainer);
  
  // Store reference to caption overlay
  videoState.captionsOverlays[video.id] = captionContainer;
  
  console.log('Caption overlay created for video:', video.src || 'embedded video');
}

/**
 * Refresh caption system for all videos
 */
function refreshCaptionSystem() {
  videoState.currentVideos.forEach(video => {
    if (!videoState.captionsOverlays[video.id]) {
      createCaptionOverlay(video);
    }
  });
}

/**
 * Toggle captions on/off
 */
function toggleCaptions(video) {
  videoState.captionsEnabled = !videoState.captionsEnabled;
  
  // Update all caption overlays
  Object.values(videoState.captionsOverlays).forEach(overlay => {
    overlay.style.display = videoState.captionsEnabled ? 'block' : 'none';
  });
  
  console.log(`Captions ${videoState.captionsEnabled ? 'enabled' : 'disabled'}`);
}

/**
 * Update captions based on video time
 */
function updateCaptions(video) {
  if (!videoState.captionsEnabled || !videoState.captionsOverlays[video.id]) {
    return;
  }
  
  // In a real implementation, this would use WebVTT or other caption data
  // For this demo, we'll generate mock captions based on time
  
  const captionOverlay = videoState.captionsOverlays[video.id];
  const currentTime = video.currentTime;
  
  // Mock caption data - in real implementation, this would come from a caption file
  const mockCaptions = [
    { start: 0, end: 5, text: 'This is a sample caption for demonstration purposes.' },
    { start: 5, end: 10, text: 'Captions help make videos accessible to deaf and hard of hearing users.' },
    { start: 10, end: 15, text: 'They also benefit users in noisy environments or those learning a language.' },
    { start: 15, end: 20, text: 'In a real implementation, captions would be loaded from WebVTT or SRT files.' },
    { start: 20, end: 25, text: 'Or generated in real-time using speech recognition technology.' }
  ];
  
  // Find the current caption
  const currentCaption = mockCaptions.find(caption => 
    currentTime >= caption.start && currentTime < caption.end
  );
  
  // Update the caption text
  if (currentCaption) {
    captionOverlay.textContent = currentCaption.text;
    captionOverlay.style.display = 'block';
  } else {
    captionOverlay.textContent = '';
    captionOverlay.style.display = 'none';
  }
}

/**
 * Initialize audio description system
 */
function initializeAudioDescription() {
  console.log('Initializing audio description system');
  
  // Process all tracked videos
  videoState.currentVideos.forEach(video => {
    createAudioDescription(video);
  });
}

/**
 * Create audio description for a video
 */
function createAudioDescription(video) {
  // Skip if already has audio description
  if (videoState.descriptionAudio[video.id]) {
    return;
  }
  
  // Generate unique ID if needed
  if (!video.id) {
    video.id = 'accessibility-video-' + Math.random().toString(36).substr(2, 9);
  }
  
  // Create audio element for descriptions
  const audioElement = document.createElement('audio');
  audioElement.id = `accessibility-description-${video.id}`;
  audioElement.style.display = 'none';
  
  // Add to the page
  document.body.appendChild(audioElement);
  
  // Store reference to audio element
  videoState.descriptionAudio[video.id] = audioElement;
  
  console.log('Audio description created for video:', video.src || 'embedded video');
}

/**
 * Refresh audio description for all videos
 */
function refreshAudioDescription() {
  videoState.currentVideos.forEach(video => {
    if (!videoState.descriptionAudio[video.id]) {
      createAudioDescription(video);
    }
  });
}

/**
 * Check for audio description cues based on video time
 */
function checkAudioDescriptionCues(video) {
  if (!videoState.audioDescriptionEnabled || !videoState.descriptionAudio[video.id]) {
    return;
  }
  
  // In a real implementation, this would use a description track
  // For this demo, we'll use mock description cues
  
  const currentTime = video.currentTime;
  
  // Mock description cues - in real implementation, these would come from a data file
  const mockDescriptions = [
    { time: 2, text: 'A person walks into a room' },
    { time: 8, text: 'They sit down at a desk' },
    { time: 14, text: 'They open a laptop' },
    { time: 22, text: 'They begin typing' }
  ];
  
  // Check if we need to play a description
  mockDescriptions.forEach(desc => {
    if (Math.abs(currentTime - desc.time) < 0.1) {
      playAudioDescription(video, desc.text);
    }
  });
}

/**
 * Play an audio description using text-to-speech
 */
function playAudioDescription(video, text) {
  // In a real implementation, this would either use pre-recorded audio
  // or the Web Speech API for text-to-speech
  
  console.log('Audio description:', text);
  
  // Use Web Speech API if available
  if ('speechSynthesis' in window) {
    // Pause the video during description
    const wasPlaying = !video.paused;
    if (wasPlaying) {
      video.pause();
    }
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2; // Slightly faster than normal
    utterance.onend = () => {
      // Resume video when description ends
      if (wasPlaying) {
        video.play();
      }
    };
    
    // Speak the description
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Initialize video enhancement features
 */
function initializeVideoEnhancement() {
  console.log('Initializing video enhancement');
  
  // Process all tracked videos
  videoState.currentVideos.forEach(video => {
    applyVideoEnhancements(video);
  });
}

/**
 * Apply video enhancements to a video
 */
function applyVideoEnhancements(video) {
  // Apply CSS filters for contrast, brightness, etc.
  updateVideoFilters(video);
  
  // Apply playback rate
  video.playbackRate = videoState.playbackRate;
  
  console.log('Video enhancements applied to:', video.src || 'embedded video');
}

/**
 * Refresh video enhancements for all videos
 */
function refreshVideoEnhancement() {
  videoState.currentVideos.forEach(video => {
    applyVideoEnhancements(video);
  });
}

/**
 * Update video filters based on current settings
 */
function updateVideoFilters(video) {
  // Create CSS filter string
  let filterString = '';
  
  // Add contrast adjustment if not 100%
  if (videoState.videoContrast !== 100) {
    filterString += `contrast(${videoState.videoContrast}%) `;
  }
  
  // Add brightness adjustment if not 100%
  if (videoState.videoBrightness !== 100) {
    filterString += `brightness(${videoState.videoBrightness}%) `;
  }
  
  // Apply filters
  video.style.filter = filterString.trim();
  
  // Apply zoom if not 100%
  if (videoState.videoZoom !== 100) {
    video.style.transform = `scale(${videoState.videoZoom / 100})`;
    video.style.transformOrigin = 'center center';
  } else {
    video.style.transform = '';
  }
}

/**
 * Add video accessibility controls to the main control panel
 */
export function addVideoControlsToPanel() {
  // Check if control panel exists
  const controlPanel = document.getElementById('accessibility-control-panel');
  if (!controlPanel) return;
  
  // Create section header
  const sectionHeader = document.createElement('h3');
  sectionHeader.textContent = 'Video Accessibility';
  sectionHeader.style.cssText = `
    margin: 15px 0 10px 0;
    font-size: 16px;
    color: #333;
  `;
  
  // Create controls container
  const videoControls = document.createElement('div');
  videoControls.className = 'accessibility-video-controls-section';
  videoControls.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;
  
  // Create custom controls toggle
  const customControlsToggle = createToggleButton(
    'Custom Video Controls', 
    videoState.customControlsEnabled,
    () => {
      videoState.customControlsEnabled = !videoState.customControlsEnabled;
      customControlsToggle.classList.toggle('active', videoState.customControlsEnabled);
      
      if (videoState.customControlsEnabled) {
        initializeCustomControls();
      } else {
        // Remove custom controls
        Object.values(videoState.controlsOverlays).forEach(overlay => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        });
        videoState.controlsOverlays = {};
        
        // Restore native controls
        videoState.currentVideos.forEach(video => {
          video.controls = true;
        });
      }
    }
  );
  
  // Create captions toggle
  const captionsToggle = createToggleButton(
    'Captions', 
    videoState.captionsEnabled,
    () => {
      videoState.captionsEnabled = !videoState.captionsEnabled;
      captionsToggle.classList.toggle('active', videoState.captionsEnabled);
      
      if (videoState.captionsEnabled) {
        initializeCaptionSystem();
      } else {
        // Hide caption overlays
        Object.values(videoState.captionsOverlays).forEach(overlay => {
          overlay.style.display = 'none';
        });
      }
    }
  );
  
  // Create audio description toggle
  const audioDescToggle = createToggleButton(
    'Audio Descriptions', 
    videoState.audioDescriptionEnabled,
    () => {
      videoState.audioDescriptionEnabled = !videoState.audioDescriptionEnabled;
      audioDescToggle.classList.toggle('active', videoState.audioDescriptionEnabled);
      
      if (videoState.audioDescriptionEnabled) {
        initializeAudioDescription();
      }
    }
  );
  
  // Create video enhancement toggle
  const enhancementToggle = createToggleButton(
    'Video Enhancements', 
    videoState.videoEnhancementEnabled,
    () => {
      videoState.videoEnhancementEnabled = !videoState.videoEnhancementEnabled;
      enhancementToggle.classList.toggle('active', videoState.videoEnhancementEnabled);
      
      if (videoState.videoEnhancementEnabled) {
        initializeVideoEnhancement();
      } else {
        // Reset video filters
        videoState.currentVideos.forEach(video => {
          video.style.filter = '';
          video.style.transform = '';
          video.playbackRate = 1.0;
        });
      }
    }
  );
  
  // Add enhancement controls if enabled
  let enhancementControls = null;
  if (videoState.videoEnhancementEnabled) {
    enhancementControls = createEnhancementControls();
  }
  
  // Assemble panel
  videoControls.appendChild(customControlsToggle);
  videoControls.appendChild(captionsToggle);
  videoControls.appendChild(audioDescToggle);
  videoControls.appendChild(enhancementToggle);
  
  if (enhancementControls) {
    videoControls.appendChild(enhancementControls);
  }
  
  // Add to control panel
  controlPanel.appendChild(sectionHeader);
  controlPanel.appendChild(videoControls);
}

/**
 * Create a toggle button for the control panel
 */
function createToggleButton(label, isActive, onClickHandler) {
  const button = document.createElement('button');
  button.className = `accessibility-control-button ${isActive ? 'active' : ''}`;
  button.textContent = label;
  button.style.cssText = `
    background-color: ${isActive ? '#4285F4' : '#f1f1f1'};
    color: ${isActive ? 'white' : '#333'};
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  `;
  
  button.addEventListener('click', onClickHandler);
  
  return button;
}

/**
 * Create enhancement controls for the panel
 */
function createEnhancementControls() {
  const container = document.createElement('div');
  container.className = 'accessibility-enhancement-controls';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
  `;
  
  // Create contrast slider
  const contrastControl = createSliderControl(
    'Contrast', 
    videoState.videoContrast, 
    50, 150,
    (value) => {
      videoState.videoContrast = value;
      videoState.currentVideos.forEach(video => {
        updateVideoFilters(video);
      });
    }
  );
  
  // Create brightness slider
  const brightnessControl = createSliderControl(
    'Brightness', 
    videoState.videoBrightness, 
    50, 150,
    (value) => {
      videoState.videoBrightness = value;
      videoState.currentVideos.forEach(video => {
        updateVideoFilters(video);
      });
    }
  );
  
  // Create zoom slider
  const zoomControl = createSliderControl(
    'Zoom', 
    videoState.videoZoom, 
    100, 200,
    (value) => {
      videoState.videoZoom = value;
      videoState.currentVideos.forEach(video => {
        updateVideoFilters(video);
      });
    }
  );
  
  // Create playback rate control
  const rateControl = createSliderControl(
    'Playback Speed', 
    videoState.playbackRate * 100, 
    25, 200,
    (value) => {
      videoState.playbackRate = value / 100;
      videoState.currentVideos.forEach(video => {
        video.playbackRate = videoState.playbackRate;
      });
    },
    (value) => `${(value / 100).toFixed(2)}x`
  );
  
  // Assemble controls
  container.appendChild(contrastControl);
  container.appendChild(brightnessControl);
  container.appendChild(zoomControl);
  container.appendChild(rateControl);
  
  return container;
}

/**
 * Create a slider control with label
 */
function createSliderControl(label, initialValue, min, max, onChange, formatValue) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 5px;
  `;
  
  // Create label
  const labelElement = document.createElement('label');
  labelElement.textContent = label;
  labelElement.style.cssText = `
    font-size: 14px;
    color: #333;
  `;
  
  // Create slider row
  const sliderRow = document.createElement('div');
  sliderRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  
  // Create slider
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.value = initialValue;
  slider.style.cssText = `
    flex-grow: 1;
  `;
  
  // Create value display
  const valueDisplay = document.createElement('span');
  valueDisplay.textContent = formatValue ? formatValue(initialValue) : initialValue;
  valueDisplay.style.cssText = `
    min-width: 40px;
    text-align: right;
    font-size: 14px;
  `;
  
  // Add event listener
  slider.addEventListener('input', () => {
    const value = parseInt(slider.value, 10);
    valueDisplay.textContent = formatValue ? formatValue(value) : value;
    onChange(value);
  });
  
  // Assemble control
  sliderRow.appendChild(slider);
  sliderRow.appendChild(valueDisplay);
  container.appendChild(labelElement);
  container.appendChild(sliderRow);
  
  return container;
}