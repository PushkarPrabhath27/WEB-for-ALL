/**
 * Video Controls Module for Video Accessibility
 * 
 * This module implements custom video controls overlay with keyboard shortcuts
 * and visual feedback for enhanced accessibility.
 */

// Import DOMPurify for sanitizing content
import DOMPurify from 'dompurify';

// State for video controls
const controlsState = {
  visible: false,
  keyboardMode: false,
  currentFocus: null,
  overlayTimeout: null,
  shortcuts: {
    togglePlay: 'Space',
    toggleMute: 'm',
    volumeUp: 'ArrowUp',
    volumeDown: 'ArrowDown',
    seekForward: 'ArrowRight',
    seekBackward: 'ArrowLeft',
    toggleCaptions: 'c',
    toggleDescription: 'd',
    toggleControls: 'Tab'
  }
};

/**
 * Create and attach custom controls overlay to a video element
 */
export function createVideoControls(video) {
  // Create controls container
  const controls = document.createElement('div');
  controls.className = 'video-accessibility-controls';
  controls.setAttribute('role', 'region');
  controls.setAttribute('aria-label', 'Video Controls');
  
  // Add control buttons
  controls.innerHTML = DOMPurify.sanitize(`
    <div class="controls-row primary-controls">
      <button class="control-button play-pause" aria-label="Play">
        <svg class="play-icon" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="pause-icon" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>
      
      <div class="time-slider" role="slider" aria-label="Time Slider" tabindex="0">
        <div class="slider-track">
          <div class="slider-fill"></div>
        </div>
        <div class="slider-thumb" role="presentation"></div>
      </div>
      
      <div class="time-display" role="status" aria-live="off">
        <span class="current-time">0:00</span>
        <span class="duration">0:00</span>
      </div>
    </div>
    
    <div class="controls-row secondary-controls">
      <div class="volume-control">
        <button class="control-button mute" aria-label="Mute">
          <svg viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <div class="volume-slider" role="slider" aria-label="Volume" tabindex="0">
          <div class="slider-track">
            <div class="slider-fill"></div>
          </div>
          <div class="slider-thumb" role="presentation"></div>
        </div>
      </div>
      
      <div class="accessibility-controls">
        <button class="control-button captions" aria-label="Toggle Captions">
          <svg viewBox="0 0 24 24">
            <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v-2zm7 0h-1.5v-.5h-2v3h2V13H18v-2z"/>
          </svg>
        </button>
        
        <button class="control-button description" aria-label="Toggle Audio Description">
          <svg viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </button>
      </div>
    </div>
  `);
  
  // Position the controls
  positionControls(video, controls);
  
  // Add event listeners
  setupControlsEventListeners(video, controls);
  
  // Add keyboard support
  setupKeyboardSupport(video, controls);
  
  return controls;
}

/**
 * Position controls relative to video
 */
function positionControls(video, controls) {
  // Get video dimensions and position
  const videoRect = video.getBoundingClientRect();
  
  // Style the controls
  controls.style.width = `${videoRect.width}px`;
  controls.style.bottom = '0';
  controls.style.left = '0';
  
  // Add to video container
  video.parentElement.style.position = 'relative';
  video.parentElement.appendChild(controls);
}

/**
 * Set up event listeners for controls
 */
function setupControlsEventListeners(video, controls) {
  // Play/Pause button
  const playButton = controls.querySelector('.play-pause');
  playButton.addEventListener('click', () => togglePlay(video));
  
  // Time slider
  const timeSlider = controls.querySelector('.time-slider');
  setupTimeSlider(video, timeSlider);
  
  // Volume controls
  const muteButton = controls.querySelector('.mute');
  const volumeSlider = controls.querySelector('.volume-slider');
  setupVolumeControls(video, muteButton, volumeSlider);
  
  // Caption toggle
  const captionButton = controls.querySelector('.captions');
  captionButton.addEventListener('click', () => toggleCaptions(video));
  
  // Audio description toggle
  const descriptionButton = controls.querySelector('.description');
  descriptionButton.addEventListener('click', () => toggleDescription(video));
  
  // Show/hide controls on hover
  video.parentElement.addEventListener('mouseenter', () => showControls(controls));
  video.parentElement.addEventListener('mouseleave', () => hideControls(controls));
  
  // Update controls state on video events
  video.addEventListener('play', () => updatePlayState(video, controls));
  video.addEventListener('pause', () => updatePlayState(video, controls));
  video.addEventListener('timeupdate', () => updateTimeDisplay(video, controls));
  video.addEventListener('volumechange', () => updateVolumeState(video, controls));
}

/**
 * Set up keyboard support for video controls
 */
function setupKeyboardSupport(video, controls) {
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Only handle shortcuts when video is focused or in keyboard mode
    if (!controlsState.keyboardMode && !video.contains(document.activeElement)) {
      return;
    }
    
    switch (event.key) {
      case controlsState.shortcuts.togglePlay:
        event.preventDefault();
        togglePlay(video);
        break;
        
      case controlsState.shortcuts.toggleMute:
        event.preventDefault();
        toggleMute(video);
        break;
        
      case controlsState.shortcuts.volumeUp:
        event.preventDefault();
        adjustVolume(video, 0.1);
        break;
        
      case controlsState.shortcuts.volumeDown:
        event.preventDefault();
        adjustVolume(video, -0.1);
        break;
        
      case controlsState.shortcuts.seekForward:
        event.preventDefault();
        seekVideo(video, 5);
        break;
        
      case controlsState.shortcuts.seekBackward:
        event.preventDefault();
        seekVideo(video, -5);
        break;
        
      case controlsState.shortcuts.toggleCaptions:
        event.preventDefault();
        toggleCaptions(video);
        break;
        
      case controlsState.shortcuts.toggleDescription:
        event.preventDefault();
        toggleDescription(video);
        break;
    }
  });
  
  // Handle focus management
  controls.addEventListener('focusin', () => {
    controlsState.keyboardMode = true;
    showControls(controls);
  });
  
  controls.addEventListener('focusout', (event) => {
    if (!controls.contains(event.relatedTarget)) {
      controlsState.keyboardMode = false;
      hideControls(controls);
    }
  });
}

/**
 * Control visibility functions
 */
function showControls(controls) {
  clearTimeout(controlsState.overlayTimeout);
  controls.style.opacity = '1';
  controlsState.visible = true;
}

function hideControls(controls) {
  if (controlsState.keyboardMode) return;
  
  controlsState.overlayTimeout = setTimeout(() => {
    controls.style.opacity = '0';
    controlsState.visible = false;
  }, 2000);
}

/**
 * Video control functions
 */
function togglePlay(video) {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function toggleMute(video) {
  video.muted = !video.muted;
}

function adjustVolume(video, change) {
  video.volume = Math.max(0, Math.min(1, video.volume + change));
}

function seekVideo(video, seconds) {
  video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
}

function toggleCaptions(video) {
  // Toggle captions if available
  const track = video.textTracks[0];
  if (track) {
    track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
  }
}

function toggleDescription(video) {
  // Toggle audio description if available
  const descriptionTrack = Array.from(video.textTracks)
    .find(track => track.kind === 'descriptions');
  
  if (descriptionTrack) {
    descriptionTrack.mode = descriptionTrack.mode === 'showing' ? 'hidden' : 'showing';
  }
}

/**
 * Update control states
 */
function updatePlayState(video, controls) {
  const playButton = controls.querySelector('.play-pause');
  playButton.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
  playButton.classList.toggle('playing', !video.paused);
}

function updateTimeDisplay(video, controls) {
  const currentTime = controls.querySelector('.current-time');
  const duration = controls.querySelector('.duration');
  
  currentTime.textContent = formatTime(video.currentTime);
  duration.textContent = formatTime(video.duration);
  
  // Update time slider
  const timeSlider = controls.querySelector('.time-slider');
  const progress = (video.currentTime / video.duration) * 100;
  timeSlider.querySelector('.slider-fill').style.width = `${progress}%`;
  timeSlider.querySelector('.slider-thumb').style.left = `${progress}%`;
}

function updateVolumeState(video, controls) {
  const muteButton = controls.querySelector('.mute');
  const volumeSlider = controls.querySelector('.volume-slider');
  
  muteButton.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
  muteButton.classList.toggle('muted', video.muted);
  
  const volumeLevel = video.muted ? 0 : video.volume * 100;
  volumeSlider.querySelector('.slider-fill').style.width = `${volumeLevel}%`;
  volumeSlider.querySelector('.slider-thumb').style.left = `${volumeLevel}%`;
}

/**
 * Utility functions
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}